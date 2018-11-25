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
  prototype: ObjectLiteral,
  key: string,
): WrapperOrType<T, G> => {
  if (configType) {
    return configType;
  }
  const fieldType = isFunction(prototype[key])
    ? Reflect.getMetadata('design:returntype', prototype, key)
    : Reflect.getMetadata('design:type', prototype, key);
  const type = wrapperForPrimitive(fieldType) as any;
  if (!type) {
    const name = prototype.constructor ? prototype.constructor.name : '';
    throw new Error(`Type option not supplied and ${name}#${key} is not retrievable by reflection`);
  }
  return type;
}
