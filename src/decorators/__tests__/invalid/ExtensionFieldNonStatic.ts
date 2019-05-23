import ObjectType from '../../ObjectType';
import Field from '../../Field';
import { Extension } from '../../../Extension';
import ExtensionField from '../../ExtensionField';
import { TSGraphQLString } from '../../../wrappers/scalars';

@ObjectType()
class Foo {
  @Field()
  bar!: string;
}

class FooExtension extends Extension<Foo> {
  @ExtensionField({ type: TSGraphQLString })
  notStatic(source: string) {
    return '';
  }
}
