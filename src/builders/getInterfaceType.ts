import { GraphQLInterfaceType } from 'graphql';
import { getImplementers, getInterfaceTypeConfig, isInterfaceType } from '../metadata';
import { AnyConstructor } from '../types';
import getFieldConfigMap from './getFieldConfigMap';
import getObjectType from './getObjectType';
import findConstructor from '../utils/findConstructor';
import { memoize } from 'lodash';

export default memoize((source: AnyConstructor<any>): GraphQLInterfaceType => {
  const config = getInterfaceTypeConfig(source);
  if (!config || !isInterfaceType(source)) {
    throw new Error(`Interface type config not found for ${source.name}`);
  }
  const { name, description } = config;
  return new GraphQLInterfaceType({
    name: name || source.name,
    fields: getFieldConfigMap(source),
    description,
    resolveType: (instance: {}) => {
      const implementers = getImplementers(source) || [];
      const type = findConstructor(instance, implementers);
      if (!type) {
        const name = instance && instance.constructor && instance.constructor.name || 'Unknown';
        throw new Error(`Error resolving type for ${source.name}: ${name} not found in implementations`);
      }
      return getObjectType(type);
    },
  });
});
