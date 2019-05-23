import { Extends, Extension, ExtensionField, TSGraphQLString } from '../../src';
import Root from './Root';

@Extends(Root)
export class FooQueryFields extends Extension<Root> {
  @ExtensionField({
    type: TSGraphQLString,
    description: 'Foo'
  })
  static foo = 'foo';
}
