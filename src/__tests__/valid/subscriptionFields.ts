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
      yield 1;
    },
    (num) => `${num}`,
  ),
  int: field(
    { type: TSGraphQLInt },
    async function* () {
      yield 21;
    },
    (num) => num * 2,
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
