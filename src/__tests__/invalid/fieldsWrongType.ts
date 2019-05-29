import { Field, fields, Implements, InterfaceType, list, ObjectType, TSGraphQLString } from '../../index';

@ObjectType()
class Foo {
  @Field({ type: () => TSGraphQLString })
  bar!: string;
}

fields({}, (field) => ({
  foo: field(
    { type: () => Foo },
    () => 'foo',
  ),
}));
