// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import { useRef } from "react";

/** stabilizes references to a component so you can define it inline in a render function
 * do not use while depending on the render scope unless you wrap the culprit in a ref which is still a bad idea.
 *
 * Always consider just creating the component outside of the component you need it in, as a module-level object,
 * but sometimes inline is more readable
 *
 * @example
 * function MyComp() {
 *   return (
 *     <div>
 *       {useInlineComponent(() => <span>weird but ok</span>)}
 *     </div>;
 *   );
 * }
 */
export const useInlineComponent = <P, T extends React.ElementType<P>>(
  comp: T
): T => useRef(comp).current;

export default useInlineComponent;
