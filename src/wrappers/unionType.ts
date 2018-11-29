import { GraphQLNonNull, GraphQLType, GraphQLUnionType } from 'graphql';
import { Wrapper } from './Wrapper';
import { AnyConstructor } from '../types';
import getObjectType from '../builders/buildObjectType';
import findConstructor from '../utils/findConstructor';

export type UnionTypeConfig<T> = {
  types: Array<AnyConstructor<T>>,
  name: string,
  description?: string,
}

const unionType = <T>(config: UnionTypeConfig<T>): Wrapper<T, GraphQLUnionType> => {
  const graphQLType = new GraphQLUnionType({
    ...config,
    types: config.types.map(getObjectType),
    resolveType: (instance: {}) => {
      const type = findConstructor(instance, config.types);
      if (!type) {
        // This should be impossible
        throw new Error(`Source not instance of passed types for ${config.name}`);
      }
      return getObjectType(type);
    },
  });
  return {
    graphQLType,
    type: null as any as T,
  }
}

export default unionType;
