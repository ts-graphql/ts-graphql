import { AnyConstructor, Maybe, MaybePromise } from '../types';
import { FieldCreatorConfig, FieldResolver } from '../fields';
import { resolveThunk, Thunk } from '../utils/thunk';
import { FieldDecoratorConfig } from './Field';
import { storeExtensionFieldConfig } from '../metadata';
import { resolveType } from './utils';
import { Extension } from '../Extension';

type ExtensionFieldProperty<TSource, TContext, TReturn, TArgs> =
  MaybePromise<TReturn> | FieldResolver<TSource, TContext, TReturn, TArgs>;

type ExtensionClassStaticMethod<TSource, TContext, TName extends string, TMethod> =
  AnyConstructor<Extension<TSource, TContext>> & Record<TName, TMethod>;

type ExtensionClassInferredProp<TSource, TContext, TName extends string> =
  AnyConstructor<Extension<TSource, TContext>> & (Record<TName, string> | Record<TName, string> | Record<TName, number>);

type ExtensionFieldPropertyDecorator<TReturn, TArgs> =
  <TName extends string, TSource, TContext>(
    ctor: ExtensionClassStaticMethod<TSource, TContext, TName, ExtensionFieldProperty<TSource, TContext, TReturn, TArgs>>,
    key: TName,
  ) => void;

type ExtensionFieldOverloads = {
  <TArgs>(config?: Thunk<Partial<FieldCreatorConfig<undefined, TArgs>>>):
    <TName extends string>(
      ctor: ExtensionClassInferredProp<any, any, TName>,
      key: TName,
    ) => void;
  <TSource, TReturn, TArgs, TContext>(
    config: Thunk<FieldDecoratorConfig<TReturn, TArgs, TContext>>,
  ): ExtensionFieldPropertyDecorator<TReturn, TArgs>;
};

const ExtensionField: ExtensionFieldOverloads = <TSource, TReturn, TArgs, TContext>(
  config?: Thunk<Partial<FieldCreatorConfig<undefined, TArgs>>> | Thunk<FieldDecoratorConfig<TReturn, TArgs, TContext>>,
) => <TName extends string>(
  ctor:
    ExtensionClassStaticMethod<TSource, TContext, TName, ExtensionFieldProperty<TSource, TContext, TReturn, TArgs>> |
    ExtensionClassInferredProp<TSource, TContext, TName>,
  key: TName,
) => {
  storeExtensionFieldConfig(ctor, key, () => {
    const resolved = config && resolveThunk(config as Partial<FieldCreatorConfig<any, any>>);
    return {
      ...resolved,
      type: () => {
        const typeOption = resolved && resolved.type ? resolved.type() : undefined;
        return resolveType(typeOption, ctor, key);
      },
    };
  })
};

export default ExtensionField;
