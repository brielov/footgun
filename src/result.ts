import { None, type Option, Some } from "./option.ts";
import { Defined } from "./types.ts";
import { raise } from "./util.ts";

export class Result<T extends Defined, E extends Defined> {
  #ok: boolean;
  #value: T | E;

  private constructor(ok: boolean, value: T | E) {
    this.#ok = ok;
    this.#value = value;
  }

  static Ok<T extends Defined>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  static Err<E extends Defined>(error: E): Result<never, E> {
    return new Result<never, E>(false, error);
  }

  match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    if (this.#ok) {
      return onOk(this.#value as T);
    }
    return onErr(this.#value as E);
  }

  isOk(): boolean {
    return this.match(() => true, () => false);
  }

  isOkAnd(fn: (value: T) => boolean): boolean {
    return this.match(fn, () => false);
  }

  isErr(): boolean {
    return this.match(() => false, () => true);
  }

  isErrAnd(fn: (error: E) => boolean): boolean {
    return this.match(() => false, fn);
  }

  ok(): Option<T> {
    return this.match(Some, () => None);
  }

  err(): Option<E> {
    return this.match(() => None, Some);
  }

  map<U extends Defined>(fn: (value: T) => U): Result<U, E> {
    return this.match(
      (value) => Ok(fn(value)),
      () => this as unknown as Result<U, E>,
    );
  }

  mapOr<U extends Defined>(defaultValue: U, fn: (value: T) => U): U {
    return this.match(fn, () => defaultValue);
  }

  mapOrElse<U extends Defined>(
    defaultValue: (error: E) => U,
    fn: (value: T) => U,
  ): U {
    return this.match(fn, defaultValue);
  }

  mapErr<F extends Defined>(fn: (error: E) => F): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      (error) => Err(fn(error)),
    );
  }

  inspect(fn: (value: T) => void): this {
    this.match(fn, () => void 0);
    return this;
  }

  inspectErr(fn: (error: E) => void): this {
    this.match(() => void 0, fn);
    return this;
  }

  expect(message: string): T {
    return this.match((value) => value, (error) => raise(message, error));
  }

  unwrap(): T {
    return this.match(
      (value) => value,
      () => raise("called `Result.unwrap` on an `Err` value"),
    );
  }

  expectErr(message: string): E {
    return this.match((value) => raise(message, value), (error) => error);
  }

  unwrapErr(): E {
    return this.match(
      () => raise("called `Result.unwrapErr` on an `Ok` value"),
      (error) => error,
    );
  }

  and<U extends Defined>(res: Result<U, E>): Result<U, E> {
    return this.match(() => res, () => this as unknown as Result<U, E>);
  }

  andThen<U extends Defined>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.match(fn, () => this as unknown as Result<U, E>);
  }

  or<F extends Defined>(res: Result<T, F>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, () => res);
  }

  orElse<F extends Defined>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, fn);
  }

  unwrapOr(defaultValue: T): T {
    return this.match((value) => value, () => defaultValue);
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return this.match((value) => value, fn);
  }
}

export const { Ok, Err } = Result;
