import Field from '../../Field';

// This is not really supposed to be valid but moved it here to document the change, see note in Field.ts

class Foo {
  @Field()
  foo!: string | number;
}
