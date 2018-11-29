import { WrapperOrType } from './wrappers/Wrapper';
import { MaybePromise, EmptyConstructor, MaybeArray, AnyConstructor } from './types';
import { GraphQLOutputType, GraphQLResolveInfo } from 'graphql';
import { mergeThunks, resolveThunk, Thunk } from './utils/thunk';
import { isArray } from 'lodash';
import { buildFieldConfigMap } from './builders/buildFieldConfigMap';

export type FieldCreatorConfig<TReturn, TArgs = {}> = {
  type: WrapperOrType<TReturn, GraphQLOutputType>,
  description?: string,
  args?: EmptyConstructor<TArgs>,
  isDeprecated?: boolean,
  deprecationReason?: string,
};

export type FieldResolver<TSource, TContext, TReturn, TArgs = {}> =
  (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => MaybePromise<TReturn>;

export type FieldConfig<TSource, TContext, TReturn, TArgs = {}> = FieldCreatorConfig<TReturn, TArgs> & {
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
};

export type FieldConfigMap<TSource, TContext> = {
  [key: string]: FieldConfig<TSource, TContext, any, any>,
};

export type FieldCreator<TSource, TContext> = <
  TReturn,
  TArgs = {},
  RTReturn extends TReturn = TReturn,
>(
  options: FieldCreatorConfig<TReturn, TArgs>,
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
) => FieldConfig<TSource, TContext, TReturn, TArgs>;

export type FieldsConfig<TSource = undefined, TContext = undefined> = {
  source?: AnyConstructor<TSource>,
  context?: AnyConstructor<TContext>,
};

export const fieldCreatorFor = <TSource = undefined, TContext = undefined>(
  source?: AnyConstructor<TSource>,
  context?: AnyConstructor<TContext>,
): FieldCreator<TSource, TContext> => (options, resolve) => {
  return {
    ...options,
    resolve,
  };
};

export const fields = <TSource = undefined, TContext = undefined>(
  config: FieldsConfig<TSource, TContext>,
  callback: (field: FieldCreator<TSource, TContext>) => FieldConfigMap<TSource, TContext>,
): FieldConfigMap<TSource, TContext> => {
  const fieldCreator = fieldCreatorFor(config.source, config.context);
  return callback(fieldCreator);
};

export const buildFields = <TSource, TContext>(fields: MaybeArray<Thunk<FieldConfigMap<TSource, TContext>>>) => {
  let thunk = isArray(fields) ? mergeThunks(...fields) : fields;
  const configMap = resolveThunk(thunk);
  return buildFieldConfigMap(configMap);
}
