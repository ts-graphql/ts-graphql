/**
 * Any non-abstract class
 */
export type Constructor<T> = {
    new (...args: any[]): T;
};

/**
 * Class with empty constructor
 */
export type SimpleConstructor<T> = {
  new (): T;
};

/**
 * Any class
 */
export type AbstractConstructor<T> = Function & { prototype: T };

export type ObjectLiteral = {
  [key: string]: any;
}

export type Promiseable<T> = T | Promise<T>;

export type ObjectWithKeyVal<TKey extends string, TValue> = {
  [key in TKey]: TValue;
};
