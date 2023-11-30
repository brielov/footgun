import { List } from "./list.ts";
import { None, Option, Some } from "./option.ts";
import { Err, Ok, Result } from "./result.ts";
import { Defined, PlainObject } from "./types.ts";
import {
  isArray,
  isBoolean,
  isDate,
  isDefined,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from "./util.ts";

export type ParseError = {
  path: string[];
  message: string;
  input: unknown;
};

export interface Schema<T extends Defined> {
  name: string;
  parse(input: unknown): Result<T, ParseError>;
}

export interface ObjectSchema<T extends PlainObject> extends Schema<T> {
  shape: Shape<T>;
}

type Shape<T extends PlainObject> = {
  [K in keyof T]: T[K] extends Defined ? Schema<T[K]> : never;
};

export type Infer<T> = T extends Schema<infer U> ? U : never;

type InferTuple<T> = T extends [Schema<infer A>, ...infer B]
  ? [A, ...InferTuple<B>]
  : [];

// deno-lint-ignore no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type Pipe<T extends Defined> = (input: T) => Result<T, string>;
type Pipeline<T extends Defined> = ReadonlyArray<Pipe<T>>;

function createErr(message: string, input: unknown): Result<never, ParseError> {
  return Err({ path: [], message, input });
}

function runPipeline<T extends Defined>(
  value: T,
  pipeline: Pipeline<T>,
): Result<T, string> {
  let acc = value;
  for (const pipe of pipeline) {
    const result = pipe(acc);
    if (result.isErr()) return result;
    acc = result.unwrap();
  }
  return Ok(acc);
}

const COERCE: Record<string, (input: unknown) => unknown> = {
  number: (input) => Number(input),
  string: (input) => String(input),
  date: (input) =>
    isString(input) || isNumber(input) ? new Date(input) : input,
  boolean: (input) =>
    (isString(input) &&
      ["on", "yes", "true"].includes(input.trim().toLowerCase())) ||
    Boolean(input),
  list: (input) => (isArray(input) ? input : [input]),
};

export function coerce<T extends Defined>(schema: Schema<T>): Schema<T> {
  const coerceFn = COERCE[schema.name];
  if (isUndefined(coerceFn)) {
    throw new Error(`Cannot coerce type ${schema.name}`);
  }
  return {
    ...schema,
    parse: (input) => schema.parse(coerceFn(input)),
  };
}

export const string = (
  pipeline: Pipeline<string> = [],
  message = "Expected string",
): Schema<string> => ({
  name: "string",
  parse: (input) => {
    if (!isString(input)) return createErr(message, input);
    return runPipeline(input, pipeline).mapErr((message) => ({
      path: [],
      message,
      input,
    }));
  },
});

export const minLength =
  (
    min: number,
    message = `Expected string to have a minimum of ${min} characters`,
  ): Pipe<string> =>
  (input) =>
    input.length < min ? Err(message) : Ok(input);

export const maxLength =
  (
    max: number,
    message = `Expected string to have a maximum of ${max} characters`,
  ): Pipe<string> =>
  (input) =>
    input.length > max ? Err(message) : Ok(input);

export const trim = (): Pipe<string> => (input) => Ok(input.trim());
export const lowercase = (): Pipe<string> => (input) => Ok(input.toLowerCase());
export const uppercase = (): Pipe<string> => (input) => Ok(input.toUpperCase());

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const email =
  (message = "Expected string to be a valid email address"): Pipe<string> =>
  (input) => {
    return EMAIL_REGEX.test(input) &&
      input.indexOf("@") !== 0 &&
      input.lastIndexOf(".") > input.indexOf("@")
      ? Ok(input)
      : Err(message);
  };

export const number = (
  pipeline: Pipeline<number> = [],
  message = "Expected number",
): Schema<number> => ({
  name: "number",
  parse: (input) => {
    if (!isNumber(input) || !Number.isFinite(input)) {
      return createErr(message, input);
    }
    return runPipeline(input, pipeline).mapErr((message) => ({
      path: [],
      message,
      input,
    }));
  },
});

export const min =
  (
    min: number,
    message = `Expected number to be at minimum ${min}`,
  ): Pipe<number> =>
  (input) =>
    input < min ? Err(message) : Ok(input);

export const max =
  (
    max: number,
    message = `Expected number to be at maximum ${max}`,
  ): Pipe<number> =>
  (input) =>
    input > max ? Err(message) : Ok(input);

export const integer =
  (message = "Expecting number to be an integer"): Pipe<number> =>
  (input) =>
    Number.isInteger(input) ? Ok(input) : Err(message);

export const clamp =
  (min: number, max: number): Pipe<number> =>
  (input) =>
    Ok(Math.max(min, Math.min(max, input)));

export const boolean = (message = "Expected boolean"): Schema<boolean> => ({
  name: "boolean",
  parse: (input) => (isBoolean(input) ? Ok(input) : createErr(message, input)),
});

export const date = (message = "Expected date"): Schema<Date> => ({
  name: "date",
  parse: (input) =>
    isDate(input) && Number.isFinite(input.getTime())
      ? Ok(new Date(input))
      : createErr(message, input),
});

export const list = <T extends Defined>(
  schema: Schema<T>,
  message = "Expected array",
): Schema<List<T>> => ({
  name: "list",
  parse: (input) => {
    if (!isArray(input)) return createErr(message, input);
    const arr: T[] = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const result = schema.parse(input[i]);
      if (result.isErr()) {
        const err = result.unwrapErr();
        err.path.unshift(i.toString());
        return Err(err);
      }
      arr[i] = result.unwrap();
    }
    return Ok(List.from(arr));
  },
});

