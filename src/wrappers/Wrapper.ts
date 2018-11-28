import { AnyConstructor } from '../types';
import {
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql';

export type Wrapper<T, G extends GraphQLType = GraphQLType> = {
  graphQLType: G,
  type: T,
  transformOutput?: (output: T) => T;
  nullable?: boolean,
};

export type WrapperOrType<T, G extends GraphQLType = GraphQLType> = Wrapper<T, G> | AnyConstructor<T>;

export const isWrapper = <T, G extends GraphQLType>(x: WrapperOrType<T, G>): x is Wrapper<T, G> => {
  return 'graphQLType' in x && 'type' in x;
};

export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>): G;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, nonNull: false): G;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, nonNull?: boolean): G | GraphQLNonNull<G>;
export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, nonNull?: boolean): G | GraphQLNonNull<G> {
  const type = wrapper.graphQLType;
  return (nonNull && !wrapper.nullable)
    ? new GraphQLNonNull(type)
    : type;
}

export const wrapScalar = <T>(scalar: GraphQLScalarType): Wrapper<T, GraphQLScalarType> => {
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
