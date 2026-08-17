import { useState, useEffect, useCallback } from "react";
import { Contact, ContactField, requestPermissionsAsync } from "expo-contacts";
import { MOCK_CONTACTS } from "@/features/contacts/data/mockContacts";

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnApp: boolean;
}

// console.log(ContactField)
// Fields helps to uptimize the fetch
// it's an optimized bulk-fetch path and it avoids building full Contact instances.

const FIELDS = [
  ContactField.FULL_NAME,
  ContactField.PHONES,
  ContactField.IMAGE,
] as const;
// console.log(FIELDS)

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function useContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);

      const { status } = await requestPermissionsAsync();

      if (status === "granted") {
        setPermissionGranted(true);

        // getAllDetails returns plain projected objects: { id, fullName, phones, image }
        // no async getters needed since we asked for a flat field projection
        const deviceContacts = await Contact.getAllDetails(FIELDS);
        // console.log(deviceContacts)

        if (deviceContacts.length > 0) {
          const formatted: ContactItem[] = deviceContacts
            .filter((c) => c.fullName && c.phones && c.phones.length > 0)
            .map((c) => {
              const rawPhone = c.phones[0]?.number ?? "";
              const isRegistered = MOCK_CONTACTS.some(
                (mock) =>
                  normalizePhone(mock.phone) === normalizePhone(rawPhone),
              );

              return {
                id: c.id,
                name: c.fullName ?? "Unknown",
                phone: rawPhone,
                avatar: c.image ?? undefined,
                isOnApp: isRegistered,
              };
            });

          setContacts(formatted);
          return;
        }
      }

      // Fallback: permission denied or no device contacts (like for simulators)
      setPermissionGranted(false);
      setContacts(MOCK_CONTACTS.map((c) => ({ ...c, isOnApp: true })));
    } catch (error) {
      console.warn("Failed to load native contacts:", error);
      setContacts(MOCK_CONTACTS.map((c) => ({ ...c, isOnApp: true })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, permissionGranted, refetch: fetchContacts };
}
