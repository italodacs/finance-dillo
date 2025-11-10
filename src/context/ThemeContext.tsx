// src/context/ThemeContext.tsx
import { createContext, ReactNode, useContext } from "react";

// ✅ Tipo simplificado — agora só há tema claro
type ThemeContextType = {
  theme: "light";
};

// ✅ Contexto fixo em tema claro
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
});

type Props = {
  children: ReactNode;
};

// ✅ Provider mantém compatibilidade, mas fixa o tema como "light"
export const ThemeProvider = ({ children }: Props) => {
  return (
    <ThemeContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Hook opcional — ainda funciona, mas retorna sempre "light"
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
