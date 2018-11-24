import 'reflect-metadata';
import { Constructor } from './types';
import { getFieldConfigMap, getGraphQLType } from './metadata';
import { unsafeWrapType } from './wrappers/Wrapper';
import ObjectTypeSource from './decorators/ObjectTypeSource';
import { fields } from './fields';
import { Arg, Args, getArgs } from './decorators/Args';
import { GraphQLInputObjectType, GraphQLString } from 'graphql';
import TSGraphQLString from './wrappers/TSGraphQLString';
import TSGraphQLInt from './wrappers/TSGraphQLInt';
import { resolveThunk } from './utils/thunk';

type Test<V extends { [key: string]: any }, T extends string> = {
  [key in T]: V[key];
}

const defaultResolver = <F extends string, Root>(fieldName: F, type: Constructor<Root>) =>
  (root: Test<Root, typeof fieldName>) => root[fieldName];

const blah = 'test';
const foo = {
  blah: '',
  bar: 4,
  test: ''
}
const a: Test<typeof foo, typeof blah> = foo;

class DefaultTest {
  foo!: string;
}

const s: string = defaultResolver('foo', DefaultTest)(new DefaultTest());

class Foo {
  test!: string;
}

@ObjectTypeSource({
  name: 'Parent',
  fields: () => parentFields,
})
class TestParent {
  blah!: string;
}

const parentFields = fields({ source: TestParent }, (field) => ({
  blah: field({ type: TSGraphQLInt }, () => 4),
}));

@ObjectTypeSource({
  name: 'Test',
  description: 'A test thing',
  fields: () => testFields,
})
class TestSource extends TestParent {
  constructor(public foo: number) {
    super();
  }
}

const testFields = fields({ source: TestParent }, (field) => ({
  foo: field({ type: TSGraphQLString }, (source) => {
    return '';
  }),
}));

console.log(resolveThunk(getFieldConfigMap(TestSource)));

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
