import { graphQLTypeForWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLNonNull } from 'graphql';

function nullable<T>(type: WrapperOrType<T>): Wrapper<T | null> {
  const currentType = graphQLTypeForWrapper(type);
  let graphQLType = currentType;
  if (currentType instanceof GraphQLNonNull) {
    graphQLType = currentType.ofType;
  }
  return {
    graphQLType,
    type: null,
  };
}
