import Field from '../../Field';
import { TSGraphQLString } from '../../..';

class Context {
  blah!: string;
}

class Foo {
  @Field({ type: TSGraphQLString, context: Context })
  foo(args: {}, context: Foo) {
    return '';
  };
}
