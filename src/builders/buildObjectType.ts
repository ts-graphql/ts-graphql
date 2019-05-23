import { GraphQLObjectType } from 'graphql';
import { getImplements, getObjectTypeConfig, isObjectType } from '../metadata';
import { AnyConstructor } from '../types';
import buildObjectTypeFields from './buildObjectTypeFields';
import getInterfaceType from './buildInterfaceType';
import { memoize } from 'lodash';

export default memoize((source: AnyConstructor<any>): GraphQLObjectType => {
  const config = getObjectTypeConfig(source);
  if (!config || !isObjectType(source)) {
    throw new Error(`Object type config not found for ${source.name}`);
  }
  const { name, description } = config;
  const interfaces = getImplements(source) || [];
  return new GraphQLObjectType({
    name: name || source.name,
    interfaces: interfaces.map(getInterfaceType),
    fields: buildObjectTypeFields(source),
    description,
  });
});
