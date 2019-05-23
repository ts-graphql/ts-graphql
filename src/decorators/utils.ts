import { TSGraphQLBoolean, TSGraphQLFloat, TSGraphQLString } from '..';
import { WrapperOrType } from '../wrappers/Wrapper';
import { GraphQLType } from 'graphql';
import { ObjectLiteral } from '../types';
import { isFunction } from 'lodash';

export const wrapperForPrimitive = (type: typeof String | typeof Boolean | typeof Number) => {
  switch (type) {
    case String:
      return TSGraphQLString;
    case Boolean:
      return TSGraphQLBoolean;
    case Number:
      return TSGraphQLFloat;
  }
  return undefined;
}

export const resolveType = <T, G extends GraphQLType>(
  configType: WrapperOrType<T, G> | undefined,
  source: ObjectLiteral,
  key: string,
): WrapperOrType<T, G> => {
  if (configType) {
    return configType;
  }
  const fieldType = isFunction(source[key])
    ? Reflect.getMetadata('design:returntype', source, key)
    : Reflect.getMetadata('design:type', source, key);
  const type = wrapperForPrimitive(fieldType) as any;
  if (!type) {
    const name = typeof source === 'function'
      ? source.name
      : source.constructor
        ? source.constructor.name
        : '';
    throw new Error(`Type option not supplied and type of ${name}#${key} is not retrievable by reflection`);
  }
  return type;
}
