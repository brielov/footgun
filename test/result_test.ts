import { assert, assertFalse } from "assert";
import { spy, assertSpyCall, assertSpyCalls } from "mock";
import { Err, Ok, Result } from "../src/result.ts";
import { assertErr, assertOk } from "./util.ts";

const ok = (value = 10): Result<number, string> => Ok(value);
const err = (error = "oops"): Result<number, string> => Err(error);

Deno.test("Result.Ok", () => {
  assertOk(Result.Ok(10), 10);
});

Deno.test("Result.Err", () => {
  assertErr(Result.Err("oops"), "oops");
});

Deno.test("Result.isOk", () => {
  assert(ok().isOk());
  assertFalse(err().isOk());
});

Deno.test("Result.isOkAnd", () => {
  const f = spy(() => false);
});
