/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

// ReturnType<typeof useState<T>> isn't yet possible generically in typescript
export type ReactHookState<T> = [T, React.Dispatch<React.SetStateAction<T>>];
