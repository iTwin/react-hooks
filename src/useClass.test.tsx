/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import React, { useMemo, useState } from "react";
import { act, render } from "@testing-library/react";

import useClass from "./useClass";

describe("useClass()", () => {
  class Base {
    f() {
      return 2;
    }
  }

  it("class is stable even when state changes", async () => {
    let a: number;
    let setA!: (a: number) => void;
    let LastDerived: new () => Base;
    const TestComp = jest.fn(() => {
      const stateA = useState(10);
      a = stateA[0];
      setA = jest.fn(stateA[1]);

      const Derived = useClass(
        (state) =>
          class Derived extends Base {
            f() {
              return super.f() + state.a;
            }
          },
        { a }
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const instance = useMemo(() => new Derived(), []);

      expect(Object.getPrototypeOf(Derived)).toStrictEqual(Base);
      if (LastDerived) expect(LastDerived).toStrictEqual(Derived);
      expect(instance).toBeInstanceOf(Derived);
      LastDerived = Derived;

      return <span data-testid="result">{instance.f()}</span>;
    }) as React.FC;

    const result = render(<TestComp />);
    expect((await result.findByTestId("result"))?.textContent).toStrictEqual(
      "12"
    );

    act(() => setA(5));
    expect((await result.findByTestId("result"))?.textContent).toStrictEqual(
      "7"
    );

    act(() => setA(10));
    expect((await result.findByTestId("result"))?.textContent).toStrictEqual(
      "12"
    );

    expect(TestComp).toHaveBeenCalledTimes(3);
  });

  it("supports constructors with arguments and empty dependencies", async () => {
    const TestComp = jest.fn(() => {
      const Derived = useClass(
        () =>
          class Derived extends Base {
            constructor(_arg1: string, ..._arg2: number[]) {
              super();
            }
          }
      );

      const _instance = useMemo(() => new Derived("yup"), [Derived]);

      return <span data-testid="result"></span>;
    }) as React.FC;

    render(<TestComp />);
  });
});
