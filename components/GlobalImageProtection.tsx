"use client";

import { useEffect } from "react";

export default function GlobalImageProtection() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        event.preventDefault();
      }
    };

    const handleSelectStart = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isDevToolsShortcut =
        event.key === "F12" ||
        ((event.ctrlKey || event.metaKey) &&
          ((event.shiftKey && ["i", "j", "c"].includes(key)) || key === "u" || key === "s"));

      if (isDevToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return null;
}
