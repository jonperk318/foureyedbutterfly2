import { PropsWithChildren } from "react";

import { ThemeContext } from "./theme-context";
import { useStorage } from "./use-storage";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [isLight, setIsLight] = useStorage("isLight", false);

  const toggleIsLight = () => {
    setIsLight(!isLight);
  }

  return (
    <ThemeContext value={{ isLight, toggleIsLight}}>{children}</ThemeContext>
  )
}
