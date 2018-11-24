import { WrapperOrType } from './wrappers/Wrapper';
import { Constructor, Promiseable } from './types';
import { GraphQLFieldConfigMap, GraphQLResolveInfo } from 'graphql';

export type FieldCreatorConfig<TReturn, TArgs = {}> = {
  type: WrapperOrType<TReturn>,
  description?: string,
  args?: Constructor<TArgs>,
};

export type FieldResolver<TSource, TContext, TReturn, TArgs = {}> =
  (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promiseable<TReturn>;

export type FieldConfig<TSource, TContext, TReturn, TArgs = {}> = FieldCreatorConfig<TReturn, TArgs> & {
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
};

export type FieldConfigMap<TSource, TContext> = {
  [key: string]: FieldConfig<TSource, TContext, any>,
};

export type FieldCreator<TSource, TContext> = <
  TReturn,
  TArgs = {},
  RTReturn extends TReturn = TReturn,
>(
  options: FieldCreatorConfig<TReturn, TArgs>,
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
) => FieldConfig<TSource, TContext, TReturn, TArgs>;

export type FieldsConfig<TSource, TContext = {}> = {
  source: Constructor<TSource>,
  context?: Constructor<TContext>
};

export const fieldCreatorFor = <TSource, TContext = {}>(
  source: Constructor<TSource>,
  context?: Constructor<TContext>,
): FieldCreator<TSource, TContext> => (options, resolve) => {
  return {
    ...options,
    resolve,
  };
};

export const fields = <TSource, TContext, TReturn, TArgs = null>(
  config: FieldsConfig<TSource, TContext>,
  callback: (field: FieldCreator<TSource, TContext>) => FieldConfigMap<TSource, TContext>,
): FieldConfigMap<TSource, TContext> => {
  const fieldCreator = fieldCreatorFor(config.source, config.context);
  return callback(fieldCreator);
};
