// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import { useRef } from "react";

/** stabilizes references to a component so you can define it inline in a render function
 * do not use while depending on the render scope unless you wrap the culprit in a ref which is still a bad idea
 */
export const useInlineComponent = <P extends {}, T extends React.ElementType<P>>(comp: T) =>
  useRef(comp).current;

export default useInlineComponent;
