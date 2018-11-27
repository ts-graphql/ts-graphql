import { Thunk } from 'graphql';
import {
  getImplements,
  storeFieldConfigMap, storeImplements, storeIsObjectType,
  storeObjectTypeConfig,
} from '../metadata';
import { AnyConstructor, Constructor, MaybeArray } from '../types';
import { FieldConfigMap } from '../fields';
import { mergeThunks, resolveThunk } from '../utils/thunk';
import { isArray } from 'lodash';
import { getConstructorChain } from '../builders/utils';
import { flatMap, uniq, identity } from 'lodash';

export type ObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
  fields?: MaybeArray<Thunk<MaybeArray<FieldConfigMap<TSource, TContext>>>>
}

export default <TSource, TContext>(config: ObjectTypeConfig<TSource, TContext> = {}) =>
  (source: AnyConstructor<TSource>) => {
    const { name, fields, description } = config;

    const chain = getConstructorChain(source);
    const interfaces = uniq(flatMap(chain, getImplements)).filter(identity) as unknown as Array<Constructor<any>>;

    for (const iface of interfaces) {
      storeImplements(source, iface);
    }

    if (fields) {
      const fieldsThunk = isArray(fields) ? mergeThunks(...fields) : fields;
      const finalThunk = () => {
        const config = resolveThunk(fieldsThunk);
        return isArray(config)
          ? Object.assign({}, ...config)
          : config;
      }
      storeFieldConfigMap(source, finalThunk);
    }
    storeIsObjectType(source);
    storeObjectTypeConfig(source, {
      name: name || source.name,
      description,
    });
  };
