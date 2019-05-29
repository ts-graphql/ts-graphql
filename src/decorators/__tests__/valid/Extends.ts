import ObjectType from '../../ObjectType';
import Field from '../../Field';
import { TSGraphQLInt, TSGraphQLString } from '../../../wrappers/scalars';
import ExtensionField from '../../ExtensionField';
import { Extension } from '../../../Extension';
import Extends from '../../Extends';
import Args from '../../Args';
import Arg from '../../Arg';

@ObjectType()
class Foo {
  @Field()
  bar!: string;
}

@Args()
class SomeArgs {
  @Arg()
  foo!: string;
}

class Context {
  something!: string;
}

@Extends(Foo)
class FooExtension extends Extension<Foo, Context> {
  @ExtensionField()
  static inferredNumber = 4;

  @ExtensionField({ type: () => TSGraphQLInt, args: SomeArgs })
  static baz(foo: Foo, args: SomeArgs, context: Context) {
    return foo.bar.length;
  }

  @ExtensionField({ type: () => TSGraphQLInt })
  static blah(foo: Foo) {
    return 42;
  }
}

@Extends(undefined)
class RootTypeFields extends Extension<undefined, Context> {
  @ExtensionField()
  static version: number = 4.2;

  @ExtensionField({ type: () => TSGraphQLString })
  static something(root: undefined, args: {}, context: Context) {
    return context.something;
  }
}
