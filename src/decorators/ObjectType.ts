import {
  getImplements,
  storeFieldConfigMap, storeImplements, storeIsObjectType,
  storeObjectTypeConfig,
} from '../metadata';
import { AnyConstructor, Constructor, MaybeArray } from '../types';
import { FieldConfigMap } from '../fields';
import { mergeThunks, resolveThunk, Thunk } from '../utils/thunk';
import { isArray } from 'lodash';
import { getConstructorChain } from '../builders/utils';
import { flatMap, uniq, identity } from 'lodash';
import { Extension } from '../Extension';
import { getExtensionFieldConfigMap } from '../builders/buildExtension';

export type ObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
  fields?: MaybeArray<Thunk<MaybeArray<FieldConfigMap<TSource, TContext>>>>,
  extensions?: Thunk<Array<AnyConstructor<Extension<TSource, TContext>>>>,
};

export default <TSource, TContext>(config: ObjectTypeConfig<TSource, TContext> = {}) =>
  (source: AnyConstructor<TSource>) => {
    const { name, fields, extensions, description } = config;

    const chain = getConstructorChain(source);
    const interfaces = uniq(flatMap(chain, getImplements)).filter(identity) as unknown as Array<Constructor<any>>;

    for (const iface of interfaces) {
      storeImplements(source, iface);
    }

    const additionalFieldMaps: Array<Thunk<FieldConfigMap<TSource, TContext>>> = [];

    if (fields) {
      const fieldsThunk = isArray(fields) ? mergeThunks(...fields) : fields;
      const finalThunk = (): FieldConfigMap<TSource, TContext> => {
        const config = resolveThunk(fieldsThunk);
        return isArray(config)
          ? Object.assign({}, ...config)
          : config;
      }
      additionalFieldMaps.push(finalThunk)
    }

    if (extensions) {
      const extensionsConfigThunk = (): FieldConfigMap<TSource, TContext> => {
        const resolved = resolveThunk(extensions);
        const configArray = resolved.map((source) => getExtensionFieldConfigMap(source));
        return Object.assign({}, ...configArray);
      }
      additionalFieldMaps.push(extensionsConfigThunk);
    }

    if (additionalFieldMaps.length) {
      const mergedThunk = mergeThunks(...additionalFieldMaps);
      storeFieldConfigMap(source, mergedThunk);
    }

    storeIsObjectType(source);
    storeObjectTypeConfig(source, {
      name: name || source.name,
      description,
    });
  };
