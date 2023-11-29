import { Err, Ok, type Result } from "./result.ts";
import { Defined } from "./types.ts";
import { isDefined, raise } from "./util.ts";

export class Option<T extends Defined> {
  #value?: T;

  private constructor(value?: T) {
    this.#value = value;
  }

  static Some<T extends Defined>(value: T): Option<T> {
    return new Option(value);
  }

  static None = new Option<never>();

  static from<T>(value: T): Option<NonNullable<T>> {
    return new Option(value as NonNullable<T>);
  }

  match<U>(onSome: (value: T) => U, onNone: () => U): U {
    if (isDefined(this.#value)) {
      return onSome(this.#value);
    }
    return onNone();
  }

  isSome(): boolean {
    return this.match(() => true, () => false);
  }

  isSomeAnd(fn: (value: T) => boolean): boolean {
    return this.match(fn, () => false);
  }

  isNone(): boolean {
    return this.match(() => false, () => true);
  }

  expect(message: string): T {
    return this.match((value) => value, () => raise(message));
  }

  unwrap(): T {
    return this.match(
      (value) => value,
      () => raise("called `Option.unwrap()` on a `None` value"),
    );
  }

  unwrapOr(defaultValue: T): T {
    return this.match((value) => value, () => defaultValue);
  }

  unwrapOrElse(fn: () => T): T {
    return this.match((value) => value, fn);
  }

  map<U extends Defined>(fn: (value: T) => U): Option<U> {
    return this.match(
      (value) => new Option(fn(value)),
      () => this as unknown as Option<U>,
    );
  }

  inspect(fn: (value: T) => void): this {
    this.match(fn, () => void 0);
    return this;
  }

  mapOr<U extends Defined>(defaultValue: U, fn: (value: T) => U): U {
    return this.match(fn, () => defaultValue);
  }

  mapOrElse<U extends Defined>(defaultValue: () => U, fn: (value: T) => U): U {
    return this.match(fn, defaultValue);
  }

  okOr<E extends Defined>(err: E): Result<T, E> {
    return this.match((value) => Ok(value) as Result<T, E>, () => Err(err));
  }

  okOrElse<E extends Defined>(fn: () => E): Result<T, E> {
    return this.match((value) => Ok(value) as Result<T, E>, () => Err(fn()));
  }

  and<U extends Defined>(optb: Option<U>): Option<U> {
    return this.match(() => optb, () => this as unknown as Option<U>);
  }

  andThen<U extends Defined>(fn: (value: T) => Option<U>): Option<U> {
    return this.match(fn, () => this as unknown as Option<U>);
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.isSomeAnd(predicate)) {
      return this;
    }
    return new Option();
  }

  or(optb: Option<T>): Option<T> {
    return this.match(() => this, () => optb);
  }

  orElse(fn: () => Option<T>): Option<T> {
    return this.match(() => this, fn);
  }

  xor(optb: Option<T>): Option<T> {
    if (this.isSome() && optb.isNone()) return this;
    if (this.isNone() && optb.isSome()) return optb;
    return new Option();
  }

  zip<U extends Defined>(optb: Option<U>): Option<[T, U]> {
    if (this.isSome() && optb.isSome()) {
      return new Option([this.unwrap(), optb.unwrap()]);
    }
    return new Option();
  }

  zipWith<U extends Defined, R extends Defined>(
    optb: Option<U>,
    fn: (a: T, b: U) => R,
  ): Option<R> {
    if (this.isSome() && optb.isSome()) {
      return new Option(fn(this.unwrap(), optb.unwrap()));
    }
    return new Option();
  }
}

export const { Some, None } = Option;
