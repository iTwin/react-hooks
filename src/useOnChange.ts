// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

import { useRef } from "react";
import useAsyncEffect from "./useAsyncEffect";

/**
 * useOnChange, a hook for a common effect pattern
 *
 * @description Sometimes you want an effect to run exactly when some state changes, but doing this with a normal effect
 * can be a trap, since when that state changes, another dependency may be invalid, so you need to wait for
 * all dependencies to be valid, and _then_ execute the effect, knowing that the state changed before. This hook
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
 *   [tickNumber],
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
  }) => void | Promise<void>,
  rerunStates: States,
  validRunCondition = true,
) {
  const ran = useRef(false);
  const lastStates = useRef<States>();
  const haveStatesChanged =
    !lastStates.current ||
    rerunStates.length !== lastStates.current.length ||
    rerunStates?.some((_, i) => rerunStates[i] !== lastStates.current?.[i]);
  if (haveStatesChanged) ran.current = false;
  const prev =
    lastStates.current ?? (new Array(rerunStates.length).fill(undefined) as Partial<States>);
  useAsyncEffect(async (...useAsyncArgs) => {
    if (validRunCondition && !ran.current) {
      ran.current = true;
      await effect({
        prev,
        isStale: useAsyncArgs[0],
        setCancel: useAsyncArgs[1],
      });
    }
  });
  lastStates.current = rerunStates;
}
