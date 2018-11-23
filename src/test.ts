import 'reflect-metadata';
import { Constructor, ObjectLiteral, Promiseable } from './types';
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
} from 'graphql';
import { getGraphQLOutputType, getGraphQLType } from './metadata';
import { WrapperOrType } from './wrappers/Wrapper';
import ObjectTypeSource from './decorators/ObjectTypeSource';

type FieldCreatorOptions<Return, Args = {}> = {
  type: WrapperOrType<Return>,
  args?: Constructor<Args>,
};

type Test<V extends { [key: string]: any }, T extends string> = {
  [key in T]: V[key];
}

const defaultResolver = <F extends string, Root>(fieldName: F, type: Constructor<Root>) =>
  (root: Test<Root, typeof fieldName>) => root[fieldName];

class Foo {
  test!: string;
}

type FieldCreator<TSource, TContext> = <
  TReturn,
  TArgs = {},
  RTReturn extends TReturn = TReturn,
>(
  options: FieldCreatorOptions<TReturn, TArgs>,
  resolve: (source: TSource, args: TArgs, context: TContext) => Promiseable<RTReturn>,
) => GraphQLFieldConfig<TSource, TContext, TArgs>

const fieldCreatorFor = <TSource, TContext = {}>(
  source: Constructor<TSource>, context?: Constructor<TContext>
): FieldCreator<TSource, TContext> => (options, resolve) => {
  return {
    type: getGraphQLOutputType(source),
    args: {},
    resolve,
  };
};

class Args {
  test!: string
}

class Context {
  foo!: string;
}

const files = fieldCreatorFor(Foo, Context)({ args: Args, type: Foo }, async (root, args, context) => {
  return new Foo();
});

type FieldsOptions<TSource, TContext = {}> = {
  source: Constructor<TSource>,
  context?: Constructor<TContext>
}

const fields = <TSource, TContext, TReturn, TArgs = null>(
  options: FieldsOptions<TSource, TContext>,
  callback: (field: FieldCreator<TSource, TContext>) => GraphQLFieldConfigMap<TSource, TContext>,
): GraphQLFieldConfigMap<TSource, TContext> => {
  const fieldCreator = fieldCreatorFor(options.source, options.context);
  return callback(fieldCreator);
}

@ObjectTypeSource({
  name: 'Test',
  description: 'A test thing',
  fields: () => testFields,
})
class TestSource {
  constructor(public foo: number) {}
}

const testFields = fields({ source: TestSource }, (field) => ({
  foo: field({ type: TestSource }, (source) => {
    return new TestSource(source.foo * 5);
  }),
}));

console.log(Object.keys(getGraphQLType(TestSource)));

