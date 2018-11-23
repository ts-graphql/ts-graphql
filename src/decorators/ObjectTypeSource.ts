import { GraphQLFieldConfigMap, GraphQLObjectType, Thunk } from 'graphql';
import { graphQLOutputTypeMetadata } from '../metadata';
import { Constructor } from '../types';
import { getFields } from './Field';

export type ObjectTypeSourceOptions<TSource, TContext> = {
  name: string,
  description?: string,
  fields?: Thunk<GraphQLFieldConfigMap<TSource, TContext>>
}

export default <TSource, TContext>(options: ObjectTypeSourceOptions<TSource, TContext>) =>
  (source: Constructor<TSource>) => {
    const fields = options.fields || getFields(source);
    return graphQLOutputTypeMetadata(new GraphQLObjectType({ ...options, fields }))(source);
  }
