/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";

/**
 * Custom React hook for tracking the value of a media query.
 * @param query A media query for use with window.matchMedia().
 *   Example: (min-width: 400px)
 * @return true if query matches; false otherwise
 */
export const useMediaQuery = (query: string): boolean => {
  // Adapted to TypeScript from here:
  // https://medium.com/@ttennant/react-inline-styles-and-media-queries-using-a-custom-react-hook-e76fa9ec89f6
  const mediaMatch = window.matchMedia(query);
  const [matches, setMatches] = React.useState(mediaMatch.matches);

  React.useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    // NOTE: addEventListener wasn't supported for MediaMatch until iOS 14. :-(
    // The fact that the tools consider it to be deprecated is a MASSIVE BUG in the tools.
    mediaMatch.addListener(listener);
    return () => mediaMatch.removeListener(listener);
  });
  return matches;
};

/**
 * Custom React hook for tracking when the specified HTMLElement is scrolling.
 * @param scrollable The scrollable HTMLElement to track scrolling on; if null or undefined, result is false.
 * @return true while scrollable is scrolling; false otherwise
 */
export const useScrolling = (scrollable: HTMLElement | undefined | null) => {
  const [scrolling, setScrolling] = React.useState(false);

  React.useEffect(() => {
    let touching = false;
    let timer: NodeJS.Timeout | undefined;

    const scrollHandler = () => {
      if (timer) {
        clearTimeout(timer);
      }
      setScrolling(true);
      if (!touching) {
        // If not touching, the user initiated scrolling using an attached pointing device (mouse or trackpad).
        timer = setTimeout(() => setScrolling(false), 250);
      }
    };

    const touchStartHandler = () => {
      touching = true;
    };

    const touchEndHandler = (ev: TouchEvent) => {
      touching = ev.touches.length !== 0;
      if (!touching) {
        setScrolling(false);
      }
    };

    if (scrollable) {
      scrollable.addEventListener("scroll", scrollHandler);
      // these events are intentionally only for touch as drag scrolling isn't done with the mouse or trackpad
      scrollable.addEventListener("touchstart", touchStartHandler);
      scrollable.addEventListener("touchend", touchEndHandler);
    }

    return () => {
      if (scrollable) {
        scrollable.removeEventListener("scroll", scrollHandler);
        scrollable.removeEventListener("touchstart", touchStartHandler);
        scrollable.removeEventListener("touchend", touchEndHandler);
      }
    };
  }, [scrollable]);
  return scrolling;
};
