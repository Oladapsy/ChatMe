import { useState, useEffect, useCallback } from "react";
import { Contact, ContactField, requestPermissionsAsync } from "expo-contacts";

import { MOCK_CONTACTS } from "@/features/contacts/data/mockContacts";
import { matchContacts } from "@/features/contacts/api/discoveryApi";

export interface ContactItem {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnApp: boolean;
}

const FIELDS = [
  ContactField.FULL_NAME,
  ContactField.PHONES,
  ContactField.IMAGE,
] as const;

/**
 * Normalize Nigerian phone numbers to E.164 format.
 *
 * Examples:
 * 08012345678    -> +2348012345678
 * 2348012345678  -> +2348012345678
 * +2348012345678 -> +2348012345678
 *
 * Returns null when the number cannot safely be normalized.
 */
function toE164Nigeria(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  let internationalDigits: string;

  if (trimmed.startsWith("+")) {
    internationalDigits = digits;
  } else if (trimmed.startsWith("00")) {
    internationalDigits = digits.slice(2);
  } else if (digits.startsWith("234")) {
    internationalDigits = digits;
  } else if (digits.startsWith("0") && digits.length === 11) {
    internationalDigits = `234${digits.slice(1)}`;
  } else {
    // Don't guess the country code for an ambiguous number.
    return null;
  }

  // E.164 numbers contain at most 15 digits and cannot start with zero.
  if (
    internationalDigits.length < 8 ||
    internationalDigits.length > 15 ||
    internationalDigits.startsWith("0")
  ) {
    return null;
  }

  // Nigerian numbers in this implementation must have 13 digits
  // after removing the leading "+".
  if (
    internationalDigits.startsWith("234") &&
    internationalDigits.length !== 13
  ) {
    return null;
  }

  return `+${internationalDigits}`;
}

function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function useContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const fetchContacts = useCallback(async () => {
    let deviceContacts: ContactItem[] = [];

    try {
      setLoading(true);

      const { status } = await requestPermissionsAsync();

      if (status !== "granted") {
        setPermissionGranted(false);

        // These are mock contacts, not verified ChatMe users.
        setContacts(
          MOCK_CONTACTS.map((contact) => ({
            ...contact,
            userId: undefined,
            isOnApp: false,
          })),
        );

        return;
      }

      setPermissionGranted(true);

      // Read contacts from the device using the API supported
      // by the installed expo-contacts version.
      const result = await Contact.getAllDetails(FIELDS);

      deviceContacts = result
        .filter(
          (contact) =>
            Boolean(contact.fullName) &&
            Boolean(contact.phones?.some((phone) => phone.number)),
        )
        .map((contact) => ({
          id: contact.id,
          name: contact.fullName ?? "Unknown",
          phone: contact.phones?.find((phone) => phone.number)?.number ?? "",
          avatar: contact.image ?? undefined,
          isOnApp: false,
        }));

      if (deviceContacts.length === 0) {
        setContacts([]);
        return;
      }

      // Normalize numbers and remove duplicates before sending them
      // to the backend, which expects E.164 phone numbers.
      const validPhoneNumbers = [
        ...new Set(
          deviceContacts
            .map((contact) => toE164Nigeria(contact.phone))
            .filter((phone): phone is string => phone !== null),
        ),
      ];

      if (validPhoneNumbers.length === 0) {
        setContacts(deviceContacts);
        return;
      }

      const { matches } = await matchContacts(validPhoneNumbers);

      // Index matched users by their normalized phone numbers.
      const matchesByPhone = new Map(
        matches.map((match) => [
          phoneKey(match.matchedPhoneNumber),
          match.user,
        ]),
      );

      // Attach the registered user's details to each matching
      // device contact. Keep the device contact ID separate from
      // the backend user ID.
      const matchedContacts = deviceContacts.map((contact) => {
        const normalizedPhone = toE164Nigeria(contact.phone);

        if (!normalizedPhone) {
          return contact;
        }

        const user = matchesByPhone.get(phoneKey(normalizedPhone));

        if (!user) {
          return contact;
        }

        return {
          ...contact,
          userId: user.id,
          name: user.displayName,
          avatar: user.avatarUrl ?? contact.avatar,
          isOnApp: true,
        };
      });

      setContacts(matchedContacts);
    } catch (error) {
      console.error("CONTACT MATCHING FAILED:", error);

      // If matching fails, keep real device contacts visible,
      // but don't incorrectly mark them as registered users.
      if (deviceContacts.length > 0) {
        setContacts(deviceContacts);
      } else {
        setContacts(
          MOCK_CONTACTS.map((contact) => ({
            ...contact,
            userId: undefined,
            isOnApp: false,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    permissionGranted,
    refetch: fetchContacts,
  };
}
