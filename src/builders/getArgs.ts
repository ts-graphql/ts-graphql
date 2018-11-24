import { SimpleConstructor } from '../types';
import { Thunk } from '../utils/thunk';
import { GraphQLFieldConfigArgumentMap } from 'graphql';
import getInputFieldConfigMap from './getInputFieldConfigMap';
import { isArgs } from '../metadata';

export default (target: SimpleConstructor<any>): Thunk<GraphQLFieldConfigArgumentMap> => {
  if (!isArgs(target)) {
    throw new Error('Args not found. Are you missing the @Args decorator?');
  }
  return getInputFieldConfigMap(target);
}
