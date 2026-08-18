"use client";

import { useEffect } from "react";

export default function GlobalImageProtection() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG" || target.closest("[data-protected-image]")) {
        event.preventDefault();
      }
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
      // Block common "Save image" / "View image" shortcuts on images.
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        if ((event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S")) {
          event.preventDefault();
        }
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
