import { Constructor } from '../types';
import {
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLScalarLiteralParser,
  GraphQLScalarType,
  GraphQLScalarValueParser,
  GraphQLType,
} from 'graphql';
import getObjectType from '../builders/getObjectType';
import getInputObjectType from '../builders/getInputObjectType';
import getType from '../builders/getType';

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
  : getType(type);

export const graphQLOutputTypeForWrapper = (type: WrapperOrType<any>): GraphQLOutputType => isWrapper(type)
  ? type.graphQLType
  : getObjectType(type);

export const graphQLInputTypeForWrapper = (type: WrapperOrType<any>): GraphQLOutputType => isWrapper(type)
  ? type.graphQLType
  : getInputObjectType(type);

export interface TypedGraphQLScalar<TInternal> extends GraphQLScalarType {
  parseValue: GraphQLScalarValueParser<TInternal>;
  parseLiteral: GraphQLScalarLiteralParser<TInternal>;
}

export const wrapScalar = <T>(scalar: TypedGraphQLScalar<T>): Wrapper<T> => {
  return {
    graphQLType: new GraphQLNonNull(scalar),
    type: (null as any) as T,
  };
};

export const unsafeWrapType = (type: GraphQLType): Wrapper<any> => {
  return {
    graphQLType: new GraphQLNonNull(type),
    type: null as any,
  };
};
