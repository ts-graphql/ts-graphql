import { subscriptionFields } from '../../fields';
import { Field, ObjectType, TSGraphQLBoolean, TSGraphQLInt, TSGraphQLString } from '../..';

@ObjectType()
class Foo {
  @Field()
  bar: number = 0;
}

subscriptionFields({}, (field) => ({
  string: field(
    { type: TSGraphQLString },
    async function* () {
      yield 'foo';
    },
  ),
  int: field(
    { type: TSGraphQLInt },
    async function* () {
      yield 42;
    },
  ),
  boolean: field(
    { type: TSGraphQLBoolean },
    async function* () {
      yield false;
    },
  ),
  object: field(
    { type: Foo },
    async function* () {
      yield new Foo();
    },
  )
}));
