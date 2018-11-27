import 'jest';
import Field from '../../decorators/Field';
import { resolveThunk } from '../../utils/thunk';
import getFieldConfigMap from '../getFieldConfigMap';
import InterfaceType from '../../decorators/InterfaceType';
import Implements from '../../decorators/Implements';
import { fields } from '../../fields';
import { ObjectType, TSGraphQLInt, TSGraphQLString } from '../../index';

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
  @Field()
  foo(): string {
    return '';
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
  });

  it('should use default resolver for plain fields', () => {
    const config = resolveThunk(getFieldConfigMap(Simple));
    expect(config).toHaveProperty('str');
    expect(config.str.resolve).toBeFalsy();
  });
});
