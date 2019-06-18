import 'jest';
import Field from '../../decorators/Field';
import { resolveThunk } from '../../utils/thunk';
import buildObjectTypeFields from '../buildObjectTypeFields';
import InterfaceType from '../../decorators/InterfaceType';
import Implements from '../../decorators/Implements';
import { fields } from '../../fields';
import { getExtensions, ObjectType, TSGraphQLID, TSGraphQLInt, TSGraphQLString } from '../../index';
import Args from '../../decorators/Args';
import Arg from '../../decorators/Arg';
import list from '../../wrappers/list';
import nullable from '../../wrappers/nullable';
import InputObjectType from '../../decorators/InputObjectType';
import InputField from '../../decorators/InputField';
import { GraphQLID } from 'graphql';
import Extends from '../../decorators/Extends';
import { Extension } from '../../Extension';
import ExtensionField from '../../decorators/ExtensionField';

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
  @Field({ type: () => TSGraphQLString })
  foo(): string {
    return 'foo';
  }
}

const someFields = fields({ source: Foo }, (field) => ({
  bar: field(
    { type: () => TSGraphQLString },
    () => 'bar',
  ),
}));

const moreFields = fields({ source: Foo }, (field) => ({
  baz: field(
    { type: () => TSGraphQLInt },
    () => 4,
  ),
}));

describe('buildObjectTypeFields', () => {
  it('should properly get fields for simple class', () => {
    const config = resolveThunk(buildObjectTypeFields(Simple));
    for (const property in Object.keys(Simple.prototype)) {
      expect(config).toHaveProperty(property);
    }
  });

  it('should inherit fields from superclasses', () => {
    const config = resolveThunk(buildObjectTypeFields(B));
    expect(config).toHaveProperty('a');
    expect(config).toHaveProperty('b');
  });

  it('should inherit fields from interfaces', () => {
    const config = resolveThunk(buildObjectTypeFields(User));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
  });

  it('should inherit fields from interfaces on superclasses', () => {
    const config = resolveThunk(buildObjectTypeFields(Employee));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
    expect(config).toHaveProperty('company');
  });

  it('should override fields with same name from interface', () => {
    class OverrideTest extends User {
      @Field({ type: () => nullable(TSGraphQLID) })
      id!: string;
    }
    const config = resolveThunk(buildObjectTypeFields(OverrideTest));
    expect(config.id.type).toEqual(GraphQLID);
  });

  it('should override fields with same name on superclass', () => {
    class OverrideTest extends Simple {
      @Field({ type: () => nullable(TSGraphQLID) })
      str!: string;
    }
    const config = resolveThunk(buildObjectTypeFields(OverrideTest));
    expect(config.str.type).toEqual(GraphQLID);
  });

  it('should inherit fields from interfaces on superclass and interfaces on itself', () => {
    const config = resolveThunk(buildObjectTypeFields(EmployeeWithPicture));
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('displayName');
    expect(config).toHaveProperty('company');
    expect(config).toHaveProperty('avatarURL');
  });

  it('should merge decorator fields with config fields', () => {
    const config = resolveThunk(buildObjectTypeFields(Foo));
    expect(config).toHaveProperty('foo');
    expect(config).toHaveProperty('bar');
    expect(config).toHaveProperty('baz');
  });

  it('should create resolver from instance method', () => {
    const config = resolveThunk(buildObjectTypeFields(Foo));
    expect(config).toHaveProperty('foo');
    expect(typeof config.foo.resolve).toEqual('function');
    expect(config.foo.resolve!(null, {}, null, null as any)).toEqual(new Foo().foo());
  });

  it('should use default resolver for plain fields', () => {
    const config = resolveThunk(buildObjectTypeFields(Simple));
    expect(config).toHaveProperty('str');
    expect(config.str.resolve!({ str: 'foo' }, {}, null, null as any)).toEqual('foo');
  });

  it('should wrap property initializers', () => {
    const test = (...args: any[]) => {
      expect(args.length).toEqual(3);
      return '';
    }

    @ObjectType()
    class Foo {
      @Field({ type: () => TSGraphQLString })
      foo = test;
    }

    const foo = resolveThunk(buildObjectTypeFields(Foo));
    foo.foo.resolve!(new Foo(), {}, {}, null as any);
  })

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

      @Arg({ type: () => SomeInput })
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
      @Field({ type: () => TSGraphQLString, args: SomeArgs })
      initializerTest = testResolver;

      @Field({ type: () => TSGraphQLString, args: SomeArgs })
      methodTest(args: SomeArgs) {
        return testResolver(args);
      }
    }

    const argsFields = fields({ source: ArgsTest }, (field) => ({
      configTest: field(
        { type: () => TSGraphQLString, args: SomeArgs },
        (root, args) => testResolver(args),
      ),
    }));

    const config = resolveThunk(buildObjectTypeFields(ArgsTest));
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
    const transformOutput = jest.fn(() => 'FOO');

    const someType = {
      ...TSGraphQLString,
      transformOutput,
    }

    @ObjectType()
    class Foo {
      @Field({ type: () => list(nullable(someType)) })
      foo() {
        return ['', null];
      }
    }

    const config = resolveThunk(buildObjectTypeFields(Foo));
    expect(config).toHaveProperty('foo');
    expect(config.foo!.resolve!(null, {}, null, null as any)).toEqual(['FOO', null]);

    expect(transformOutput).toHaveBeenCalledTimes(1);
  });

  it('should correctly include extension fields', () => {
    @ObjectType({
      extensions: () => getExtensions(Foo),
    })
    class Foo {
      @Field({ type: () => TSGraphQLString })
      bar = 'bar';
    }

    @Extends(Foo)
    class FooExtensionA extends Extension<Foo> {
      @ExtensionField()
      static baz: number = 4;

      @ExtensionField({ type: () => TSGraphQLString })
      static blah() {
        return 'blah';
      }
    }

    @Extends(Foo)
    class FooExtensionsB extends Extension<Foo> {
      @ExtensionField()
      static something: string = 'something';
    }

    const config = resolveThunk(buildObjectTypeFields(Foo));
    expect(config).toHaveProperty('bar');
    expect(config).toHaveProperty('baz');
    expect(config).toHaveProperty('blah');
    expect(config).toHaveProperty('something');

    expect(config.baz!.resolve!(null, {}, null, null as any)).toEqual(4);
    expect(config.blah!.resolve!(null, {}, null, null as any)).toEqual('blah');
    expect(config.something!.resolve!(null, {}, null, null as any)).toEqual('something');
  });
});
