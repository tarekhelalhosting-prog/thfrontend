"use client";

import { useSyncExternalStore } from "react";

function subscribeToMountState() {
  return () => {};
}

export function useMounted() {
  return useSyncExternalStore(subscribeToMountState, () => true, () => false);
}