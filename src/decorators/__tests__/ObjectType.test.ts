import 'jest';
import { InterfaceType } from '../../index';
import Field from '../Field';
import ObjectType from '../ObjectType';
import Implements from '../Implements';
import { getImplementers } from '../../metadata';

@InterfaceType()
abstract class Foo {
  @Field()
  foo!: string;
}

@ObjectType()
@Implements(Foo)
class A {
  foo!: string;
}

@ObjectType()
class B extends A {

}

describe('ObjectType', () => {
  it('should save implementers for superclasses', () => {
    const implementers = getImplementers(Foo);
    expect(implementers).toBeTruthy();
    expect(implementers).toHaveLength(2);
    expect(implementers).toContain(B);
  });
});
