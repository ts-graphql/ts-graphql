import 'reflect-metadata';
import { Constructor } from './types';
import { getArgs, getFieldConfigMap, getGraphQLType, getInputFieldConfigMap } from './metadata';
import { unsafeWrapType } from './wrappers/Wrapper';
import ObjectType from './decorators/ObjectType';
import { fields } from './fields';
import Arg from './decorators/Arg';
import TSGraphQLString from './wrappers/TSGraphQLString';
import TSGraphQLInt from './wrappers/TSGraphQLInt';
import { resolveThunk } from './utils/thunk';
import Field from './decorators/Field';
import InputObjectType from './decorators/InputObjectType';
import InputField from './decorators/InputField';

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

@ObjectType({
  name: 'Parent',
})
class TestParent {
  @Field({ type: TSGraphQLInt, args: Foo })
  async blah(args: Foo, context: Foo) {
    return 4;
  }
}

const parentFields = fields({ source: TestParent }, (field) => ({
  blah: field({ type: TSGraphQLInt }, () => 4),
}));

@ObjectType({
  name: 'Test',
  description: 'A test thing',
})
class TestSource extends TestParent {
  @Field({ type: TSGraphQLString })
  foo = Promise.resolve('test');
}

console.log(resolveThunk(getFieldConfigMap(TestSource)));

console.log(Object.keys(getGraphQLType(TestSource)));

class CommonInput {
  @InputField({
    type: TSGraphQLString
  })
  foo!: 'string';
}

@InputObjectType()
class TestInput extends CommonInput {
  @InputField({
    type: TSGraphQLInt,
  })
  bar!: number;
}

console.log(resolveThunk(getInputFieldConfigMap(TestInput)));

console.log(getGraphQLType(TestInput));

class TestArgs {
  @Arg({ type: TestInput })
  input!: TestInput;
}

class MoreArgs extends TestArgs {
  @Arg({ type: TSGraphQLInt })
  foo!: number;
}

console.log(resolveThunk(getArgs(MoreArgs)));

