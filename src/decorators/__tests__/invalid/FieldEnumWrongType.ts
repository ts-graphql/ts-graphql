import Field from '../../Field';
import enumType from '../../../wrappers/enumType';

enum AnEnum {
  Foo = 'Foo',
}

const AnEnumGraphQLType = enumType(AnEnum, { name: 'AnEnum' });

class Foo {
  @Field({ type: AnEnumGraphQLType })
  foo!: number;
}
