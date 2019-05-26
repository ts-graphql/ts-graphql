import { isWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList } from 'graphql';
import { buildType } from '../typeHelpers';
import { once } from 'lodash';

export default function list<T>(type: WrapperOrType<T>): Wrapper<T[], GraphQLList<any>> {
  const getGraphQLType = once(() => new GraphQLList(buildType(type, true)));
  const transformOutput = isWrapper(type) && type.transformOutput;
  return {
    graphQLType: getGraphQLType,
    transformOutput: transformOutput
      ? (values: T[]) => values.map(transformOutput.bind(type))
      : undefined,
    type: [],
  }
}
