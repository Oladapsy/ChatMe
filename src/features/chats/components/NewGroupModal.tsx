import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Colors } from "@/shared/constants/colors";
import { GroupStepIndicator } from "@/features/chats/components/GroupStepIndicator";
import { NameGroupStep } from "@/features/chats/components/NameGroupStep";
import { AddParticipantsStep } from "@/features/chats/components/AddParticipantsStep";
import { Contact } from "@/features/contacts/data/mockContacts";
import { Typography } from "@/shared/components/Typography";
import BackIcon from "@/assets/icons/shared/chevron-left.svg"; // Adjust path if needed

interface Props {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: (groupData: {
    name: string;
    description: string;
    imageUri?: string;
    members: Contact[];
  }) => void;
}

export function NewGroupModal({ visible, onClose, onGroupCreated }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact],
    );
  };

  const handleReset = () => {
    setStep(1);
    setSelectedContacts([]);
    onClose();
  };

  const handleCreate = (data: {
    name: string;
    description: string;
    imageUri?: string;
  }) => {
    onGroupCreated({
      ...data,
      members: selectedContacts,
    });
    handleReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleReset}
    >
      <TouchableWithoutFeedback onPress={handleReset}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={[
                styles.sheet,
                {
                  backgroundColor: isDark ? "#0D1F2D" : themeColors.background,
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleWrapper}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#2C485D" : "#DDE2E8" },
                  ]}
                />
              </View>

              {/* Header Row with Back Button */}
              <View style={styles.headerRow}>
                {step === 2 ? (
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <BackIcon
                      width={20}
                      height={20}
                      color={isDark ? "#FFFFFF" : "#081C2C"}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.backPlaceholder} />
                )}

                <Typography
                  size={18}
                  weight="bold"
                  align="center"
                  color={isDark ? "white" : "#081C2C"}
                >
                  {step === 1 ? (
                    <>
                      Add participants{" "}
                      {selectedContacts.length > 0 && (
                        <Typography size={18} weight="bold" color="#57B77D">
                          ({selectedContacts.length})
                        </Typography>
                      )}
                    </>
                  ) : (
                    "New Group"
                  )}
                </Typography>

                <View style={styles.backPlaceholder} />
              </View>

              {/* Progress Indicator */}
              <GroupStepIndicator currentStep={step} isDark={isDark} />

              {/* Step Content */}
              <View style={styles.contentContainer}>
                {step === 1 ? (
                  <AddParticipantsStep
                    selectedContacts={selectedContacts}
                    onToggleContact={handleToggleContact}
                    onNext={() => setStep(2)}
                    isDark={isDark}
                  />
                ) : (
                  <NameGroupStep onCreate={handleCreate} isDark={isDark} />
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28, // Extra bottom padding for home bar
    height: 660,
  },
  handleWrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backPlaceholder: {
    width: 32,
  },
  contentContainer: {
    flex: 1,
  },
});
