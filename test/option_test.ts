import { assert, assertFalse, assertEquals, assertThrows } from "assert";
import { assertSpyCall, assertSpyCalls, spy } from "mock";
import { None, Option, Some } from "../src/option.ts";
import { assertErr, assertNone, assertOk, assertSome } from "./util.ts";

const some = (value = 10): Option<number> => Some(value);
const none: Option<number> = None;

Deno.test("Option.Some", () => {
  const actual = some();
  assertSome(actual, 10);
});

Deno.test("Option.None", () => {
  const actual = None;
  assertNone(actual);
});

Deno.test("Option.from", () => {
  assertSome(Option.from(10), 10);
  assertNone(Option.from(null));
  assertNone(Option.from(undefined));
});

Deno.test("Option.isSome", () => {
  assert(some().isSome());
  assertFalse(none.isSome());
});

Deno.test("Option.isSomeAnd", () => {
  const truthy = spy(() => true);
  const falsy = spy(() => false);

  some().isSomeAnd(truthy);
  assertSpyCall(truthy, 0, {
    args: [10],
    returned: true,
  });

  some().isSomeAnd(falsy);
  assertSpyCall(falsy, 0, {
    args: [10],
    returned: false,
  });

  assertFalse(some().isSomeAnd(falsy));
});

Deno.test("Option.isNone", () => {
  assert(none.isNone());
  assertFalse(some().isNone());
});

Deno.test("Option.expect", () => {
  assertThrows(() => none.expect("oops"));
  assertEquals(some().expect("oops"), 10);
});

Deno.test("Option.unwrap", () => {
  assertThrows(() => none.unwrap());
  assertEquals(some().unwrap(), 10);
});

Deno.test("Option.unwrapOr", () => {
  assertEquals(none.unwrapOr(0), 0);
  assertEquals(some().unwrapOr(0), 10);
});

Deno.test("Option.unwrapOrElse", () => {
  const f = () => 0;
  assertEquals(none.unwrapOrElse(f), 0);
  assertEquals(some().unwrapOrElse(f), 10);
});

Deno.test("Option.map", () => {
  const f = (value: number) => value * 2;
  assertSome(some().map(f), 20);
  assertNone(none.map(f));
});

Deno.test("Option.inspect", () => {
  const f = spy(() => void 0);

  none.inspect(f);
  assertSpyCalls(f, 0);

  some().inspect(f);
  assertSpyCall(f, 0, {
    args: [10],
    returned: undefined,
  });
});

Deno.test("Option.mapOr", () => {
  const f = (value: number) => value * 2;
  assertEquals(some().mapOr(0, f), 20);
  assertEquals(none.mapOr(0, f), 0);
});

Deno.test("Option.mapOrElse", () => {
  const f1 = (value: number) => value * 2;
  const f2 = () => 0;
  assertEquals(some().mapOrElse(f2, f1), 20);
  assertEquals(none.mapOrElse(f2, f1), 0);
});

Deno.test("Option.okOr", () => {
  assertOk(some().okOr("oops"), 10);
  assertErr(none.okOr("oops"), "oops");
});

Deno.test("Option.okOrElse", () => {
  const f = () => "oops";
  assertOk(some().okOrElse(f), 10);
  assertErr(none.okOrElse(f), "oops");
});

Deno.test("Option.and", () => {
  assertSome(some().and(some(20)), 20);
  assertNone(none.and(some()));
});

Deno.test("Option.andThen", () => {
  const f = (value: number) => some(value * 2);
  assertSome(some().andThen(f), 20);
  assertNone(none.andThen(f));
});

Deno.test("Option.filter", () => {
  assertSome(some().filter((v) => v === 10));
  assertNone(some().filter((v) => v !== 10));
  assertNone(none.filter((v) => v === 10));
});

Deno.test("Option.or", () => {
  assertSome(some().or(some(20)), 10);
  assertSome(none.or(some()), 10);
});

Deno.test("Option.orElse", () => {
  const f = () => some(20);
  assertSome(some().orElse(f), 10);
  assertSome(none.orElse(f), 20);
});
