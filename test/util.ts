import { assert, assertEquals, assertInstanceOf } from "assert";
import { Option } from "../src/option.ts";
import { Defined } from "../src/types.ts";
import { isDefined } from "../src/util.ts";
import { Result } from "../src/result.ts";

export function assertSome<T extends Defined>(
  actual: unknown,
  innerValue?: T,
): asserts actual is Option<T> {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertInstanceOf(actual, Option, "value is not an `Option`");
  assert((actual as Option<T>).isSome(), "option is not a `Some`");

  if (isDefined(innerValue)) {
    assertEquals((actual as Option<T>).unwrap(), innerValue);
  }
}

export function assertNone<T extends Defined>(
  actual: unknown,
): asserts actual is Option<T> {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertInstanceOf(actual, Option, "value is not an `Option`");
  assert((actual as Option<T>).isNone(), "option is not a `None`");
}

export function assertOk<T extends Defined, E extends Defined>(
  actual: unknown,
  innerValue?: T,
): asserts actual is Result<T, E> {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertInstanceOf(actual, Result, "value is not a `Result`");
  assert((actual as Result<T, E>).isOk(), "result is not an `Ok`");

  if (isDefined(innerValue)) {
    assertEquals((actual as Result<T, E>).unwrap(), innerValue);
  }
}

export function assertErr<T extends Defined, E extends Defined>(
  actual: unknown,
  innerError?: E,
): asserts actual is Result<T, E> {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertInstanceOf(actual, Result, "value is not a `Result`");
  assert((actual as Result<T, E>).isErr(), "result is not an `Err`");

  if (isDefined(innerError)) {
    assertEquals((actual as Result<T, E>).unwrapErr(), innerError);
  }
}
