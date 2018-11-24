import { Constructor } from '../types';
import { isInputObjectType, isInterfaceType, isObjectType } from '../metadata';
import getInputObjectType from './getInputObjectType';
import getObjectType from './getObjectType';
import { GraphQLType } from 'graphql';
import getInterfaceType from './getInterfaceType';

export default (target: Constructor<any>): GraphQLType => {
  if (isInputObjectType(target)) {
    return getInputObjectType(target);
  }

  if (isObjectType(target)) {
    return getObjectType(target);
  }

  if (isInterfaceType(target)) {
    return getInterfaceType(target);
  }

  throw new Error(`Type not found for ${target.name}`);
}