export const object = <T extends PlainObject>(
  shape: Shape<T>,
  message = "Expected object",
): ObjectSchema<T> => ({
  shape,
  name: "object",
  parse: (input) => {
    if (!isObject(input)) return createErr(message, input);
    const obj = Object.create(null);
    for (const key in shape) {
      const result = shape[key].parse(input[key]);
      if (result.isErr()) {
        const err = result.unwrapErr();
        err.path.unshift(key);
        return Err(err);
      }
      obj[key] = result.unwrap();
    }
    return Ok(obj);
  },
});

export const optional = <T extends Defined>(
  schema: Schema<T>,
): Schema<Option<T>> => ({
  ...schema,
  parse: (input) =>
    !isDefined(input) ? Ok(None) : schema.parse(input).map(Some),
});

export const defaulted = <T extends Defined>(
  schema: Schema<T>,
  defaultValue: T,
): Schema<T> => ({
  ...schema,
  parse: (input) => (isDefined(input) ? schema.parse(input) : Ok(defaultValue)),
});

export const pick = <T extends PlainObject, K extends keyof T>(
  schema: ObjectSchema<T>,
  keys: readonly K[],
  message = "Expected object",
): ObjectSchema<Prettify<Pick<T, K>>> => {
  const nextShape = Object.create(null);
  for (const key of Object.keys(schema.shape)) {
    if (keys.includes(key as K)) {
      nextShape[key] = schema.shape[key];
    }
  }
  return object(nextShape, message);
};

export const omit = <T extends PlainObject, K extends keyof T>(
  schema: ObjectSchema<T>,
  keys: readonly K[],
  message = "Expected object",
): ObjectSchema<Prettify<Omit<T, K>>> => {
  const nextShape = Object.create(null);
  for (const key of Object.keys(schema.shape)) {
    if (!keys.includes(key as K)) {
      nextShape[key] = schema.shape[key];
    }
  }
  return object(nextShape, message);
};

export const literal = <T extends number | string | boolean>(
  constant: T,
  message = `Expecting literal ${constant}`,
): Schema<T> => ({
  name: "literal",
  parse: (input) =>
    Object.is(constant, input) ? Ok(input as T) : createErr(message, input),
});

export const tuple = <A extends Schema<Defined>, B extends Schema<Defined>[]>(
  schemas: [A, ...B],
  message = `Expecting tuple of [${schemas.map((s) => s.name).join(", ")}]`,
): Schema<[Infer<A>, ...InferTuple<B>]> => ({
  name: "tuple",
  parse: (input) => {
    if (!isArray(input)) return createErr(message, input);
    const arr = new Array(schemas.length) as [Infer<A>, ...InferTuple<B>];
    for (let i = 0; i < schemas.length; i++) {
      const result = schemas[i].parse(input[i]);
      if (result.isErr()) {
        const err = result.unwrapErr();
        err.path.unshift(i.toString());
        return Err(err);
      }
      // deno-lint-ignore no-explicit-any
      arr[i] = result.unwrap() as any;
    }
    return Ok(arr);
  },
});

export const union = <A extends Schema<Defined>, B extends Schema<Defined>[]>(
  schemas: [A, ...B],
  message = `Expecting one of ${schemas.map((s) => s.name).join(", ")}`,
): Schema<Infer<A> | Infer<B[number]>> => ({
  name: "union",
  parse: (input) => {
    for (const schema of schemas) {
      const result = schema.parse(input);
      if (result.isOk()) {
        // deno-lint-ignore no-explicit-any
        return result as any;
      }
    }
    return createErr(message, input);
  },
});

export const intersection = <
  A extends ObjectSchema<Defined>,
  B extends ObjectSchema<Defined>[],
>(
  schemas: [A, ...B],
  message = "Expecting object",
): ObjectSchema<Prettify<UnionToIntersection<Infer<A> | Infer<B[number]>>>> => {
  const shapes = schemas.map((s) => s.shape);
  return object(Object.assign({}, ...shapes), message);
};
