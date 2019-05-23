import { fieldDecoratorForContext } from '../../Field';

class Context {}

const Field = fieldDecoratorForContext(Context);

class Foo {
  @Field()
  strMethodArgs() {
    return '';
  }
}
