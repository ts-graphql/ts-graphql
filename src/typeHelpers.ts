import { isWrapper, resolveWrapper, WrapperOrType } from './wrappers/Wrapper';
import {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
} from 'graphql';
import { isInputObjectType, isInterfaceType, isObjectType } from './metadata';
import getInputObjectType from './builders/getInputObjectType';
import getObjectType from './builders/getObjectType';
import getInterfaceType from './builders/getInterfaceType';

export const getNamedType = (target: WrapperOrType<any, GraphQLNamedType>): GraphQLNamedType => {
  if (isWrapper(target)) {
    return resolveWrapper(target, true);
  }

  if (isInputObjectType(target)) {
    return getInputObjectType(target);
  }

  if (isObjectType(target)) {
    return getObjectType(target);
  }

  if (isInterfaceType(target)) {
    return getInterfaceType(target);
  }

  throw new Error(`Named type not found for ${target.name}`);
}

export const getNamedTypes = (targets: Array<WrapperOrType<any, GraphQLNamedType>>): GraphQLNamedType[] => {
  return targets.map(getNamedType);
}

export function getType(target: WrapperOrType<any, GraphQLType>, nonNull?: boolean): GraphQLType {
  if (isWrapper(target)) {
    return resolveWrapper(target);
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

export const getOutputType = (target: WrapperOrType<any, GraphQLOutputType>, nonNull?: boolean): GraphQLOutputType => {
  if (isWrapper(target)) {
    return resolveWrapper(target);
  }

  let type;
  if (isObjectType(target)) {
    type = getObjectType(target);
  }

  if (isInterfaceType(target)) {
    type = getInterfaceType(target);
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type;
  }

  throw new Error(`Output type not found for ${target.name}`);
}

export const getInputType = (target: WrapperOrType<any, GraphQLInputType>, nonNull?: boolean): GraphQLInputType => {
  if (isWrapper(target)) {
    return resolveWrapper(target);
  }

  let type;
  if (isInputObjectType(target)) {
    type = getInputObjectType(target);
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type;
  }

  throw new Error(`Input type not found for ${target.name}`);
}
