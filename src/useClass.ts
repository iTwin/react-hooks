/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { useRef } from "react";

/** A hook for using classes seamlessly in your functional components. Unlike usual hooks,
 * your dependencies are an object instead of an array, but thanks to implicitly named properties
 * it should look similar and feel fine. As an added bonus, the types of dependencies passed in is
 * known and it will be a typescript error to use state from your component that you did not pass
 * in as a dependency.
 *
 * The created class is stable, and will always use the most up-to-date state from your React component.
 *
 * @example
 * const [isHovered, setIsHovered] = useState(false);
 * const MyClass = useClass((state) => class MyClass extends Base {
 *   overridableMethod() {
 *     super.overrideableMethod();
 *     if (isHovered) console.log("was hovered!");
 *   }
 * }, { isHovered });
 *
 * const [myInstance] = useState(new MyClass());
 *
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function useClass<C extends new (...args: any[]) => any, S extends {}>(
  makeClass: (s: S) => C,
  dependencies: S = {} as S
): C {
  const stateRef = useRef({} as S).current;
  Object.assign(stateRef, dependencies);
  return useRef(makeClass(stateRef)).current;
}

export default useClass;
