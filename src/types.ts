export type Constructor<T> = {
    new (...args: any[]): T;
};

export type ObjectLiteral = {
  [key: string]: any;
}

export type Promiseable<T> = T | Promise<T>;
