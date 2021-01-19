// ReturnType<typeof useState<T>> isn't yet possible generically in typescript
export type ReactHookState<T> = [T, React.Dispatch<React.SetStateAction<T>>];
