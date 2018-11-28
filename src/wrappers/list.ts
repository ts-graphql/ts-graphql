import { isWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList } from 'graphql';
import { getType } from '../typeHelpers';

export default function list<T>(type: WrapperOrType<T>): Wrapper<T[], GraphQLList<any>> {
  const currentType = getType(type, true);
  const transformOutput = isWrapper(type) && type.transformOutput;
  return {
    graphQLType: new GraphQLList(currentType),
    transformOutput: transformOutput
      ? (values: T[]) => values.map(transformOutput.bind(type))
      : undefined,
    type: [],
  }
}
