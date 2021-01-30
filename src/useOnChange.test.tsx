/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

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
      // prettier-ignore
      void useOnChange(() => { effect(); }, [val]);
      return null;
    }
    render(<TestComp />);
    expect(effect).toBeCalledTimes(1);

    // TODO: avoid using nextTick/setImmediate/setTimeout(*, 0),
    act(() => setVal(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(2);
  });

  it("doesn't rerun on only dependency changes", async () => {
    let setDep: ReactHookState<number>[1];
    const effect = jest.fn();
    function TestComp() {
      const [a] = React.useState(0);
      let dep;
      [dep, setDep] = React.useState(0);
      // prettier-ignore
      void useOnChange(() => { effect(); }, dep === 0, [a, dep]);
      return null;
    }
    render(<TestComp />);
    expect(effect).toBeCalledTimes(1);

    act(() => setDep(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(effect).toBeCalledTimes(1);
  });

  it("only rerun if deps are valid", async () => {
    let setDepB: ReactHookState<boolean>[1];
    let setListened: ReactHookState<number>[1];
    const effect = jest.fn();
    function TestComp() {
      let depB: boolean, listened: number;
      const [depA] = React.useState(true);
      [depB, setDepB] = React.useState<boolean>(false); // FIXME: false not implicitly widened to boolean
      [listened, setListened] = React.useState(0);
      // prettier-ignore
      useOnChange(() => { effect(); }, depA && depB, [listened]);
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
