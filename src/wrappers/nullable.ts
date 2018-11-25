import { Wrapper, WrapperOrType } from './Wrapper';
import { getType } from '../typeHelpers';
import { GraphQLNonNull, GraphQLNullableType } from 'graphql';
import { Maybe } from '../types';

export default function nullable<T, Q extends GraphQLNullableType>(
  type: WrapperOrType<T, Q>,
): Wrapper<Maybe<T>, Q | GraphQLNonNull<Q>> {
  const currentType = getType(type, true);
  return {
    // Can't find way around using any here :(
    // Will at least fail fast, throws runtime error immediately if
    // input type used for output and vice versa
    graphQLType: currentType as any,
    type: null,
    nullable: true,
  };
}
