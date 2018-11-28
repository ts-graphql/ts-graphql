import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Wrapper } from './Wrapper';

const scalarType = <TInternal, TExternal>(
  config: GraphQLScalarTypeConfig<TInternal, TExternal>,
): Wrapper<TInternal, GraphQLScalarType> => {
  return {
    graphQLType: new GraphQLScalarType(config),
    type: null as any as TInternal,
  }
}

export default scalarType;
