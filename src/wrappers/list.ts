import { isWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList, GraphQLNonNull, GraphQLType } from 'graphql';
import { buildType } from '../typeHelpers';
import { once } from 'lodash';

export default function list<T, Q extends GraphQLType>(
  type: WrapperOrType<T, Q>,
): Wrapper<T[], GraphQLList<Q | GraphQLNonNull<Q>>> {
  const getGraphQLType = once(() => new GraphQLList(buildType(type, true) as GraphQLNonNull<Q> | Q));
  const transformOutput = isWrapper(type) && type.transformOutput;
  return {
    graphQLType: getGraphQLType,
    transformOutput: transformOutput
      ? (values: T[]) => values.map(transformOutput.bind(type))
      : undefined,
    type: [],
  }
}
