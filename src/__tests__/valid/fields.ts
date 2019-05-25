import { Field, fields, Implements, InterfaceType, ObjectType, TSGraphQLString } from '../../index';

@InterfaceType()
abstract class Foo {
  @Field({ type: TSGraphQLString })
  abstract bar: string;
}

@ObjectType()
@Implements(Foo)
class FooA {
  async bar() {
    return '';
  }
}

fields({}, (field) => ({
  foo: field(
    { type: Foo },
    () => new FooA(),
  ),
}));
