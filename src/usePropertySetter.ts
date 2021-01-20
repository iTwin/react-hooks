// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import React from "react";
import { ReactHookState } from "./react-type-utils";

// would be nicer if typescript could use the optional call `?.()` operator on any type
// and realize it is a function
export function isAction<State extends any>(
  arg: State | ((prev: State) => State)
): arg is (prev: State) => State {
  return typeof arg === "function";
}

/**
 * given a key and a react setState dispatcher returned from useState,
 * create a setter for a particular field, with an API identical to as if you
 * separated that field from the object as its own react state
 *
 * @example
 * type T = {a: "b" | "c"};
 * const [state, setState] = useState<T>({a: "b"});
 * const setA = usePropertySetter("a", setState);
 * setA("c");
 */
export const usePropertySetter = <
  // eslint-disable-next-line @typescript-eslint/ban-types
  State extends object,
  Key extends keyof State
>(
  key: Key,
  setState: ReactHookState<State>[1]
): ReactHookState<State[Key]>[1] =>
  // useRef over useCallback to prevent overhead
  React.useRef((...[arg]: Parameters<ReactHookState<State[Key]>[1]>) =>
    setState((prev) => {
      const nextPropertyState = isAction<State[Key]>(arg)
        ? arg(prev[key])
        : arg;
      return { ...prev, [key]: nextPropertyState };
    })
  ).current;

export default usePropertySetter;
