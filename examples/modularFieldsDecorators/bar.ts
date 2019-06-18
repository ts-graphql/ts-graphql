import { Extends, Extension, ExtensionField, TSGraphQLString } from '../../src';
import Root from './Root';

@Extends(Root)
export class BarQueryFields extends Extension<Root> {
  @ExtensionField({ type: () => TSGraphQLString })
  static bar = 'bar';
}
