import { Err, Ok, type Result } from "./result.ts";
import { Defined } from "./types.ts";
import { isDefined, raise } from "./util.ts";

/**
 * Represents an option type that may or may not have a value.
 * @class
 * @template T - The type of the value contained in the option.
 */
export class Option<T extends Defined> {
  #value?: T;

  private constructor(value?: T) {
    this.#value = value;
  }

  /**
   * Creates an Option instance with a defined value.
   * @static
   * @param {T} value - The value to be contained in the option.
   * @returns {Option<T>} An Option instance with the provided value.
   * @example
   * const someOption = Option.Some(42);
   */
  static Some<T extends Defined>(value: T): Option<T> {
    return new Option(value);
  }

  /**
   * Represents an Option instance with no value (None).
   * @static
   * @type {Option<never>}
   * @example
   * const noneOption = Option.None;
   */
  static None: Option<never> = new Option();

  /**
   * Creates an Option instance from a value, ensuring it is not nullable.
   * @static
   * @param {T} value - The value to be contained in the option.
   * @returns {Option<NonNullable<T>>} An Option instance with the provided non-nullable value.
   * @example
   * const nonNullableOption = Option.from("Hello");
   */
  static from<T>(value: T): Option<NonNullable<T>> {
    return new Option(value as NonNullable<T>);
  }

