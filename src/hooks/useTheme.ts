import { useColorScheme } from "react-native";
import { colors } from "../config/theme";

export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  return {
    isDark,
    colors: themeColors,
  };
};
