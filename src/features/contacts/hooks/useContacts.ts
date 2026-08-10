import { useState, useEffect, useCallback } from "react";
import * as Contacts from "expo-contacts";
import { MOCK_CONTACTS } from "../data/mockContacts";

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnApp: boolean;
}

export function useContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        setPermissionGranted(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
          ],
        });

        if (data.length > 0) {
          // Normalize and map native device contacts
          const formatted: ContactItem[] = data
            .filter((c) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
            .map((c) => {
              const rawPhone = c.phoneNumbers![0].number || "";
              // Mock check against registered users database:
              const isRegistered = MOCK_CONTACTS.some(
                (mock) => mock.phone.replace(/\D/g, "") === rawPhone.replace(/\D/g, "")
              );

              return {
                id: c.id,
                name: c.name,
                phone: rawPhone,
                avatar: c.imageAvailable ? c.image?.uri : undefined,
                isOnApp: isRegistered,
              };
            });

          setContacts(formatted);
          return;
        }
      }

      // Fallback to mock data if permissions are denied or simulator has no contacts
      setPermissionGranted(false);
      setContacts(
        MOCK_CONTACTS.map((c) => ({
          ...c,
          isOnApp: true,
        }))
      );
    } catch (error) {
      console.warn("Failed to load native contacts:", error);
      // Fallback on error
      setContacts(
        MOCK_CONTACTS.map((c) => ({
          ...c,
          isOnApp: true,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, permissionGranted, refetch: fetchContacts };
}