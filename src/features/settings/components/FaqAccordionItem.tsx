import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import PlusIcon from "@/assets/icons/shared/plus.svg";
import MinusIcon from "@/assets/icons/shared/minus.svg";

interface FaqAccordionItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FaqAccordionItem({
  question,
  answer,
  isExpanded,
  onToggle,
}: FaqAccordionItemProps) {
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Typography
          size={16}
          weight="bold"
          color={themeColors.text}
          style={styles.title}
        >
          {question}
        </Typography>

        <View
          style={[
            styles.iconCircle,
            isExpanded
              ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
              : { backgroundColor: "transparent", borderColor: themeColors.primary },
          ]}
        >
          {isExpanded ? (
            <MinusIcon
              width={14}
              height={14}
              color="#FFFFFF"
              fill="#FFFFFF"
            />
          ) : (
            <PlusIcon
              width={14}
              height={14}
              color={themeColors.primary}
              fill={themeColors.primary}
            />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Typography
          size={14}
          color={isDark ? themeColors.descText : "#8EA3B3"}
          style={styles.answerText}
        >
          {answer}
        </Typography>
      )}

      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? "#1C2930" : "#F0F4F8" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: {
    flex: 1,
    lineHeight: 22,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  answerText: {
    marginTop: 10,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginTop: 16,
  },
});