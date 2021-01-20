// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import { useRef } from "react";
import useInterval from "./useInterval";

type CancellationFunc = () => void;

/**
 * @description
 * useInterval but with support for async functions and utilities like useAsyncEffect
 * the async cancel/cleanup occurs directly before the replacing effect is about to start.
 * To handle errors you may catch the return value of the effect.
 *
 * @warn
 * it's possible that a previous cancelled effect run could have a section that sets state
 * that runs after the current effect, which may cause strange problems, so make sure to synchronously
 * exit after a cancellation (i.e. after axios.isCancel)
 *
 * @example
 * useAsyncInterval(async ({setCancel}) => {
 *   const resp = await axios.get<Resp>(pollEndpointUrl, {
 *     cancelToken: new axios.CancelToken(setCancel) // works well with axios
 *   });
 * }, 1000);
 */
export const useAsyncInterval = (
  effect: (util: {
    isStale: () => boolean;
    setCancel: (cancel: CancellationFunc) => void;
  }) => void | Promise<void>,
  interval: number | null
): Promise<void> => {
  const lastCancel = useRef<CancellationFunc>();
  const isStale = useRef(true);
  return new Promise<void>((resolve, reject) =>
    // Promise constructor synchronously invokes this callback,
    // so this useEffect call follows the rules of hooks (static invocation)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInterval(() => {
      lastCancel.current?.();
      const result = effect({
        isStale: () => isStale.current,
        setCancel: (inCancelFunc: CancellationFunc) => {
          lastCancel.current = () => {
            inCancelFunc();
            isStale.current = true;
          };
        },
      });
      if (result) {
        result
          .then(() => {
            lastCancel.current = undefined;
            isStale.current = false;
            resolve();
          })
          .catch(reject);
      }
    }, interval)
  );
};

export default useAsyncInterval;
