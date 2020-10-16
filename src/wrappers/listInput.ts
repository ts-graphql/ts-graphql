import { Wrapper } from './Wrapper';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { once } from 'lodash';
import { AnyConstructor } from '../types';
import buildInputObjectType from '../builders/buildInputObjectType';

export default function listInput<T>(
  type: AnyConstructor<T>,
): Wrapper<T[], GraphQLList<GraphQLNonNull<GraphQLInputObjectType>>> {
  // GraphQLList doesn't seem to support type inference anymore
  const getGraphQLType = once(() => new GraphQLList(
    new GraphQLNonNull(buildInputObjectType(type))) as GraphQLList<GraphQLNonNull<GraphQLInputObjectType>>,
  );
  return {
    graphQLType: getGraphQLType,
    type: [],
  }
}
