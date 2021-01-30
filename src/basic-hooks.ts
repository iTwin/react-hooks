/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useEffect, useMemo, useRef } from "react";

/** perform code on mount, executing in render order, which
 * effects cannot do.
 */
export function useOnMountInRenderOrder(
  effect: () => void | (() => void)
): void {
  const mounted = useRef(false);
  const cleanup = useRef<() => void>();

  if (!mounted.current) {
    mounted.current = true;
    const cleanupFunc = effect();
    if (cleanupFunc) {
      cleanup.current = cleanupFunc;
    }
  }

  useEffect(() => () => cleanup.current?.(), []);
}

/** run code on component mount */
export function useOnMount(impl: () => void): void {
  // empty deps makes it run when the component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void impl(), []);
}

/** run something on component unmount */
export function useOnUnmount(impl: () => void): void {
  // empty deps makes it run when the component mounts (and cleanup runs when it unmounts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => impl(), []);
}

/** create a stable object reference on initialization */
export function useStable<T>(make: () => T): T {
  // our intention is to only call it once so the empty deps are on purpose,
  // this is how useRef works anyway
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(make, []);

  // can't use just memo since it's only for expensive computations,
  // react will (eventually) selectively recreate the object breaking the contract.
  return useRef(value).current;
}

/**
 * throws an error if the pass object changes its key shape between renders:
 *
 * @example
 * render1:
 *   useErrorOnUnstableShape({a: 1, b: 1});
 * render2:
 *   useErrorOnUnstableShape({a: {d: "world"}, b: "hello"});
 *   // no error thrown
 *
 * render1:
 *   useErrorOnUnstableShape({a: 1, b: 1});
 * render2:
 *   useErrorOnUnstableShape({a: 1});
 *   // error thrown (key removed)
 *
 * render1:
 *   useErrorOnUnstableShape({a: 1, b: 1});
 * render2:
 *   useErrorOnUnstableShape({a: 1, b: 1, c: 2});
 *   // error thrown (key added)
 */
export function useErrorOnUnstableShape<T extends Record<string, unknown>>(
  object: T,
  consumerName = "useErrorOnUnstableShape"
): void {
  const originalKeys = useStable(() => Object.keys(object));
  const currentKeys = Object.keys(object);

  if (
    !(
      originalKeys.length === currentKeys.length &&
      originalKeys.every((_key, i) => originalKeys[i] === currentKeys[i])
    )
  ) {
    throw Error(
      `"${consumerName}" must always receive the same object shape/scheme each time ` +
        "(i.e. same property set in same order, so no conditional/dynamic properties)"
    );
  }
}
