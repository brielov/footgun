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
  [K in keyof T]: T[K] extends Defined ? Schema<T[K]>
    : never;
};

export type Infer<T> = T extends Schema<infer U> ? U : never;

type InferTuple<T> = T extends [Schema<infer A>, ...infer B]
  ? [A, ...InferTuple<B>]
  : [];

// deno-lint-ignore no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

function createErr(message: string, input: unknown): Result<never, ParseError> {
  return Err({ path: [], message, input });
}

export const string = (message = "Expected string"): Schema<string> => ({
  name: "string",
  parse: (input) => isString(input) ? Ok(input) : createErr(message, input),
});

export const number = (message = "Expected number"): Schema<number> => ({
  name: "number",
  parse: (input) =>
    isNumber(input) && Number.isFinite(input)
      ? Ok(input)
      : createErr(message, input),
});

export const boolean = (message = "Expected boolean"): Schema<boolean> => ({
  name: "boolean",
  parse: (input) => isBoolean(input) ? Ok(input) : createErr(message, input),
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
  parse: (input) => isDefined(input) ? schema.parse(input) : Ok(defaultValue),
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

export const literal = <T extends (number | string | boolean)>(
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
