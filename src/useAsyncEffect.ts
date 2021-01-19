// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import React, { useEffect } from "react";

type CancellationFunc = () => void;

/** a wrapper over React's useEffect that facilitates good practice for async effects,
 * you can inline the async effect, check if the effect is stale, and set a custom
 * cancellation function to be invoked on cleanup, which is useful for cancelling e.g. axios
 * requests.
 * The cancel function is assumed to be the cleanup action so if you need more advanced
 * cleanup or your dependencies include things upon which you shouldn't cancel, use a raw effect
 *
 * @example
 * useAsyncEffect(async ({setCancel}) => {
 *   const req = axios.get<Resp>(url, {
 *     cancelToken: new axios.CancelToken(setCancel) // works well with axios
 *   });
 *   await req;
 * }, [url]);
 *
 * @example
 * const [myArray, setMyArray] = useState([]);
 * useAsyncEffect(async ({isStale}) => {
 *   const result = await somethingAsync(id);
 *   if (!isStale()) setMyArray(result);
 * }, [id, somethingAsync]);
 */
export const useAsyncEffect = (
  effect: (opts: {
    isStale: () => boolean;
    setCancel: (cancel: CancellationFunc) => void;
  }) => void | Promise<void>,
  handleErr: (err: unknown) => void,
  deps?: React.DependencyList
) => {
  useEffect(
    () => {
      let isStale = false;
      let onCancel: CancellationFunc | undefined;
      const result = effect({
        isStale: () => isStale,
        setCancel: (inCancelFunc: CancellationFunc) =>
          void (onCancel = inCancelFunc),
      });
      if (result) {
        result
          .then(() => {
            onCancel = undefined;
          })
          .catch(handleErr);
      }
      return () => {
        isStale = true;
        onCancel?.();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
};

export default useAsyncEffect;
