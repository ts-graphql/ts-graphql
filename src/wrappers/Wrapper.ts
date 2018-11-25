import { AnyConstructor } from '../types';
import {
  GraphQLNonNull,
  GraphQLScalarLiteralParser,
  GraphQLScalarType,
  GraphQLScalarValueParser,
  GraphQLType,
  isNonNullType,
} from 'graphql';

export type Wrapper<T, G extends GraphQLType = GraphQLType> = {
  graphQLType: G,
  type: T,
  nullable?: boolean,
};

export type WrapperOrType<T, G extends GraphQLType = GraphQLType> = Wrapper<T, G> | AnyConstructor<T>;

export interface TypedGraphQLScalar<TInternal> extends GraphQLScalarType {
  parseValue: GraphQLScalarValueParser<TInternal>;
  parseLiteral: GraphQLScalarLiteralParser<TInternal>;
}

export const isWrapper = <T, G extends GraphQLType>(x: WrapperOrType<T, G>): x is Wrapper<T, G> => {
  return 'graphQLType' in x && 'type' in x;
};

export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, dontWrap: true): G;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, dontWrap: false): G | GraphQLNonNull<G>;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>): G | GraphQLNonNull<G>;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, dontWrap?: boolean): G | GraphQLNonNull<G> {
  const type = wrapper.graphQLType;
  return (wrapper.nullable || dontWrap)
    ? type
    : new GraphQLNonNull(type);
}

export const wrapScalar = <T>(scalar: TypedGraphQLScalar<T>): Wrapper<T, GraphQLScalarType> => {
  return {
    graphQLType: scalar,
    type: (null as any) as T,
  };
};

export const unsafeWrapType = <T extends GraphQLType>(type: T): Wrapper<any, T> => {
  return {
    graphQLType: type,
    type: null as any,
  };
};
