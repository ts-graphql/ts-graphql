import { EmptyConstructor } from '../types';
import { Thunk } from '../utils/thunk';
import { GraphQLFieldConfigArgumentMap } from 'graphql';
import getInputFieldConfigMap from './getInputFieldConfigMap';
import { isArgs } from '../metadata';

export default (target: EmptyConstructor<any>): Thunk<GraphQLFieldConfigArgumentMap> => {
  if (!isArgs(target)) {
    throw new Error(`Args not found for ${target.name}. Are you missing the @Args decorator?`);
  }
  return getInputFieldConfigMap(target);
}
