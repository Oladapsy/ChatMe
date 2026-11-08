import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const KEY = "chatme.device-pin.v1";
type PinRecord = { salt: string; hash: string; prompted: boolean; failures: number; retryAt: number };
let record: PinRecord = { salt: "", hash: "", prompted: false, failures: 0, retryAt: 0 };
const persist = () => SecureStore.setItemAsync(KEY, JSON.stringify(record));
const digest = (pin: string, salt: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
export const usePinStore = create<{
  ready: boolean; enabled: boolean; prompted: boolean; locked: boolean;
  initialize: () => Promise<void>; dismissPrompt: () => Promise<void>;
  setup: (pin: string) => Promise<void>; verify: (pin: string) => Promise<boolean>;
  disable: () => Promise<void>; lock: () => void;
}>((set) => ({
  ready: false, enabled: false, prompted: false, locked: false,
  initialize: async () => {
    const saved = await SecureStore.getItemAsync(KEY);
    if (saved) record = JSON.parse(saved);
    set({ ready: true, enabled: !!record.hash, prompted: record.prompted, locked: !!record.hash });
  },
  dismissPrompt: async () => { record = { ...record, prompted: true }; await persist(); set({ prompted: true }); },
  setup: async pin => {
    if (!/^\d{4}$/.test(pin)) throw new Error("Enter a four-digit PIN.");
    const salt = Crypto.randomUUID();
    record = { salt, hash: await digest(pin, salt), prompted: true, failures: 0, retryAt: 0 };
    await persist();
    set({ enabled: true, prompted: true, locked: false });
  },
  verify: async pin => {
    if (Date.now() < record.retryAt) throw new Error("Too many attempts. Try again in a minute.");
    const valid = !!record.hash && await digest(pin, record.salt) === record.hash;
    record = { ...record, failures: valid ? 0 : record.failures + 1, retryAt: !valid && record.failures >= 4 ? Date.now() + 60000 : 0 };
    await persist();
    if (valid) set({ locked: false });
    return valid;
  },
  disable: async () => {
    record = { salt: "", hash: "", prompted: true, failures: 0, retryAt: 0 };
    await persist(); set({ enabled: false, locked: false, prompted: true });
  },
  lock: () => set(state => ({ locked: state.enabled })),
}));
