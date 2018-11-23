import { WrapperOrType } from './wrappers/Wrapper';
import { Constructor, Promiseable } from './types';
import { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { getGraphQLOutputType } from './metadata';

export type FieldCreatorOptions<Return, Args = {}> = {
  type: WrapperOrType<Return>,
  description?: string,
  args?: Constructor<Args>,
};

export type FieldCreator<TSource, TContext> = <
  TReturn,
  TArgs = {},
  RTReturn extends TReturn = TReturn,
>(
  options: FieldCreatorOptions<TReturn, TArgs>,
  resolve?: (source: TSource, args: TArgs, context: TContext) => Promiseable<RTReturn>,
) => GraphQLFieldConfig<TSource, TContext, TArgs>;

export type FieldsOptions<TSource, TContext = {}> = {
  source: Constructor<TSource>,
  context?: Constructor<TContext>
}

export const fieldCreatorFor = <TSource, TContext = {}>(
  source: Constructor<TSource>, context?: Constructor<TContext>
): FieldCreator<TSource, TContext> => (options, resolve) => {
  return {
    type: getGraphQLOutputType(source),
    args: {},
    resolve,
  };
};

export const fields = <TSource, TContext, TReturn, TArgs = null>(
  options: FieldsOptions<TSource, TContext>,
  callback: (field: FieldCreator<TSource, TContext>) => GraphQLFieldConfigMap<TSource, TContext>,
): GraphQLFieldConfigMap<TSource, TContext> => {
  const fieldCreator = fieldCreatorFor(options.source, options.context);
  return callback(fieldCreator);
}
