import { PlainObject } from "./types.ts";

/**
 * Checks if the given input is a string.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a string, false otherwise.
 * @function
 */
export function isString(input: unknown): input is string {
  return typeof input === "string";
}

/**
 * Checks if the given input is a number.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a number, false otherwise.
 * @function
 */
export function isNumber(input: unknown): input is number {
  return typeof input === "number";
}

/**
 * Checks if the given input is a boolean.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a boolean, false otherwise.
 * @function
 */
export function isBoolean(input: unknown): input is boolean {
  return typeof input === "boolean";
}

/**
 * Checks if the given input is an array.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is an array, false otherwise.
 * @function
 */
export function isArray(input: unknown): input is unknown[] {
  return Array.isArray(input);
}

/**
 * Checks if the given input is undefined.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is undefined, false otherwise.
 * @function
 */
export function isUndefined(input: unknown): input is undefined {
  return typeof input === "undefined";
}

/**
 * Checks if the given input is a symbol.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a symbol, false otherwise.
 * @function
 */
export function isSymbol(input: unknown): input is symbol {
  return typeof input === "symbol";
}

/**
 * Checks if the given input is a bigint.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a bigint, false otherwise.
 * @function
 */
export function isBigInt(input: unknown): input is bigint {
  return typeof input === "bigint";
}

/**
 * Checks if the given input is null.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is null, false otherwise.
 * @function
 */
export function isNull(input: unknown): input is null {
  return input === null;
}

/**
 * Checks if the given input is a Date object.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a Date object, false otherwise.
 * @function
 */
export function isDate(input: unknown): input is Date {
  return input instanceof Date;
}

/**
 * Checks if the given input is a function.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a function, false otherwise.
 * @function
 */
export function isFunction(
  input: unknown,
): input is (...args: unknown[]) => unknown {
  return typeof input === "function";
}

/**
 * Checks if the given input is an object.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is an object, false otherwise.
 * @function
 */
export function isObject(
  input: unknown,
): input is PlainObject {
  if (isNull(input) || isUndefined(input)) return false;
  const proto = Object.getPrototypeOf(input);
  return proto === null || proto === Object.prototype;
}

/**
 * Checks if the given input is a Promise object.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is a Promise object, false otherwise.
 * @function
 */
export function isPromise(input: unknown): input is Promise<unknown> {
  return isObject(input) && "then" in input && isFunction(input.then) &&
    "catch" in input && isFunction(input.catch);
}

/**
 * Checks if the given input is iterable.
 * @param {unknown} input - The input to check.
 * @returns {boolean} true if the input is iterable, false otherwise.
 * @function
 */
export function isIterable(input: unknown): input is Iterable<unknown> {
  if (typeof input === "object") {
    if (isNull(input)) return false;
    return Symbol.iterator in input && isFunction(input[Symbol.iterator]);
  }
  return false;
}

/**
 * Checks if the given input is defined (not null or undefined).
 * @param {T} input - The input to check.
 * @returns {boolean} true if the input is defined, false otherwise.
 * @function
 * @template T - The type of the input.
 */
export function isDefined<T>(input: T): input is NonNullable<T> {
  return !isNull(input) && !isUndefined(input);
}

/**
 * Throws an error with the specified message and optional cause.
 * @param {string} message - The error message.
 * @param {unknown} cause - The optional cause of the error.
 * @throws {Error} The error with the specified message and cause.
 * @function
 */
export function raise(message: string, cause?: unknown): never {
  throw new Error(message, { cause });
}
