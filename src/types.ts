export type Constructor<T> = {
    new (...args: any[]): T;
};

export type SimpleConstructor<T> = {
  new (): T;
};

export type ObjectLiteral = {
  [key: string]: any;
}

export type Promiseable<T> = T | Promise<T>;

export type ObjectWithKeyVal<TKey extends string, TValue> = {
  [key in TKey]: TValue;
};
