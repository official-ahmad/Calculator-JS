import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Calculator from "./components/Calculator";

const THEME_STORAGE_KEY = "calculator-theme";

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  const isDark = useMemo(() => theme === "dark", [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <main className="app-shell">
      <Calculator isDark={isDark} onThemeToggle={handleThemeToggle} />
    </main>
  );
}

export default App;
