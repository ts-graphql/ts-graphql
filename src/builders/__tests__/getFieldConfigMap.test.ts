import 'jest';
import Field from '../../decorators/Field';
import { resolveThunk } from '../../utils/thunk';
import getFieldConfigMap from '../getFieldConfigMap';
import InterfaceType from '../../decorators/InterfaceType';
import Implements from '../../decorators/Implements';
import { fields } from '../../fields';
import { ObjectType, TSGraphQLInt, TSGraphQLString } from '../../index';
import Args from '../../decorators/Args';
import Arg from '../../decorators/Arg';
import list from '../../wrappers/list';
import nullable from '../../wrappers/nullable';
import enumType, { EnumTypeCase } from '../../wrappers/enumType';
import { Maybe } from '../../types';
import { Wrapper } from '../../wrappers/Wrapper';
import { GraphQLEnumType } from 'graphql';
import InputObjectType from '../../decorators/InputObjectType';
import InputField from '../../decorators/InputField';

class Simple {
  @Field()
  str!: string;

  @Field()
  num!: number;

  @Field()
  bool!: boolean;
}

class A {
  @Field()
  a!: string;
}

class B extends A {
  @Field()
  b!: string;
}

@InterfaceType()
abstract class Node {
  @Field()
  id!: string;
}

@InterfaceType()
abstract class Actor {
  @Field()
  displayName!: string;
}

@Implements(Node)
@Implements(Actor)
class User {
  id!: string;
  displayName!: string;

  @Field()
  email!: string;
}

class Employee extends User {
  @Field()
  company!: string;
}

@InterfaceType()
abstract class HasAvatar {
  @Field()
  avatarURL!: string;
}

@Implements(HasAvatar)
class EmployeeWithPicture extends Employee {
  avatarURL!: string;
}

@ObjectType({
  fields: () => [someFields, moreFields],
})
class Foo {
  @Field({ type: TSGraphQLString })
  foo(): string {
    return 'foo';
  }
}

const someFields = fields({ source: Foo }, (field) => ({
  bar: field(
    { type: TSGraphQLString },
    () => 'bar',
  ),
}));

const moreFields = fields({ source: Foo }, (field) => ({
  baz: field(
    { type: TSGraphQLInt },
    () => 4,
  ),
}));

describe('getFieldConfigMap', () => {
  it('should properly get fields for simple class', () => {
    const config = resolveThunk(getFieldConfigMap(Simple));
    for (const property in Object.keys(Simple.prototype)) {
      expect(config).toHaveProperty(property);
    }
  });

  it('should inherit fields from superclasses', () => {
    const config = resolveThunk(getFieldConfigMap(B));
    expect(config).toHaveProperty('a');
    expect(config).toHaveProperty('b');
  });

  it('should inherit fields from interfaces', () => {
    const config = resolveThunk(getFieldConfigMap(User));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
  });

  it('should inherit fields from interfaces on superclasses', () => {
    const config = resolveThunk(getFieldConfigMap(Employee));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
    expect(config).toHaveProperty('company');
  });

  it('should inherit fields from interfaces on superclass and interfaces on itself', () => {
    const config = resolveThunk(getFieldConfigMap(EmployeeWithPicture));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
    expect(config).toHaveProperty('company');
    expect(config).toHaveProperty('avatarURL');
  });

  it('should merge decorator fields with config fields', () => {
    const config = resolveThunk(getFieldConfigMap(Foo));
    expect(config).toHaveProperty('foo');
    expect(config).toHaveProperty('bar');
    expect(config).toHaveProperty('baz');
  });

  it('should create resolver from instance method', () => {
    const config = resolveThunk(getFieldConfigMap(Foo));
    expect(config).toHaveProperty('foo');
    expect(typeof config.foo.resolve).toEqual('function');
    expect(config.foo.resolve!(null, {}, null, null as any)).toEqual(new Foo().foo());
  });

  it('should use default resolver for plain fields', () => {
    const config = resolveThunk(getFieldConfigMap(Simple));
    expect(config).toHaveProperty('str');
    expect(config.str.resolve!({ str: 'foo' }, {}, null, null as any)).toEqual('foo');
  });

  it('should instantiate args and input object classes in resolvers', () => {
    @InputObjectType()
    class SomeInput {
      @InputField()
      foo!: string;
    }

    @Args()
    class SomeArgs {
      @Arg()
      bar!: string;

      @Arg({ type: SomeInput })
      input!: SomeInput;
    }

    const testResolver = (args: SomeArgs) => {
      expect(args instanceof SomeArgs).toBeTruthy();
      expect(args.input instanceof SomeInput).toBeTruthy();
      return args.bar;
    }

    @ObjectType({
      fields: () => argsFields,
    })
    class ArgsTest {
      @Field({ type: TSGraphQLString, args: SomeArgs })
      initializerTest = testResolver;

      @Field({ type: TSGraphQLString, args: SomeArgs })
      methodTest(args: SomeArgs) {
        return testResolver(args);
      }
    }

    const argsFields = fields({ source: ArgsTest }, (field) => ({
      configTest: field(
        { type: TSGraphQLString, args: SomeArgs },
        (root, args) => testResolver(args),
      ),
    }));

    const config = resolveThunk(getFieldConfigMap(ArgsTest));
    expect(config).toHaveProperty('configTest');
    expect(config).toHaveProperty('initializerTest');
    expect(config).toHaveProperty('methodTest');
    expect(typeof config.configTest.resolve).toEqual('function');
    expect(typeof config.initializerTest.resolve).toEqual('function');
    expect(typeof config.methodTest.resolve).toEqual('function');

    const args = {
      bar: '',
      input: {
        foo: '',
      },
    }

    config.configTest.resolve!(new ArgsTest(), args, null, null as any);
    config.methodTest.resolve!(new ArgsTest(), args, null, null as any);
  });

  it('should correctly run wrapper transformers', () => {
    enum AnEnum {
      Foo,
      Bar,
    }

    const AnEnumType = enumType(AnEnum, { name: 'AnEnum', changeCase: EnumTypeCase.Constant });

    @ObjectType()
    class Foo {
      @Field({ type: list(nullable(AnEnumType)) })
      foo() {
        return [AnEnum.Foo, AnEnum.Bar, null];
      }
    }

    const config = resolveThunk(getFieldConfigMap(Foo));
    expect(config).toHaveProperty('foo');
    expect(config.foo!.resolve!(null, null as any, null, null as any)).toEqual(['FOO', 'BAR', null]);
  });
});
