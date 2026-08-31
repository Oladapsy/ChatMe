import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// Icons
import IncomingCallIcon from "@/assets/icons/calls/incoming.svg";
import OutgoingCallIcon from "@/assets/icons/calls/outgoing.svg";
import MissedCallIcon from "@/assets/icons/calls/missed.svg";
import InfoIcon from "@/assets/icons/shared/info.svg";

export type CallType = "incoming" | "outgoing" | "missed";

export interface CallLog {
  id: string;
  name: string;
  avatar: string;
  type: CallType;
  time: string;
}

interface CallItemProps {
  item: CallLog;
  onPress?: () => void;
  onInfoPress?: () => void;
  showDivider?: boolean;
}

export function CallItem({
  item,
  onPress,
  onInfoPress,
  showDivider = true,
}: CallItemProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const renderCallIcon = () => {
    switch (item.type) {
      case "incoming":
        return <IncomingCallIcon width={14} height={14} color="#8EA3B3" />;
      case "outgoing":
        return <OutgoingCallIcon width={14} height={14} color="#8EA3B3" />;
      case "missed":
        return (
          <MissedCallIcon width={14} height={14} color={Colors.light.error} />
        );
    }
  };

  const getCallTypeLabel = () => {
    switch (item.type) {
      case "incoming":
        return "Incoming";
      case "outgoing":
        return "Outgoing";
      case "missed":
        return "Missed Call";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      {/* Main Info Box with Bottom Border */}
      <View
        style={[
          styles.contentRight,
          showDivider && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#3A566A" : "#EAEEF2",
          },
        ]}
      >
        <View style={styles.infoCol}>
          <Typography size={16} weight="bold" color={themeColors.text}>
            {item.name}
          </Typography>

          <View style={styles.typeRow}>
            {renderCallIcon()}
            <Typography
              size={12}
              color={
                item.type === "missed"
                  ? Colors.light.error
                  : themeColors.textSecondary
              }
              style={{ marginLeft: 4 }}
            >
              {getCallTypeLabel()}
            </Typography>
          </View>
        </View>

        {/* Timestamp & Info Action */}
        <View style={styles.actionRow}>
          <Typography size={14} color={themeColors.textSecondary}>
            {item.time}
          </Typography>

          <TouchableOpacity
            onPress={onInfoPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.infoBtn}
          >
            <InfoIcon width={20} height={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  contentRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoBtn: {
    padding: 2,
  },
});
