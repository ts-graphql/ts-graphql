import { GraphQLObjectType } from 'graphql';
import { getObjectTypeConfig, isObjectType } from '../metadata';
import { Constructor } from '../types';
import getFieldConfigMap from './getFieldConfigMap';

export default (source: Constructor<any>): GraphQLObjectType => {
  const config = getObjectTypeConfig(source);
  if (!config || !isObjectType(source)) {
    throw new Error(`Object type config not found for ${source.name}`);
  }
  const { name, description } = config;
  return new GraphQLObjectType({
    name: name || source.name,
    fields: getFieldConfigMap(source),
    description,
  });
};
