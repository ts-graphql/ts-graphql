import Field from '../../Field';
import enumType from '../../../wrappers/enumType';

enum AnEnum {
  Foo,
}

const AnEnumGraphQLType = enumType(AnEnum, { name: 'AnEnum' });

class Foo {
  @Field({ type: AnEnumGraphQLType })
  foo!: string;
}
