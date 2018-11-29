import { GraphQLInputObjectType } from 'graphql';
import { getObjectTypeConfig, isInputObjectType } from '../metadata';
import { AnyConstructor } from '../types';
import getInputFieldConfigMap from './buildInputFieldConfigMap';
import { memoize } from 'lodash';

export default memoize((source: AnyConstructor<any>): GraphQLInputObjectType => {
  const config = getObjectTypeConfig(source);
  if (!config || !isInputObjectType(source)) {
    throw new Error(`Input object type config not found for ${source.name}`);
  }
  const { name, description } = config;
  return new GraphQLInputObjectType({
    name: name || source.name,
    fields: getInputFieldConfigMap(source),
    description,
  });
});
