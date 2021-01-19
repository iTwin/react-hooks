import { useState, useMemo } from "react";

/**
 * Manages a string input, abstracting any parsing or validation for the intended value type.
 * By default (with no generic type parameter specified) assumes a number is being parsed and uses parseFloat for
 * parsing if no `parse` option is supplied.
 * if you are using any type but `number` you must pass a custom parse function
 */
export function useValidatedInput(
  initial?: string,
  opts?: DefaultOptions
): UseRegexValidatedInputResult<number>;
export function useValidatedInput<T extends any>(
  initial?: string,
  opts?: Options<T>
): UseRegexValidatedInputResult<T>;
export function useValidatedInput<T extends any = number>(
  initial?: string,
  opts?: Options<T>
): UseRegexValidatedInputResult<T> {
  opts = {
    parse: (parseFloatNullInsteadOfNaN as any) as ValueParserWithStatus<T>,
    pattern: isNumberPattern,
    ...opts,
  };

  const [input, setInput] = useState<string>(initial ?? "");

  const [value, statusReason] = useMemo(() => {
    if (opts?.pattern && !opts.pattern.test(input))
      return [
        null,
        opts.pattern === isNumberPattern ? "invalid number" : "invalid format",
      ];
    const result = opts!.parse!(input);
    if (opts!.validate && result.value !== null) {
      const test = opts!.validate(result.value);
      if (!test.valid) return [null, test.status];
    }
    return [result.value, result.status];
  }, [input, opts?.parse, opts?.pattern, opts?.validate]);

  const status =
    value !== null
      ? opts?.undefinedStatusOnSuccess
        ? undefined
        : InputStatus.Success
      : InputStatus.Error;

  return [value, input, setInput, status, statusReason];
}

export interface Options<T> {
  parse?: (input: string) => { value: T | null; status?: string };
  /** optional preparse RegExp tester, rejects with "invalid format" */
  pattern?: RegExp;
  // TODO: allow return type of just boolean
  /** optional postparse value tester */
  validate?: (value: T) => { valid: boolean; status?: string };
  undefinedStatusOnSuccess?: boolean;
}

// type used when user passes no custom options
export interface DefaultOptions {
  parse?: (input: string) => { value: number | null; status?: string };
  /** optional preparse RegExp tester, rejects with "invalid format" */
  pattern?: RegExp;
  validate?: (value: number) => { valid: boolean; status?: string };
  undefinedStatusOnSuccess?: boolean;
}

export enum InputStatus {
  Success = "success",
  Warning = "warning",
  Error = "error",
}

// TODO: add scientific notation support? i.e. 1.23E+21
const isNumberPattern = /^-?(0|[1-9]\d*)(\.\d+)?$/i;

export type UseRegexValidatedInputResult<T> = [
  T | null,
  string,
  React.Dispatch<React.SetStateAction<string>>,
  InputStatus | undefined,
  string | undefined
];

type ValueParserWithStatus<T> = (
  text: string
) => { value: T | null; status?: string };

const parseFloatNullInsteadOfNaN: ValueParserWithStatus<number> = (text) => {
  const result = parseFloat(text);
  if (Number.isNaN(result)) return { value: null, status: "invalid number" };
  else return { value: result };
};

export default useValidatedInput;
