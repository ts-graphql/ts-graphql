import { Field, fields, Implements, InterfaceType, list, ObjectType, TSGraphQLString } from '../../index';

@InterfaceType()
abstract class Foo {
  @Field({ type: () => TSGraphQLString })
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
    { type: () => Foo },
    () => new FooA(),
  ),
  foos: field(
    { type: () => list(list(Foo)) },
    () => [[new FooA()]],
  )
}));
