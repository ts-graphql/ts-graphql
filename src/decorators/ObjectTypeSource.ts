import { GraphQLFieldConfigMap, GraphQLObjectType, Thunk } from 'graphql';
import { getFieldConfigMap, graphQLOutputTypeMetadata, storeFieldConfig, storeFieldConfigMap } from '../metadata';
import { Constructor } from '../types';
import { mergeThunks } from '../utils/thunk';
import { FieldConfig, FieldConfigMap } from '../fields';

export type ObjectTypeSourceConfig<TSource, TContext> = {
  name?: string,
  description?: string,
  fields?: Thunk<FieldConfigMap<TSource, TContext>>
}

export default <TSource, TContext>(config: ObjectTypeSourceConfig<TSource, TContext>) =>
  (source: Constructor<TSource>) => {
    const { name, fields, description } = config;
    if (fields) {
      storeFieldConfigMap(source, fields);
    }
    const type = new GraphQLObjectType({
      name: name || source.name,
      fields: getFieldConfigMap(source),
      description,
    });
    return graphQLOutputTypeMetadata(type)(source);
  }
