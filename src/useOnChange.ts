// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

import { useRef } from "react";
import useAsyncEffect from "./useAsyncEffect";

/**
 * useOnChange, a hook for a common effect pattern
 *
 * @description Sometimes you want an effect to run exactly when some state changes, but you might rely on
 * state that isn't valid yet. So you need to wait for all dependencies to be valid, and only _then_ execute
 * the effect, having stored that the state changed before. This hook
 * encapsulates the pattern of running an effect on a state change, and will wait for all dependencies
 * to be valid before actually running the pending effect.
 *
 * @example
 * const [modelDomainName, setModelDomainName] = useState("");
 * const [isPollingForUploadState, setIsPolling] = useState(false);
 * useOnChange(
 *   // effect doesn't have to be async
 *   async (isStale, setCancel) => {
 *     if (isPollingForUploadState && !isStale()) await poll(modelDomainName, setCancel);
 *   },
 *   [tickNumber], // whenever tickNumber changes, rerun the effect provided the modelDomainName is valid
 *   !!modelDomainName,
 * );
 *
 * @param effect the react effect that will run, with optional cleanup just like useEffect
 * @param rerunStates states will cause this effect to rerun
 * @param validRunCondition condition that must be satisfied for the effect to run
 */
export default function useOnChange<States extends readonly any[]>(
  effect: (util: {
    prev: Partial<States>;
    isStale: () => boolean;
    setCancel: (cancel: () => void) => void;
  }) => Promise<void>,
  validRunCondition: boolean,
  rerunStates: States
): Promise<void>;
// TODO: currently this is a 2x2 matrix of overloads, if it explodes, may
// want to look into higher-level type unions
export default function useOnChange<States extends readonly any[]>(
  effect: (util: {
    prev: Partial<States>;
    isStale: () => boolean;
    setCancel: (cancel: () => void) => void;
  }) => void,
  validRunCondition: boolean,
  rerunStates: States
): void;
export default function useOnChange<States extends readonly any[]>(
  effect: (util: {
    prev: Partial<States>;
    isStale: () => boolean;
    setCancel: (cancel: () => void) => void;
  }) => Promise<void>,
  rerunStates: States
): Promise<void>;
export default function useOnChange<States extends readonly any[]>(
  effect: (util: {
    prev: Partial<States>;
    isStale: () => boolean;
    setCancel: (cancel: () => void) => void;
  }) => void,
  rerunStates: States
): void;
export default function useOnChange<States extends readonly any[]>(
  effect: (util: {
    prev: Partial<States>;
    isStale: () => boolean;
    setCancel: (cancel: () => void) => void;
  }) => void | Promise<void>,
  validRunConditionOrRerunStates: boolean | States,
  maybeRerunStates?: States
): Promise<void> {
  const [validRunCondition, rerunStates] =
    maybeRerunStates !== undefined
      ? [validRunConditionOrRerunStates as boolean, maybeRerunStates]
      : [true, validRunConditionOrRerunStates as States];
  const ran = useRef(false);
  const lastStates = useRef<States>();
  const haveStatesChanged =
    !lastStates.current ||
    rerunStates.length !== lastStates.current.length ||
    rerunStates?.some((_, i) => rerunStates[i] !== lastStates.current?.[i]);
  if (haveStatesChanged) ran.current = false;
  const prev =
    lastStates.current ??
    ((new Array(rerunStates.length).fill(undefined) as any) as Partial<States>);
  const result = useAsyncEffect(async (...[utils]) => {
    if (validRunCondition && !ran.current) {
      ran.current = true;
      await effect({ prev, ...utils });
    }
  });
  lastStates.current = rerunStates;
  return result;
}
