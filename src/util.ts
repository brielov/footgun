import { PlainObject } from "./types.ts";

export function isString(input: unknown): input is string {
  return typeof input === "string";
}

export function isNumber(input: unknown): input is number {
  return typeof input === "number";
}

export function isBoolean(input: unknown): input is boolean {
  return typeof input === "boolean";
}

export function isArray(input: unknown): input is unknown[] {
  return Array.isArray(input);
}

export function isUndefined(input: unknown): input is undefined {
  return typeof input === "undefined";
}

export function isSymbol(input: unknown): input is symbol {
  return typeof input === "symbol";
}

export function isBigInt(input: unknown): input is bigint {
  return typeof input === "bigint";
}

export function isNull(input: unknown): input is null {
  return input === null;
}

export function isDate(input: unknown): input is Date {
  return input instanceof Date;
}

export function isFunction(
  input: unknown,
): input is (...args: unknown[]) => unknown {
  return typeof input === "function";
}

export function isObject(
  input: unknown,
): input is PlainObject {
  if (isNull(input) || isUndefined(input)) return false;
  const proto = Object.getPrototypeOf(input);
  return proto === null || proto === Object.prototype;
}

export function isPromise(input: unknown): input is Promise<unknown> {
  return isObject(input) && "then" in input && isFunction(input.then) &&
    "catch" in input && isFunction(input.catch);
}

export function isIterable(input: unknown): input is Iterable<unknown> {
  if (typeof input === "object") {
    if (isNull(input)) return false;
    return Symbol.iterator in input && isFunction(input[Symbol.iterator]);
  }
  return false;
}

export function isDefined<T>(input: T): input is NonNullable<T> {
  return !isNull(input) && !isUndefined(input);
}

export function raise(message: string, cause?: unknown): never {
  throw new Error(message, { cause });
}
