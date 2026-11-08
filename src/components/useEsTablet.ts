import { useWindowDimensions } from "react-native";

import { TABLET_BREAKPOINT } from "@/theme";

export function useEsTablet(): boolean {
  return useWindowDimensions().width >= TABLET_BREAKPOINT;
}
