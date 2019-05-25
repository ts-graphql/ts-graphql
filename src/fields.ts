import { WrapperOrType } from './wrappers/Wrapper';
import { MaybePromise, EmptyConstructor, MaybeArray, AnyConstructor } from './types';
import { GraphQLOutputType, GraphQLResolveInfo } from 'graphql';
import { mergeThunks, resolveThunk, Thunk } from './utils/thunk';
import { isArray } from 'lodash';
import { buildFieldConfigMap, buildSubscriptionFieldConfigMap } from './builders/buildObjectTypeFields';
import { InterfaceImplementation } from './decorators/Implements';

export type FieldCreatorConfig<TReturn, TArgs = {}> = {
  type: WrapperOrType<TReturn, GraphQLOutputType>,
  description?: string,
  args?: EmptyConstructor<TArgs>,
  isDeprecated?: boolean,
  deprecationReason?: string,
};

export type FieldResolver<TSource, TContext, TReturn, TArgs = {}> =
  (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) =>
    MaybePromise<TReturn | InterfaceImplementation<TReturn>>;

export type FieldSubscriber<TSource, TContext, TReturn, TArgs = {}> =
  (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterable<TReturn>;

export type FieldConfig<TSource, TContext, TReturn, TArgs = {}> = FieldCreatorConfig<TReturn, TArgs> & {
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
};

type SubscriptionFieldConfigSimple<
  TSource,
  TContext,
  TReturn,
  TArgs = {},
> = FieldConfig<TSource, TContext, TReturn, TArgs> & {
  subscribe: FieldSubscriber<TSource, TContext, TReturn, TArgs>,
};

type SubscriptionFieldConfigWithResolver<
  TSource,
  TContext,
  TReturn,
  TSubReturn,
  TArgs = {},
> = FieldConfig<TSource, TContext, TReturn, TArgs> & {
  resolve: FieldResolver<TSubReturn, TContext, TReturn, TArgs>,
  subscribe: FieldSubscriber<TSource, TContext, TSubReturn, TArgs>,
};

export type SubscriptionFieldConfig<TSource, TContext, TReturn, TSubReturn, TArgs = {}> =
  SubscriptionFieldConfigSimple<TSource, TContext, TReturn, TArgs> |
  SubscriptionFieldConfigWithResolver<TSource, TContext, TReturn, TSubReturn, TArgs>;

export type FieldConfigMap<TSource, TContext> = {
  [key: string]: FieldConfig<TSource, TContext, any, any>,
};

export type SubscriptionFieldConfigMap<TSource, TContext> = {
  [key: string]: SubscriptionFieldConfig<TSource, TContext, any, any, any>,
};

export type FieldCreator<TSource, TContext> = <
  TReturn,
  TArgs = {},
>(
  options: FieldCreatorConfig<TReturn, TArgs>,
  resolve?: FieldResolver<TSource, TContext, TReturn, TArgs>,
) => FieldConfig<TSource, TContext, TReturn, TArgs>;

export interface SubscriptionFieldCreator<TSource, TContext> {
  <TReturn, TArgs = {}>(
    options: FieldCreatorConfig<TReturn, TArgs>,
    subscribe: FieldSubscriber<TSource, TContext, TReturn, TArgs>,
  ): SubscriptionFieldConfig <TSource, TContext, TReturn, TReturn, TArgs>;

  <TReturn, TSubReturn, TArgs = {}>(
    options: FieldCreatorConfig<TReturn, TArgs>,
    subscribe: FieldSubscriber<TSource, TContext, TSubReturn, TArgs>,
    resolve: FieldResolver<TSubReturn, TContext, TReturn, TArgs>,
  ): SubscriptionFieldConfig<TSource, TContext, TReturn, TSubReturn, TArgs>;
}

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

export const subscriptionFieldCreatorFor = <TSource = undefined, TContext = undefined>(
  source?: AnyConstructor<TSource>,
  context?: AnyConstructor<TContext>,
): SubscriptionFieldCreator<TSource, TContext> => <TReturn, TSubReturn, TArgs = {}>(
  options: FieldCreatorConfig<TReturn, TArgs>,
  subscribe: FieldSubscriber<TSource, TContext, TReturn, TArgs> | FieldSubscriber<TSource, TContext, TSubReturn, TArgs>,
  resolve?: FieldResolver<TSubReturn, TContext, TReturn, TArgs>,
) => {
  return {
    ...options,
    subscribe,
    resolve,
  };
}

export const fields = <TSource = undefined, TContext = undefined>(
  config: FieldsConfig<TSource, TContext>,
  callback: (field: FieldCreator<TSource, TContext>) => FieldConfigMap<TSource, TContext>,
): FieldConfigMap<TSource, TContext> => {
  const fieldCreator = fieldCreatorFor(config.source, config.context);
  return callback(fieldCreator);
};

export const subscriptionFields = <TSource = undefined, TContext = undefined>(
  config: FieldsConfig<TSource, TContext>,
  callback: (field: SubscriptionFieldCreator<TSource, TContext>) => SubscriptionFieldConfigMap<TSource, TContext>,
): SubscriptionFieldConfigMap<TSource, TContext> => {
  const fieldCreator = subscriptionFieldCreatorFor(config.source, config.context);
  return callback(fieldCreator);
};

export const buildFields = <TSource, TContext>(fields: MaybeArray<Thunk<FieldConfigMap<TSource, TContext>>>) => {
  const thunk = isArray(fields) ? mergeThunks(...fields) : fields;
  const configMap = resolveThunk(thunk);
  return buildFieldConfigMap(configMap);
}

export const buildSubscriptionFields = <TSource, TContext>(fields: MaybeArray<Thunk<SubscriptionFieldConfigMap<TSource, TContext>>>) => {
  const thunk = isArray(fields) ? mergeThunks(...fields) : fields;
  const configMap = resolveThunk(thunk);
  return buildSubscriptionFieldConfigMap(configMap);
};
