import { EmptyConstructor } from '../types';
import { Thunk } from '../utils/thunk';
import { GraphQLFieldConfigArgumentMap } from 'graphql';
import getInputFieldConfigMap from './buildInputObjectTypeFields';
import { hasArgsConfig, isArgs } from '../metadata';

export default (target: EmptyConstructor<any>): Thunk<GraphQLFieldConfigArgumentMap> => {
  if (!isArgs(target)) {
    throw new Error(`Args not found for ${target.name}. Are you missing the @Args decorator?`);
  }
  if (!hasArgsConfig(target)) {
    throw new Error(`No args found. Are you missing @Arg decorators on ${target.name}?`);
  }
  return getInputFieldConfigMap(target);
}
