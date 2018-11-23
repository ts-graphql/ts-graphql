import 'reflect-metadata';
import { Constructor } from './types';
import { getGraphQLType } from './metadata';
import { unsafeWrapType, WrapperOrType } from './wrappers/Wrapper';
import ObjectTypeSource from './decorators/ObjectTypeSource';
import Field from './decorators/Field';
import { fields } from './fields';
import { Arg, Args, getArgs } from './decorators/Args';
import nullable from './wrappers/nullable';
import { GraphQLInputObjectType, GraphQLString } from 'graphql';

type Test<V extends { [key: string]: any }, T extends string> = {
  [key in T]: V[key];
}

const defaultResolver = <F extends string, Root>(fieldName: F, type: Constructor<Root>) =>
  (root: Test<Root, typeof fieldName>) => root[fieldName];

class Foo {
  test!: string;
}

@ObjectTypeSource({
  name: 'Test',
  description: 'A test thing',
  fields: () => testFields,
})
class TestSource {
  constructor(public foo: number) {}

  @Field({ type: TestSource })
  blah = new TestSource(this.foo * 2);
}

const testFields = fields({ source: TestSource }, (field) => ({
  foo: field({ type: nullable(TestSource) }, (source) => {
    return null;
  }),
}));

console.log(Object.keys(getGraphQLType(TestSource)));

const TestInputType = new GraphQLInputObjectType({
  name: 'TestInput',
  fields: {
    foo: {
       type: GraphQLString,
    },
  },
});

@Args()
class TestArgs {
  @Arg({ type: unsafeWrapType(TestInputType) })
  input!: any;
}

console.log(getArgs(TestArgs));