  /**
   * Matches the option, applying the provided function onSome if the option has a value,
   * or the function onNone if the option is None.
   * @param {(value: T) => U} onSome - The function to apply if the option has a value.
   * @param {() => U} onNone - The function to apply if the option is None.
   * @returns {U} The result of applying the appropriate function.
   * @template U - The type of the result returned by the functions.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.match(
   *   (value) => {
   *     // Handle case when option has a value
   *     return value * 2;
   *   },
   *   () => {
   *     // Handle case when option is None
   *     return 0;
   *   }
   * );
   */
  match<U>(onSome: (value: T) => U, onNone: () => U): U {
    if (isDefined(this.#value)) {
      return onSome(this.#value);
    }
    return onNone();
  }

  /**
   * Checks if the option has a value (Some).
   * @returns {boolean} true if the option has a value, false if it is None.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const isSome = someOption.isSome(); // Returns: true
   */
  isSome(): boolean {
    return this.match(
      () => true,
      () => false,
    );
  }

  /**
   * Checks if the option has a value (Some) and satisfies a given condition.
   * @param {(value: T) => boolean} fn - The condition function to check against the value.
   * @returns {boolean} true if the option has a value and the condition is satisfied, false if it is None or the condition is not met.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const isGreaterThan20 = someOption.isSomeAnd((value) => value > 20); // Returns: true
   */
  isSomeAnd(fn: (value: T) => boolean): boolean {
    return this.match(fn, () => false);
  }

  /**
   * Checks if the option is None.
   * @returns {boolean} true if the option is None, false if it has a value (Some).
   * @method
   * @example
   * const noneOption = Option.None;
   * const isNone = noneOption.isNone(); // Returns: true
   */
  isNone(): boolean {
    return this.match(
      () => false,
      () => true,
    );
  }

  /**
   * Expects the option to have a value (Some). If the option is None, raises an error with the specified message.
   * @param {string} message - The error message to raise if the option is None.
   * @returns {T} The value contained in the option.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const value = someOption.expect("Expected the option to have a value."); // Returns: 42
   */
  expect(message: string): T {
    return this.match(
      (value) => value,
      () => raise(message),
    );
  }

  /**
   * Unwraps the value from the option if it has a value (Some). If the option is None, raises an error.
   * @returns {T} The value contained in the option.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const value = someOption.unwrap(); // Returns: 42
   */
  unwrap(): T {
    return this.match(
      (value) => value,
      () => raise("called `Option.unwrap()` on a `None` value"),
    );
  }

  /**
   * Unwraps the value from the option if it has a value (Some). If the option is None, returns the specified default value.
   * @param {T} defaultValue - The value to return if the option is None.
   * @returns {T} The value contained in the option or the default value if the option is None.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const value = someOption.unwrapOr(0); // Returns: 42
   */
  unwrapOr(defaultValue: T): T {
    return this.match(
      (value) => value,
      () => defaultValue,
    );
  }

  /**
   * Unwraps the value from the option if it has a value (Some). If the option is None, evaluates the provided function to get a default value.
   * @param {() => T} fn - The function to provide a default value if the option is None.
   * @returns {T} The value contained in the option or the result of the provided function if the option is None.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const value = someOption.unwrapOrElse(() => 0); // Returns: 42
   */
  unwrapOrElse(fn: () => T): T {
    return this.match((value) => value, fn);
  }

  /**
   * Transforms the value inside the option using the provided function if the option has a value (Some). If the option is None, returns a new None.
   * @param {(value: T) => U} fn - The function to apply to the value inside the option.
   * @returns {Option<U>} A new option containing the transformed value, or None if the original option is None.
   * @method
   * @template U - The type of the value inside the new option.
   * @example
   * const someOption = Option.Some(42);
   * const transformedOption = someOption.map((value) => value * 2); // Returns: Option.Some(84)
   */
  map<U extends Defined>(fn: (value: T) => U): Option<U> {
    return this.match(
      (value) => new Option(fn(value)),
      () => this as unknown as Option<U>,
    );
  }

  /**
   * Applies a function to the value inside the option if it has a value (Some). If the option is None, does nothing.
   * @param {(value: T) => void} fn - The function to apply to the value inside the option.
   * @returns {this} The current option instance.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * someOption.inspect((value) => console.log(value)); // Logs: 42
   */
  inspect(fn: (value: T) => void): this {
    this.match(fn, () => void 0);
    return this;
  }

  /**
   * Transforms the value inside the option using the provided function if the option has a value (Some). If the option is None, returns a default value.
   * @param {U} defaultValue - The default value to return if the option is None.
   * @param {(value: T) => U} fn - The function to apply to the value inside the option.
   * @returns {U} The transformed value inside the option or the default value if the option is None.
   * @method
   * @template U - The type of the transformed value.
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.mapOr(0, (value) => value * 2); // Returns: 84
   */
  mapOr<U extends Defined>(defaultValue: U, fn: (value: T) => U): U {
    return this.match(fn, () => defaultValue);
  }

  /**
   * Transforms the value inside the option using the provided function if the option has a value (Some). If the option is None, evaluates a function to get a default value.
   * @param {() => U} defaultValue - The function to provide a default value if the option is None.
   * @param {(value: T) => U} fn - The function to apply to the value inside the option.
   * @returns {U} The transformed value inside the option or the result of the provided function if the option is None.
   * @method
   * @template U - The type of the transformed value.
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.mapOrElse(() => 0, (value) => value * 2); // Returns: 84
   */
  mapOrElse<U extends Defined>(defaultValue: () => U, fn: (value: T) => U): U {
    return this.match(fn, defaultValue);
  }

  /**
   * Transforms the option into a Result, converting the value inside the option to Ok if it has a value (Some), or Err with the provided error value if the option is None.
   * @param {E} err - The error value to use if the option is None.
   * @returns {Result<T, E>} A Result containing either the value inside the option or the specified error value.
   * @method
   * @template E - The type of the error value.
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.okOr("Error message"); // Returns: Result.Ok(42)
   */
  okOr<E extends Defined>(err: E): Result<T, E> {
    return this.match(
      (value) => Ok(value) as Result<T, E>,
      () => Err(err),
    );
  }

  /**
   * Transforms the option into a Result, converting the value inside the option to Ok if it has a value (Some), or Err with the result of the provided function if the option is None.
   * @param {() => E} fn - The function to provide the error value if the option is None.
   * @returns {Result<T, E>} A Result containing either the value inside the option or the result of the provided function as the error value.
   * @method
   * @template E - The type of the error value.
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.okOrElse(() => "Error message"); // Returns: Result.Ok(42)
   */
  okOrElse<E extends Defined>(fn: () => E): Result<T, E> {
    return this.match(
      (value) => Ok(value) as Result<T, E>,
      () => Err(fn()),
    );
  }

  /**
   * Combines two options into a single option. If the first option has a value (Some), returns the second option. If the first option is None, returns a new None.
   * @param {Option<U>} optb - The second option to combine with the first option.
   * @returns {Option<U>} The combined option.
   * @method
   * @template U - The type of the value inside the second option.
   * @example
   * const someOptionA = Option.Some(42);
   * const someOptionB = Option.Some("Hello");
   * const result = someOptionA.and(someOptionB); // Returns: Option.Some("Hello")
   */
  and<U extends Defined>(optb: Option<U>): Option<U> {
    return this.match(
      () => optb,
      () => this as unknown as Option<U>,
    );
  }

  /**
   * Applies a function to the value inside the option if it has a value (Some). If the option is None, returns a new None.
   * @param {(value: T) => Option<U>} fn - The function to apply to the value inside the option.
   * @returns {Option<U>} A new option containing the transformed value, or None if the original option is None.
   * @method
   * @template U - The type of the value inside the new option.
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.andThen((value) => Option.Some(value * 2)); // Returns: Option.Some(84)
   */
  andThen<U extends Defined>(fn: (value: T) => Option<U>): Option<U> {
    return this.match(fn, () => this as unknown as Option<U>);
  }

  /**
   * Filters the option based on the provided predicate. If the option has a value (Some) and the predicate is satisfied, returns the original option. If the option is None or the predicate is not satisfied, returns a new None.
   * @param {(value: T) => boolean} predicate - The predicate function to check against the value inside the option.
   * @returns {Option<T>} The original option if the predicate is satisfied, or a new None.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const filteredOption = someOption.filter((value) => value > 20); // Returns: Option.Some(42)
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.isSomeAnd(predicate)) {
      return this;
    }
    return new Option();
  }

  /**
   * Combines two options into a single option. If the first option has a value (Some), returns the first option. If the first option is None, returns the second option.
   * @param {Option<T>} optb - The second option to combine with the first option.
   * @returns {Option<T>} The combined option.
   * @method
   * @example
   * const someOptionA = Option.Some(42);
   * const someOptionB = Option.Some(24);
   * const result = someOptionA.or(someOptionB); // Returns: Option.Some(42)
   */
  or(optb: Option<T>): Option<T> {
    return this.match(
      () => this,
      () => optb,
    );
  }

  /**
   * Applies a function to the value inside the option if it is None. If the option has a value (Some), returns the original option. If the option is None, evaluates the provided function to get a new option.
   * @param {() => Option<T>} fn - The function to provide a new option if the original option is None.
   * @returns {Option<T>} The original option if it has a value, or the result of the provided function if it is None.
   * @method
   * @example
   * const someOption = Option.Some(42);
   * const result = someOption.orElse(() => Option.Some(24)); // Returns: Option.Some(42)
   */
  orElse(fn: () => Option<T>): Option<T> {
    return this.match(() => this, fn);
  }

  /**
   * Performs an exclusive OR operation between two options. If one option has a value (Some) and the other is None, returns the option with a value. If both options have values or both are None, returns a new None.
   * @param {Option<T>} optb - The second option to XOR with the first option.
   * @returns {Option<T>} The result of the XOR operation.
   * @method
   * @example
   * const someOptionA = Option.Some(42);
   * const noneOptionB = Option.None;
   * const result = someOptionA.xor(noneOptionB); // Returns: Option.Some(42)
   */
  xor(optb: Option<T>): Option<T> {
    if (this.isSome() && optb.isNone()) return this;
    if (this.isNone() && optb.isSome()) return optb;
    return new Option();
  }
}

export const { Some, None } = Option;
