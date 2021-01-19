// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

import React from "react";

/** A custom React hook function for using an interval timer.
 * @param callback - The callback function.
 * @param delay - How often (in msec) to call the callback function, or null to stop calling it.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef<() => void | null>();
  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  });
  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      if (typeof savedCallback?.current !== "undefined") {
        savedCallback?.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return () => { };
  }, [delay]);
}

export default useInterval;
