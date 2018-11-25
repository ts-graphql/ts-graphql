import { Wrapper, WrapperOrType } from './Wrapper';
import { GraphQLList } from 'graphql';
import { getType } from '../typeHelpers';

// See note re. any in nullable.ts
export default function list<T>(type: WrapperOrType<T>): Wrapper<T[], GraphQLList<any>> {
  const currentType = getType(type, true);
  return {
    graphQLType: new GraphQLList(currentType),
    type: [],
  }
}
