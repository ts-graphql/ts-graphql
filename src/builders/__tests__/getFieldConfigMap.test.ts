import 'jest';
import Field from '../../decorators/Field';
import { resolveThunk } from '../../utils/thunk';
import getFieldConfigMap from '../getFieldConfigMap';
import InterfaceType from '../../decorators/InterfaceType';
import Implements from '../../decorators/Implements';
import { fields } from '../../fields';
import { ObjectType, TSGraphQLString } from '../../index';

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

@ObjectType({
  fields: () => someFields,
})
class Foo {
  @Field()
  foo!: string;
}

const someFields = fields({ source: Foo }, (field) => ({
  bar: field(
    { type: TSGraphQLString },
    () => 'bar',
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

  it('should merge decorator fields with config fields', () => {
    const config = resolveThunk(getFieldConfigMap(Foo));
    expect(config).toHaveProperty('foo');
    expect(config).toHaveProperty('bar');
  });
});
