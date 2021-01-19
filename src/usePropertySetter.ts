// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import React from "react";
import { ReactHookState } from "./react-type-utils";

// only necessary because typescript doesn't know how to identify a callable type
// from the optional call operator `?.()`
const isAction = <State extends {}>(arg: any): arg is (prev: State) => State =>
  typeof arg === "function";

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
  // useRef over useCallback to prevent checking
  React.useRef((...[arg]: Parameters<ReactHookState<State[Key]>[1]>) =>
    setState((prev) => {
      const nextPropertyState = isAction<State[Key]>(arg)
        ? arg(prev[key])
        : arg;
      return { ...prev, [key]: nextPropertyState };
    })
  ).current;

export default usePropertySetter;
