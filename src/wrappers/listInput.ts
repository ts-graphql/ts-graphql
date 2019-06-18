import { Wrapper } from './Wrapper';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { once } from 'lodash';
import { AnyConstructor } from '../types';
import buildInputObjectType from '../builders/buildInputObjectType';

export default function listInput<T>(
  type: AnyConstructor<T>,
): Wrapper<T[], GraphQLList<GraphQLNonNull<GraphQLInputObjectType>>> {
  const getGraphQLType = once(() => new GraphQLList(
    new GraphQLNonNull(buildInputObjectType(type))),
  );
  return {
    graphQLType: getGraphQLType,
    type: [],
  }
}
