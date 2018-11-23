import { graphQLTypeForWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList } from 'graphql';

export default function list<T>(type: WrapperOrType<T>): Wrapper<T[]> {
  const currentType = graphQLTypeForWrapper(type);
  return {
    graphQLType: new GraphQLList(currentType),
    type: [],
  }
}
