import { graphQLTypeForWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList, GraphQLNonNull } from 'graphql';

export default function list<T>(type: WrapperOrType<T>): Wrapper<T[]> {
  const currentType = graphQLTypeForWrapper(type);
  return {
    graphQLType: new GraphQLNonNull(new GraphQLList(currentType)),
    type: [],
  }
}
