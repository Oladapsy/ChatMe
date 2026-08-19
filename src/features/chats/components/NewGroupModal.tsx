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
import { GroupStepIndicator } from "./GroupStepIndicator";
import { AddParticipantsStep } from "./AddParticipantsStep";
import { NameGroupStep } from "./NameGroupStep";
import { Contact } from "@/features/contacts/data/mockContacts";

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
        : [...prev, contact]
    );
  };

  const handleReset = () => {
    setStep(1);
    setSelectedContacts([]);
    onClose();
  };

  const handleCreate = (data: { name: string; description: string; imageUri?: string }) => {
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
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={[
                styles.sheet,
                { backgroundColor: isDark ? "#081C2C" : "#FFFFFF" },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleWrapper}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#254156" : "#E5E7EB" },
                  ]}
                />
              </View>

              {/* Progress Indicator */}
              <GroupStepIndicator currentStep={step} isDark={isDark} />

              {/* Step Flow */}
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "85%",
    height: 600,
  },
  handleWrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});