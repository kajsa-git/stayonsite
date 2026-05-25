"use client";

import { useEffect } from "react";

interface Shortcuts {
  onF1?: () => void;
  onF2?: () => void;
  onF3?: () => void;
  onF4?: () => void;
  onF5?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isEditing && e.key !== "Escape") return;

      switch (e.key) {
        case "F1":
          e.preventDefault();
          shortcuts.onF1?.();
          break;
        case "F2":
          e.preventDefault();
          shortcuts.onF2?.();
          break;
        case "F3":
          e.preventDefault();
          shortcuts.onF3?.();
          break;
        case "F4":
          e.preventDefault();
          shortcuts.onF4?.();
          break;
        case "F5":
          e.preventDefault();
          shortcuts.onF5?.();
          break;
        case "ArrowLeft":
          if (!isEditing) {
            e.preventDefault();
            shortcuts.onArrowLeft?.();
          }
          break;
        case "ArrowRight":
          if (!isEditing) {
            e.preventDefault();
            shortcuts.onArrowRight?.();
          }
          break;
        case "f":
          if ((e.metaKey || e.ctrlKey) && !isEditing) {
            e.preventDefault();
            shortcuts.onSearch?.();
          }
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
