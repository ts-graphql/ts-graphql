import { isWrapper, resolveWrapper, WrapperOrType } from './wrappers/Wrapper';
import {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType, isInputType, isNamedType, isOutputType,
} from 'graphql';
import { isInputObjectType, isInterfaceType, isObjectType } from './metadata';
import getInputObjectType from './builders/getInputObjectType';
import getObjectType from './builders/getObjectType';
import getInterfaceType from './builders/getInterfaceType';
import { Constructor } from './types';

export function getType(target: WrapperOrType<any, GraphQLType>, nonNull?: false): GraphQLType;
export function getType(target: WrapperOrType<any, GraphQLType>, nonNull: true): GraphQLNonNull<GraphQLType>;
export function getType(target: WrapperOrType<any, GraphQLType>, nonNull?: boolean): GraphQLType | GraphQLNonNull<GraphQLType>;
export function getType(
  target: WrapperOrType<any, GraphQLType>,
  nonNull?: boolean,
): GraphQLType | GraphQLNonNull<GraphQLType> {
  if (isWrapper(target)) {
    return resolveWrapper(target, nonNull);
  }

  let type;
  if (isInputObjectType(target)) {
    type = getInputObjectType(target);
  }

  if (isObjectType(target)) {
    type = getObjectType(target);
  }

  if (isInterfaceType(target)) {
    type = getInterfaceType(target);
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type;
  }

  throw new Error(`Type not found for ${target.name}`);
}

export const getNamedType = (target: WrapperOrType<any, GraphQLNamedType>): GraphQLNamedType => {
  const type = getType(target);
  if (!type || !isNamedType(type)) {
    throw new Error(`Named type not found for ${(target as Constructor<any>).name}`);
  }
  return type;
}

export const getNamedTypes = (targets: Array<WrapperOrType<any, GraphQLNamedType>>): GraphQLNamedType[] => {
  return targets.map(getNamedType);
}

export const getOutputType = (target: WrapperOrType<any, GraphQLOutputType>, nonNull?: boolean): GraphQLOutputType => {
  const type = getType(target, nonNull);
  if (!type || !isOutputType(type)) {
    throw new Error(`Output type not found for ${(target as Constructor<any>).name}`);
  }
  return type;
}

export const getInputType = (target: WrapperOrType<any, GraphQLInputType>, nonNull?: boolean): GraphQLInputType => {
  const type = getType(target, nonNull);
  if (!type || !isInputType(type)) {
    throw new Error(`Input type not found for ${(target as Constructor<any>).name}`);
  }
  return type;
}
