import 'reflect-metadata';
import { graphQLInputTypeForWrapper, WrapperOrType } from '../wrappers/Wrapper';
import { Constructor, ObjectLiteral } from '../types';

type ArgConfig<T> = {
  type: WrapperOrType<T>,
  defaultValue?: T,
  description?: string,
}

const argsKey = Symbol('args');

export const getArgs = (target: Constructor<any>) => {
  return Reflect.getMetadata(argsKey, target.prototype);
}

export const Args = () => (source: Constructor<any>) => {
  // no op for now
}

export const Arg = <T>(config: ArgConfig<T>) => (target: ObjectLiteral, key: string) => {
  const currentArgs = Reflect.getMetadata(argsKey, target);
  Reflect.defineMetadata(argsKey, {
    ...currentArgs,
    [key]: {
      ...config,
      type: graphQLInputTypeForWrapper(config.type),
    },
  }, target)
}

