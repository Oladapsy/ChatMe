import { IconThemeId, AppIconConfig } from "@/shared/types/theme";

export const ICON_CONFIGS: Record<IconThemeId, AppIconConfig> = {
  green: { color: "#57B77D", lightBg: "#F5FBF7", darkBg: "#0F2B22" },
  blue: { color: "#007CFF", lightBg: "#ECF5FF", darkBg: "#0A2440" },
  red: { color: "#E8503A", lightBg: "#FFF5F5", darkBg: "#3B1416" },
  orange: { color: "#FFB23F", lightBg: "#FFF0D9", darkBg: "#3D230A" },
};