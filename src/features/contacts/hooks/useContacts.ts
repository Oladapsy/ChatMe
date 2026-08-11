// import { useState, useEffect, useCallback } from "react";
// import * as Contacts from "expo-contacts";
// import { Contact, ContactField } from "expo-contacts";
// import { MOCK_CONTACTS } from "@/features/contacts/data/mockContacts";

// export interface ContactItem {
//   id: string;
//   name: string;
//   phone: string;
//   avatar?: string;
//   isOnApp: boolean;
// }

// export function useContacts() {
//   const [contacts, setContacts] = useState<ContactItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [permissionGranted, setPermissionGranted] = useState(false);

//   const fetchContacts = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { status } = await Contacts.requestPermissionsAsync();

//       // not granted i dont know maybe i should tell them to give
//       // permission or request it again
//       if (status !== "granted") {
//         console.log("we need your permission to access contact");
//         alert("we need your permission to access contact");
//       }
//       // when granted
//       if (status === "granted") {
//         setPermissionGranted(true);

//         // Fetch contacts using modern API

//         const deviceContacts = await Contacts.Contact.getAll();
//         console.log(deviceContacts);

//         if (deviceContacts && deviceContacts.length > 0) {
//           const formatted: ContactItem[] = deviceContacts
//             .filter((c: any) => {
//               const name = c.name || c.displayName || c.fullName;
//               const phones = c.phones || c.phoneNumbers;
//               return Boolean(name && phones && phones.length > 0);
//             })
//             .map((c: any) => {
//               const name = c.name || c.displayName || c.fullName || "Unknown";
//               const phones = c.phones || c.phoneNumbers || [];
//               const rawPhone = phones[0]?.number || phones[0]?.digits || "";

//               // Image resolution for new/legacy property names
//               const avatarUri =
//                 c.image?.uri || c.rawImage?.uri || c.thumbnail?.uri;

//               // Check against mock backend database
//               const isRegistered = MOCK_CONTACTS.some(
//                 (mock) =>
//                   mock.phone.replace(/\D/g, "") === rawPhone.replace(/\D/g, ""),
//               );

//               return {
//                 id: c.id || Math.random().toString(),
//                 name,
//                 phone: rawPhone,
//                 avatar: avatarUri,
//                 isOnApp: isRegistered,
//               };
//             });

//           setContacts(formatted);
//           return;
//         }
//       }

//       // Fallback if no device contacts found or permission denied
//       setPermissionGranted(false);
//       setContacts(
//         MOCK_CONTACTS.map((c) => ({
//           ...c,
//           isOnApp: true,
//         })),
//       );
//     } catch (error) {
//       console.warn("Failed to load native contacts:", error);
//       setContacts(
//         MOCK_CONTACTS.map((c) => ({
//           ...c,
//           isOnApp: true,
//         })),
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchContacts();
//   }, [fetchContacts]);

//   return { contacts, loading, permissionGranted, refetch: fetchContacts };
// }

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