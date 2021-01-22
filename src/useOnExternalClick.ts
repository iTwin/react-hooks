// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import React from "react";

export default function useOnExternalClick<T extends HTMLElement | null>(
  ref: React.MutableRefObject<T>,
  externalClickCallback: () => void
): void {
  React.useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        externalClickCallback();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, externalClickCallback]);
}
