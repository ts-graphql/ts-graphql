/**
 * Any class
 */
export type Constructor<T> = Function & { prototype: T };

/**
 * Class with empty constructor
 */
export type SimpleConstructor<T> = {
  new (): T;
};

export type ObjectLiteral = {
  [key: string]: any;
}

export type Maybe<T> = T | null | undefined;

export type Promiseable<T> = T | Promise<T>;

export type ObjectWithKeyVal<TKeys extends string, TValue> = {
  [key in TKeys]: TValue;
};

export type ObjectWithOptionalKeyVal<TKeys extends string, TValue> = {
  [key in TKeys]?: TValue;
}

export type MappedKeyValObject<TKeys extends string, TValue extends ObjectWithOptionalKeyVal<TKeys, any>> = {
  [key in TKeys]: TValue[key]
}

export type OptionalMappedKeyValObject<TKeys extends string, TValue extends ObjectWithOptionalKeyVal<TKeys, any>> = {
  [key in TKeys]?: TValue[key]
}
