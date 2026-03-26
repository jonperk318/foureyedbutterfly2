import { createContext, useContext } from "react";

interface IThemeContext {
  isLight?: boolean;
  toggleIsLight?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const ThemeContext = createContext<IThemeContext>({});

export const useTheme = () => useContext(ThemeContext);
