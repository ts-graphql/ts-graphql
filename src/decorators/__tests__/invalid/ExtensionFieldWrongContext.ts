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

class Context {
  user?: string;
}

class FooExtension extends Extension<Foo, Context> {
  @ExtensionField({ type: () => TSGraphQLString })
  static wrongContext(source: Foo, args: {}, context: string) {
    return '';
  }
}
