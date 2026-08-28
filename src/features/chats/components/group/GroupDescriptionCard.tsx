import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

interface Props {
  description: string;
}

export function GroupDescriptionCard({ description }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Typography
        size={18}
        weight="bold"
        color={themeColors.descText}
        style={styles.title}
      >
        Description
      </Typography>

      <Typography
        size={15}
        color={themeColors.textSecondary}
        numberOfLines={isExpanded ? undefined : 2}
        style={styles.description}
      >
        {description}
      </Typography>

      {description.length > 80 && (
        <TouchableOpacity
          onPress={() => setIsExpanded((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Typography
            size={14}
            weight="medium"
            color={themeColors.primary}
            style={styles.readMore}
          >
            {isExpanded ? "Show less" : "Read more"}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  readMore: {
    marginTop: 4,
  },
});
