import { storeIsInputObjectType, storeObjectTypeConfig } from '../metadata';
import { AnyConstructor } from '../types';

export type InputObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
}

export default <TSource, TContext>(config: InputObjectTypeConfig<TSource, TContext> = {}) =>
  (target: AnyConstructor<TSource>) => {
    storeIsInputObjectType(target);
    storeObjectTypeConfig(target, {
      ...config,
      name: config.name || target.name,
    });
  };

