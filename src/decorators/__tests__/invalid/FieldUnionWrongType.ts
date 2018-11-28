import Field from '../../Field';
import enumType from '../../../wrappers/enumType';
import unionType from '../../../wrappers/unionType';

class A {
  foo!: string;
}

class B {
  bar!: string;
}

const AUnionType = unionType<A | B>({
  name: 'AUnionType',
  types: [A, B],
});

class Foo {
  @Field({ type: AUnionType })
  foo!: number;
}
