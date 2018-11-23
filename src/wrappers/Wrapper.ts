import { Constructor } from '../types';
import {
  GraphQLScalarLiteralParser,
  GraphQLScalarType,
  GraphQLScalarValueParser,
  GraphQLType,
} from 'graphql';
import { getGraphQLType } from '../metadata';

export type Wrapper<T> = {
    graphQLType: any,
    type: T,
};

export type WrapperOrType<T> = Wrapper<T> | Constructor<T>;

export const isWrapper = (x: any): x is Wrapper<any> => {
  return 'graphQLType' in x && 'type' in x;
}

export const graphQLTypeForWrapper = (type: WrapperOrType<any>): GraphQLType => isWrapper(type)
  ? type.graphQLType
  : getGraphQLType(type);


function wrapType<T>(type: GraphQLType): Wrapper<T> {
  return {
    graphQLType: type,
    type: (null as any) as T,
  };
}

export interface TypedGraphQLScalar<TInternal> extends GraphQLScalarType {
  parseValue: GraphQLScalarValueParser<TInternal>;
  parseLiteral: GraphQLScalarLiteralParser<TInternal>;
}

export const wrapScalar = <T>(scalar: TypedGraphQLScalar<T>): Wrapper<T> => {
  return {
    graphQLType: scalar,
    type: (null as any) as T,
  };
}
