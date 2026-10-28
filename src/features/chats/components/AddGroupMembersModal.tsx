import React, { useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, View } from "react-native";

import type { Contact } from "@/features/contacts/data/mockContacts";
import type { GroupConversation } from "@/features/chats/types/chat";
import { addGroupMembers } from "@/features/chats/api/chatApi";
import { AddParticipantsStep } from "./AddParticipantsStep";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import MySafeAreaView from "@/shared/components/MySafeAreaView";

interface AddGroupMembersModalProps {
  visible: boolean;
  conversationId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onMembersAdded?: (updatedGroup: GroupConversation) => void;
}

export function AddGroupMembersModal({
  visible,
  conversationId,
  existingMemberIds,
  onClose,
  onMembersAdded,
}: AddGroupMembersModalProps) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColors } = useAppTheme();

  useEffect(() => {
    if (visible) {
      setSelectedContacts([]);
    }
  }, [visible, conversationId]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts((current) => {
      const alreadySelected = current.some((item) => item.id === contact.id);

      return alreadySelected
        ? current.filter((item) => item.id !== contact.id)
        : [...current, contact];
    });
  };

  const handleAddMembers = async () => {
    if (selectedContacts.length === 0 || isSubmitting) {
      return;
    }

    const participantIds = [
      ...new Set(
        selectedContacts
          .map((contact) => contact.id)
          .filter((id) => !existingMemberIds.includes(id)),
      ),
    ];

    if (participantIds.length === 0) {
      Alert.alert(
        "No new members",
        "Select people who are not already in this group.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedGroup = await addGroupMembers(conversationId, {
        participantIds,
      });

      onMembersAdded?.(updatedGroup);
      setSelectedContacts([]);
      onClose();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Could not add members. Please try again.";

      Alert.alert("Unable to add members", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <MySafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.header}>
          <Typography variant="h2" weight="bold" color={themeColors.text}>
            Add group members
          </Typography>

          <Typography variant="body" color={themeColors.textSecondary}>
            Select the people you want to add to this group.
          </Typography>
        </View>

        <View style={styles.content}>
          <AddParticipantsStep
            selectedContacts={selectedContacts}
            onToggleContact={handleToggleContact}
            onNext={handleAddMembers}
            existingMemberIds={existingMemberIds}
            actionLabel={isSubmitting ? "Adding members..." : "Add members"}
            isSubmitting={isSubmitting}
          />
        </View>
      </MySafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 8,
  },
  content: {
    flex: 1,
  },
});
