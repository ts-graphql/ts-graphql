import { Thunk } from 'graphql';
import {
  storeFieldConfigMap, storeIsObjectType,
  storeObjectTypeConfig,
} from '../metadata';
import { AnyConstructor, MaybeArray } from '../types';
import { FieldConfigMap } from '../fields';
import { mergeThunks } from '../utils/thunk';
import { isArray } from 'lodash';

export type ObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
  fields?: MaybeArray<Thunk<FieldConfigMap<TSource, TContext>>>
}

export default <TSource, TContext>(config: ObjectTypeConfig<TSource, TContext> = {}) =>
  (source: AnyConstructor<TSource>) => {
    const { name, fields, description } = config;
    if (fields) {
      const fieldsThunk = isArray(fields) ? mergeThunks(...fields) : fields;
      storeFieldConfigMap(source, fieldsThunk);
    }
    storeIsObjectType(source);
    storeObjectTypeConfig(source, {
      name: name || source.name,
      description,
    });
  };
