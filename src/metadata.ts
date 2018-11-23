import 'reflect-metadata';
import { Constructor } from './types';
import { GraphQLInputType, GraphQLNonNull, GraphQLOutputType, GraphQLType } from 'graphql';

const graphQLTypeKey = Symbol('graphql-type');
const graphQLInputTypeKey = Symbol('graphql-input-type');
const graphQLOutputTypeKey = Symbol('graphql-output-type');

export const graphQLTypeMetadata = (value: GraphQLType) => Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value));

export const getGraphQLType = (source: Constructor<any>): GraphQLType => {
  const value = Reflect.getMetadata(graphQLTypeKey, source);
  if (!value) {
    throw new Error(`Type not found for source ${source.name}`);
  }
  return value;
}

export const graphQLInputTypeMetadata = (value: GraphQLInputType) => (source: any) => {
  Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value))(source);
  Reflect.metadata(graphQLInputTypeKey, new GraphQLNonNull(value))(source);
}

export const getGraphQLInputType = (source: Constructor<any>): GraphQLInputType => {
  const value = Reflect.getMetadata(graphQLInputTypeKey, source);
  if (!value) {
    throw new Error(`Input type not found for source ${source.name}`);
  }
  return value;
}

export const graphQLOutputTypeMetadata = (value: GraphQLOutputType) => (source: any) => {
  Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value))(source);
  Reflect.metadata(graphQLOutputTypeKey, new GraphQLNonNull(value))(source);
}

export const getGraphQLOutputType = (source: Constructor<any>): GraphQLOutputType => {
  const value = Reflect.getMetadata(graphQLOutputTypeKey, source);
  if (!value) {
    throw new Error(`Output type not found for source ${source.name}`);
  }
  return value;
}

