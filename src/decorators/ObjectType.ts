import { Thunk } from 'graphql';
import {
  storeFieldConfigMap, storeIsObjectType,
  storeObjectTypeConfig,
} from '../metadata';
import { Constructor } from '../types';
import { FieldConfigMap } from '../fields';

export type ObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
  fields?: Thunk<FieldConfigMap<TSource, TContext>>
}

export default <TSource, TContext>(config: ObjectTypeConfig<TSource, TContext>) =>
  (source: Constructor<TSource>) => {
    const { name, fields, description } = config;
    if (fields) {
      storeFieldConfigMap(source, fields);
    }
    storeIsObjectType(source);
    storeObjectTypeConfig(source, {
      name: name || source.name,
      description,
    });
  };
