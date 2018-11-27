import Field from '../../Field';
import { TSGraphQLString } from '../../..';

class Foo {
  @Field({ type: TSGraphQLString })
  foo!: number;
}
