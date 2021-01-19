// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

import React from "react";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import useOnChange from "./useOnChange";
import { ReactHookState } from "./react-type-utils";

describe("useOnChange()", () => {
  it("reacts to a change", async () => {
    let setVal: ReactHookState<number>[1];
    const effect = jest.fn();
    function TestComp() {
      let val: number;
      [val, setVal] = React.useState(0);
      useOnChange(() => {
        effect();
      }, [val]);
      return null;
    }
    render(<TestComp />);
    expect(effect).toBeCalledTimes(1);

    act(() => setVal(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(2);
  });

  it("doesn't rerun on dependency changes", async () => {
    let setDep: ReactHookState<number>[1];
    const effect = jest.fn();
    function TestComp() {
      const [a, _setA] = React.useState(0);
      let dep: number;
      [dep, setDep] = React.useState(0);
      useOnChange(() => {
        effect();
      }, [a]);
      return null;
    }
    render(<TestComp />);
    expect(effect).toBeCalledTimes(1);

    act(() => setDep(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(1);
  });

  it("only rerun if deps are valid", async () => {
    let setDepA: ReactHookState<boolean>[1];
    let setDepB: ReactHookState<boolean>[1];
    let setListened: ReactHookState<number>[1];
    const effect = jest.fn();
    function TestComp() {
      let depA: boolean, depB: boolean, listened: number;
      [depA, setDepA] = React.useState<boolean>(true);
      [depB, setDepB] = React.useState<boolean>(false);
      [listened, setListened] = React.useState<number>(0);
      useOnChange(
        () => {
          effect();
        },
        [listened],
        depA && depB
      );
      return null;
    }
    render(<TestComp />);
    expect(effect).toBeCalledTimes(0);

    act(() => setListened(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(0);

    act(() => setDepB(true));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(1);
  });
});
