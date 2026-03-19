import React, { useEffect, useState } from "react";
import ThemeSwitch from "./ThemeSwitch";

const MAX_DISPLAY_LENGTH = 16;
const GITHUB_URL = "https://github.com/official-ahmad";
const LINKEDIN_URL = "https://www.linkedin.com/in/muhammadahmadali--/";

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? null : a / b;
    default:
      return b;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  if (
    Math.abs(value) >= 1e12 ||
    (Math.abs(value) > 0 && Math.abs(value) < 1e-7)
  ) {
    return value.toExponential(8);
  }

  const rounded = Number.parseFloat(value.toFixed(10));
  return String(rounded);
}

function Calculator({ isDark, onThemeToggle }) {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resetAll = () => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHasError(false);
  };

  const clearEntry = () => {
    setDisplay("0");
    setHasError(false);
  };

  const inputDigit = (digit) => {
    if (hasError) {
      resetAll();
    }

    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }

    if (display === "0") {
      setDisplay(digit);
      return;
    }

    if (display.replace("-", "").length >= MAX_DISPLAY_LENGTH) {
      return;
    }

    setDisplay((prev) => prev + digit);
  };

  const inputDecimal = () => {
    if (hasError) {
      resetAll();
    }

    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const chooseOperator = (nextOperator) => {
    if (hasError) {
      return;
    }

    const currentValue = Number.parseFloat(display);

    if (storedValue === null) {
      setStoredValue(currentValue);
    } else if (operator && !waitingForOperand) {
      const result = compute(storedValue, currentValue, operator);

      if (result === null) {
        setDisplay("Error");
        setHasError(true);
        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        return;
      }

      const formatted = formatResult(result);
      setDisplay(formatted);
      setStoredValue(result);
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const runEquals = () => {
    if (
      hasError ||
      operator === null ||
      storedValue === null ||
      waitingForOperand
    ) {
      return;
    }

    const currentValue = Number.parseFloat(display);
    const result = compute(storedValue, currentValue, operator);

    if (result === null) {
      setDisplay("Error");
      setHasError(true);
      setStoredValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    setDisplay(formatResult(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const backspace = () => {
    if (hasError) {
      resetAll();
      return;
    }

    if (waitingForOperand) {
      return;
    }

    if (display.length <= 1 || display === "-0") {
      setDisplay("0");
      return;
    }

    const shortened = display.slice(0, -1);
    setDisplay(shortened === "-" ? "0" : shortened);
  };

  const toggleSign = () => {
    if (display === "0" || hasError) {
      return;
    }
    setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : `-${prev}`));
  };

  const applyPercent = () => {
    if (hasError) {
      return;
    }
    const value = Number.parseFloat(display) / 100;
    setDisplay(formatResult(value));
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const { key, code } = event;

      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        inputDigit(key);
        return;
      }

      if (key === "." || key === "," || code === "NumpadDecimal") {
        event.preventDefault();
        inputDecimal();
        return;
      }

      if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();
        chooseOperator(key);
        return;
      }

      if (key === "Enter" || key === "=" || code === "NumpadEnter") {
        event.preventDefault();
        runEquals();
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }

      if (key === "Delete") {
        event.preventDefault();
        clearEntry();
        return;
      }

      if (key === "Escape") {
        event.preventDefault();
        resetAll();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const equationText = `${storedValue ?? ""} ${operator ?? ""}`.trim();
  const operatorClassName = (op) =>
    `key key--operator${operator === op ? " key--selected" : ""}`;

  return (
    <section className="calculator" aria-label="Calculator">
      <div className="calculator__theme-row">
        <p className="calculator__mode-label">
          {isDark ? "Dark Mode" : "Light Mode"}
        </p>
        <ThemeSwitch checked={!isDark} onChange={onThemeToggle} />
      </div>

      <header className="calculator__screen" aria-live="polite">
        <p className="calculator__equation">{equationText || "Ready"}</p>
        <p className="calculator__value">{display}</p>
      </header>

      <div className="calculator__keys">
        <button
          type="button"
          className="key key--action key--wide"
          onClick={resetAll}
        >
          AC
        </button>
        <button type="button" className="key key--action" onClick={clearEntry}>
          CE
        </button>
        <button type="button" className="key key--action" onClick={backspace}>
          DEL
        </button>

        <button
          type="button"
          className="key key--action"
          onClick={applyPercent}
        >
          %
        </button>
        <button type="button" className="key key--action" onClick={toggleSign}>
          +/-
        </button>
        <button type="button" className="key" onClick={() => inputDigit("7")}>
          7
        </button>
        <button
          type="button"
          className={operatorClassName("/")}
          onClick={() => chooseOperator("/")}
          aria-pressed={operator === "/"}
        >
          /
        </button>

        <button type="button" className="key" onClick={() => inputDigit("4")}>
          4
        </button>
        <button type="button" className="key" onClick={() => inputDigit("5")}>
          5
        </button>
        <button type="button" className="key" onClick={() => inputDigit("6")}>
          6
        </button>
        <button
          type="button"
          className={operatorClassName("*")}
          onClick={() => chooseOperator("*")}
          aria-pressed={operator === "*"}
        >
          *
        </button>

        <button type="button" className="key" onClick={() => inputDigit("1")}>
          1
        </button>
        <button type="button" className="key" onClick={() => inputDigit("2")}>
          2
        </button>
        <button type="button" className="key" onClick={() => inputDigit("3")}>
          3
        </button>
        <button
          type="button"
          className={operatorClassName("-")}
          onClick={() => chooseOperator("-")}
          aria-pressed={operator === "-"}
        >
          -
        </button>

        <button type="button" className="key" onClick={() => inputDigit("0")}>
          0
        </button>
        <button type="button" className="key" onClick={inputDecimal}>
          .
        </button>
        <button type="button" className="key key--equals" onClick={runEquals}>
          =
        </button>
        <button
          type="button"
          className={operatorClassName("+")}
          onClick={() => chooseOperator("+")}
          aria-pressed={operator === "+"}
        >
          +
        </button>
      </div>

      <p className="calculator__hint">
        Tip: You can also use your keyboard to interact with the calculator!
      </p>

      <footer className="calculator__social" aria-label="Social links">
        <a
          className="social-link"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.25-.02-2.27-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.37 1.24-3.21-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.9 1.24 3.21 0 4.62-2.81 5.63-5.49 5.94.43.37.81 1.09.81 2.2 0 1.59-.01 2.88-.01 3.27 0 .32.21.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
          </svg>
          <span>GitHub</span>
        </a>

        <a
          className="social-link"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.99-.2c-1.4 0-2.34.77-2.73 1.5V10h-2.56v8h2.66v-4.3c0-1.13.21-2.23 1.61-2.23 1.38 0 1.4 1.29 1.4 2.3V18h2.67v-4.76c0-2.33-.5-4.12-3.05-4.12ZM7 5.75a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z" />
          </svg>
          <span>LinkedIn</span>
        </a>
      </footer>
    </section>
  );
}

export default Calculator;
