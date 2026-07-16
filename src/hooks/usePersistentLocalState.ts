"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { readStorageValue, removeStorageValue, writeStorageValue } from "../lib/browser-storage";
import { useMounted } from "./useMounted";

interface PersistentLocalStateResult<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  isHydrated: boolean;
}

export function usePersistentLocalState<T>(key: string, initialValue: T): PersistentLocalStateResult<T> {
  const isHydrated = useMounted();
  const [value, setValue] = useState<T>(() => readStorageValue<T>(key, initialValue));

  const setPersistentValue = useCallback<Dispatch<SetStateAction<T>>>((nextValue) => {
    setValue((currentValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previousValue: T) => T)(currentValue)
          : nextValue;

      if (resolvedValue === null || resolvedValue === undefined) {
        removeStorageValue(key);
      } else {
        writeStorageValue(key, resolvedValue);
      }

      return resolvedValue;
    });
  }, [key]);

  return { value, setValue: setPersistentValue, isHydrated };
}