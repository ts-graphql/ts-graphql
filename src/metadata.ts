import 'reflect-metadata';
import { Constructor } from './types';
import { GraphQLOutputType, GraphQLType } from 'graphql';

const graphQLTypeKey = Symbol('graphql-type');
const graphQLOutputTypeKey = Symbol('graphql-output-type');

export const graphQLOutputTypeMetadata = (value: GraphQLOutputType) => (source: any) => {
  Reflect.metadata(graphQLTypeKey, value)(source);
  Reflect.metadata(graphQLOutputTypeKey, value)(source);
}

export const getGraphQLOutputType = (source: Constructor<any>): GraphQLOutputType => {
  const value = Reflect.getMetadata(graphQLTypeKey, source);
  if (!value) {
    throw new Error(`Output type not found for source ${source.name}`);
  }
  return value;
}

export const graphQLTypeMetadata = (value: GraphQLType) => Reflect.metadata(graphQLTypeKey, value);

export const getGraphQLType = (source: Constructor<any>): GraphQLType => {
  const value = Reflect.getMetadata(graphQLTypeKey, source);
  if (!value) {
    throw new Error(`Type not found for source ${source.name}`);
  }
  return value;
}
