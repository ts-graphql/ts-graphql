import { AnyConstructor, ObjectLiteral } from '../types';
import { memoize, mapValues } from 'lodash';
import { getExtensionFieldConfig, isExtension } from '../metadata';
import { resolveThunk } from '../utils/thunk';
import { FieldConfigMap } from '../fields';
import { GraphQLFieldConfigMap } from 'graphql';
import { buildFieldConfigMap } from './buildObjectTypeFields';

const extensionFieldResolver = (source: ObjectLiteral, key: string) =>
  typeof source[key] === 'function' ? source[key] : () => source[key];

export const getExtensionFieldConfigMap = memoize((source: AnyConstructor<any>): FieldConfigMap<any, any> => {
  if (!isExtension(source)) {
    throw new Error(`${source.name} is not an extension`);
  }
  const fieldConfig = resolveThunk(getExtensionFieldConfig(source));
  if (!fieldConfig) {
    throw new Error(`No extension fields found for ${source.name}`);
  }

  return mapValues(fieldConfig, (thunk, key) => ({
    ...resolveThunk(thunk),
    resolve: extensionFieldResolver(source, key),
  }));
});

export default memoize((source: AnyConstructor<any>): GraphQLFieldConfigMap<any, any> => {
  return buildFieldConfigMap(getExtensionFieldConfigMap(source));
});
