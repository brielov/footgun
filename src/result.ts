import { None, type Option, Some } from "./option.ts";
import { Defined } from "./types.ts";
import { raise } from "./util.ts";

/**
 * Represents a result type that can be either an Ok with a value or an Err with an error.
 * @class
 * @template T - The type of the Ok value.
 * @template E - The type of the Err error.
 */
export class Result<T extends Defined, E extends Defined> {
  #ok: boolean;
  #value: T | E;

  private constructor(ok: boolean, value: T | E) {
    this.#ok = ok;
    this.#value = value;
  }

  /**
   * Creates a Result instance with an Ok value.
   * @static
   * @param {T} value - The value to be contained in the Ok result.
   * @returns {Result<T, never>} A Result instance with the Ok value.
   * @example
   * const okResult = Result.Ok(42);
   */
  static Ok<T extends Defined>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  /**
   * Creates a Result instance with an Err error.
   * @static
   * @param {E} error - The error to be contained in the Err result.
   * @returns {Result<never, E>} A Result instance with the Err error.
   * @example
   * const errResult = Result.Err("Error message");
   */
  static Err<E extends Defined>(error: E): Result<never, E> {
    return new Result<never, E>(false, error);
  }

  /**
   * Matches the result, applying the provided function onOk if the result is Ok, or onErr if the result is Err.
   * @param {(value: T) => U} onOk - The function to apply if the result is Ok.
   * @param {(error: E) => U} onErr - The function to apply if the result is Err.
   * @returns {U} The result of applying the appropriate function.
   * @template U - The type of the result returned by the functions.
   * @example
   * const okResult = Result.Ok(42);
   * const result = okResult.match(
   *   (value) => {
   *     // Handle case when result is Ok
   *     return value * 2;
   *   },
   *   (error) => {
   *     // Handle case when result is Err
   *     return "Error: " + error;
   *   }
   * );
   */
  match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    if (this.#ok) {
      return onOk(this.#value as T);
    }
    return onErr(this.#value as E);
  }

  /**
   * Checks if the result is Ok.
   * @returns {boolean} true if the result is Ok, false if it is Err.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const isOk = okResult.isOk(); // Returns: true
   */
  isOk(): boolean {
    return this.match(() => true, () => false);
  }

  /**
   * Checks if the result is Ok and satisfies a given condition.
   * @param {(value: T) => boolean} fn - The condition function to check against the Ok value.
   * @returns {boolean} true if the result is Ok and the condition is satisfied, false otherwise.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const isGreaterThan20 = okResult.isOkAnd((value) => value > 20); // Returns: true
   */
  isOkAnd(fn: (value: T) => boolean): boolean {
    return this.match(fn, () => false);
  }

  /**
   * Checks if the result is Err.
   * @returns {boolean} true if the result is Err, false if it is Ok.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * const isErr = errResult.isErr(); // Returns: true
   */
  isErr(): boolean {
    return this.match(() => false, () => true);
  }

  /**
   * Checks if the result is Err and satisfies a given condition.
   * @param {(error: E) => boolean} fn - The condition function to check against the Err value.
   * @returns {boolean} true if the result is Err and the condition is satisfied, false otherwise.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * const isErrorLong = errResult.isErrAnd((error) => error.length > 10); // Returns: true
   */
  isErrAnd(fn: (error: E) => boolean): boolean {
    return this.match(() => false, fn);
  }

  /**
   * Transforms the result into an Option containing the Ok value if the result is Ok, or a None if the result is Err.
   * @returns {Option<T>} An Option containing the Ok value or a None if the result is Err.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const option = okResult.ok(); // Returns: Option.Some(42)
   */
  ok(): Option<T> {
    return this.match(Some, () => None);
  }

  /**
   * Transforms the result into an Option containing the Err value if the result is Err, or a None if the result is Ok.
   * @returns {Option<E>} An Option containing the Err value or a None if the result is Ok.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * const option = errResult.err(); // Returns: Option.Some("Error message")
   */
  err(): Option<E> {
    return this.match(() => None, Some);
  }

  /**
   * Transforms the Ok value inside the result using the provided function if the result is Ok. If the result is Err, returns the original result.
   * @param {(value: T) => U} fn - The function to apply to the Ok value inside the result.
   * @returns {Result<U, E>} A new Result containing the transformed Ok value or the original result if it is Err.
   * @method
   * @template U - The type of the transformed Ok value.
   * @example
   * const okResult = Result.Ok(42);
   * const mappedResult = okResult.map((value) => value * 2); // Returns: Result.Ok(84)
   */
  map<U extends Defined>(fn: (value: T) => U): Result<U, E> {
    return this.match(
      (value) => Ok(fn(value)),
      () => this as unknown as Result<U, E>,
    );
  }

  /**
   * Transforms the Ok value inside the result using the provided function if the result is Ok. If the result is Err, returns a default value.
   * @param {U} defaultValue - The default value to return if the result is Err.
   * @param {(value: T) => U} fn - The function to apply to the Ok value inside the result.
   * @returns {U} The transformed Ok value or the default value if the result is Err.
   * @method
   * @template U - The type of the transformed Ok value.
   * @example
   * const okResult = Result.Ok(42);
   * const result = okResult.mapOr(0, (value) => value * 2); // Returns: 84
   */
  mapOr<U extends Defined>(defaultValue: U, fn: (value: T) => U): U {
    return this.match(fn, () => defaultValue);
  }

  /**
   * Transforms the Ok value inside the result using the provided function if the result is Ok. If the result is Err, evaluates a function to get a default value.
   * @param {(error: E) => U} defaultValue - The function to provide a default value if the result is Err.
   * @param {(value: T) => U} fn - The function to apply to the Ok value inside the result.
   * @returns {U} The transformed Ok value or the result of the provided function if the result is Err.
   * @method
   * @template U - The type of the transformed Ok value.
   * @example
   * const okResult = Result.Ok(42);
   * const result = okResult.mapOrElse(() => 0, (value) => value * 2); // Returns: 84
   */
  mapOrElse<U extends Defined>(
    defaultValue: (error: E) => U,
    fn: (value: T) => U,
  ): U {
    return this.match(fn, defaultValue);
  }

  /**
   * Transforms the Err value inside the result using the provided function if the result is Err. If the result is Ok, returns the original result.
   * @param {(error: E) => F} fn - The function to apply to the Err value inside the result.
   * @returns {Result<T, F>} A new Result containing the transformed Err value or the original result if it is Ok.
   * @method
   * @template F - The type of the transformed Err value.
   * @example
   * const errResult = Result.Err("Error message");
   * const mappedResult = errResult.mapErr((error) => "New error: " + error); // Returns: Result.Err("New error: Error message")
   */
  mapErr<F extends Defined>(fn: (error: E) => F): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      (error) => Err(fn(error)),
    );
  }

  /**
   * Applies a function to the Ok value inside the result if it is Ok. If the result is Err, does nothing.
   * @param {(value: T) => void} fn - The function to apply to the Ok value inside the result.
   * @returns {this} The current result instance.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * okResult.inspect((value) => console.log(value)); // Logs: 42
   */
  inspect(fn: (value: T) => void): this {
    this.match(fn, () => void 0);
    return this;
  }

  /**
   * Applies a function to the Err value inside the result if it is Err. If the result is Ok, does nothing.
   * @param {(error: E) => void} fn - The function to apply to the Err value inside the result.
   * @returns {this} The current result instance.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * errResult.inspectErr((error) => console.error(error)); // Logs: Error message
   */
  inspectErr(fn: (error: E) => void): this {
    this.match(() => void 0, fn);
    return this;
  }

  /**
   * Expects the result to be Ok and returns the Ok value. If the result is Err, raises an error with the specified message.
   * @param {string} message - The error message to raise if the result is Err.
   * @returns {T} The Ok value inside the result.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const value = okResult.expect("Expected the result to be Ok."); // Returns: 42
   */
  expect(message: string): T {
    return this.match((value) => value, (error) => raise(message, error));
  }

  /**
   * Unwraps the Ok value from the result if it is Ok. If the result is Err, raises an error.
   * @returns {T} The Ok value inside the result.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const value = okResult.unwrap(); // Returns: 42
   */
  unwrap(): T {
    return this.match(
      (value) => value,
      () => raise("called `Result.unwrap` on an `Err` value"),
    );
  }

  /**
   * Expects the result to be Err and returns the Err value. If the result is Ok, raises an error with the specified message.
   * @param {string} message - The error message to raise if the result is Ok.
   * @returns {E} The Err value inside the result.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * const error = errResult.expectErr("Expected the result to be Err."); // Returns: "Error message"
   */
  expectErr(message: string): E {
    return this.match((value) => raise(message, value), (error) => error);
  }

  /**
   * Unwraps the Err value from the result if it is Err. If the result is Ok, raises an error.
   * @returns {E} The Err value inside the result.
   * @method
   * @example
   * const errResult = Result.Err("Error message");
   * const error = errResult.unwrapErr(); // Returns: "Error message"
   */
  unwrapErr(): E {
    return this.match(
      () => raise("called `Result.unwrapErr` on an `Ok` value"),
      (error) => error,
    );
  }

  /**
   * Combines two results into a single result. If the first result is Ok, returns the second result. If the first result is Err, returns the first result.
   * @param {Result<U, E>} res - The second result to combine with the first result.
   * @returns {Result<U, E>} The combined result.
   * @method
   * @template U - The type of the Ok value inside the second result.
   * @example
   * const okResultA = Result.Ok(42);
   * const okResultB = Result.Ok("Hello");
   * const result = okResultA.and(okResultB); // Returns: Result.Ok("Hello")
   */
  and<U extends Defined>(res: Result<U, E>): Result<U, E> {
    return this.match(() => res, () => this as unknown as Result<U, E>);
  }

  /**
   * Applies a function to the Ok value inside the result if it is Ok. If the result is Err, returns the original result.
   * @param {(value: T) => Result<U, E>} fn - The function to apply to the Ok value inside the result.
   * @returns {Result<U, E>} A new result containing the transformed Ok value or the original result if it is Err.
   * @method
   * @template U - The type of the Ok value inside the new result.
   * @example
   * const okResult = Result.Ok(42);
   * const result = okResult.andThen((value) => Result.Ok(value * 2)); // Returns: Result.Ok(84)
   */
  andThen<U extends Defined>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.match(fn, () => this as unknown as Result<U, E>);
  }

  /**
   * Combines two results into a single result. If the first result is Ok, returns the first result. If the first result is Err, returns the second result.
   * @param {Result<T, F>} res - The second result to combine with the first result.
   * @returns {Result<T, F>} The combined result.
   * @method
   * @template F - The type of the Err value inside the second result.
   * @example
   * const errResultA = Result.Err("Error message");
   * const errResultB = Result.Err("Another error");
   * const result = errResultA.or(errResultB); // Returns: Result.Err("Error message")
   */
  or<F extends Defined>(res: Result<T, F>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, () => res);
  }

  /**
   * Applies a function to the Err value inside the result if it is Err. If the result is Ok, returns the original result.
   * @param {(error: E) => Result<T, F>} fn - The function to apply to the Err value inside the result.
   * @returns {Result<T, F>} A new result containing the transformed Err value or the original result if it is Ok.
   * @method
   * @template F - The type of the Err value inside the new result.
   * @example
   * const errResult = Result.Err("Error message");
   * const result = errResult.orElse((error) => Result.Err("New error: " + error)); // Returns: Result.Err("New error: Error message")
   */
  orElse<F extends Defined>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, fn);
  }

  /**
   * Unwraps the Ok value from the result if it is Ok. If the result is Err, returns a default value.
   * @param {T} defaultValue - The default value to return if the result is Err.
   * @returns {T} The Ok value inside the result or the default value if it is Err.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const value = okResult.unwrapOr(0); // Returns: 42
   */
  unwrapOr(defaultValue: T): T {
    return this.match((value) => value, () => defaultValue);
  }

  /**
   * Unwraps the Ok value from the result if it is Ok. If the result is Err, evaluates a function to get a default value.
   * @param {(error: E) => T} fn - The function to provide a default value if the result is Err.
   * @returns {T} The Ok value inside the result or the result of the provided function if it is Err.
   * @method
   * @example
   * const okResult = Result.Ok(42);
   * const value = okResult.unwrapOrElse((error) => error.length); // Returns: 42
   */
  unwrapOrElse(fn: (error: E) => T): T {
    return this.match((value) => value, fn);
  }
}

export const { Ok, Err } = Result;
