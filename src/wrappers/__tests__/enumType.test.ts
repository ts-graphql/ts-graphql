import 'jest';
import enumType, { EnumTypeCase } from '../enumType';

enum IntEnum {
  Foo,
  Bar,
  FooBar,
}

enum StringEnum {
  Foo = 'foo',
  Bar = 'bar',
  FooBar = 'foobar',
}

describe('TSGraphQLEnumType', () => {
  it('should generate GraphQLEnumType with correct keys', () => {
    const PascalCase = enumType(IntEnum, { name: 'foo' });
    const pascalNames = PascalCase.graphQLType.getValues().map(({ name }) => name);
    expect(pascalNames).toEqual(['Foo', 'Bar', 'FooBar']);

    const ConstantCase = enumType(IntEnum, { name: 'foo', changeCase: EnumTypeCase.Constant });
    const constantNames = ConstantCase.graphQLType.getValues().map(({ name }) => name);
    expect(constantNames).toEqual(['FOO', 'BAR', 'FOO_BAR']);
  });

  it('should add config from additional', () => {
    const AnEnum = enumType(IntEnum, {
      name: 'AnEnum',
      additional: {
        Bar: {
          description: 'Description',
        },
      },
    });

    expect(AnEnum.graphQLType.getValue('Bar')!.description).toEqual('Description');
  });

  describe('#transformOutput', () => {
    it('should output correct value for number enum, no case change', () => {
      const AnEnum = enumType(IntEnum, { name: 'AnEnum' });
      expect(AnEnum.transformOutput!(IntEnum.Foo)).toEqual('Foo');
      expect(AnEnum.transformOutput!(IntEnum.Bar)).toEqual('Bar');
      expect(AnEnum.transformOutput!(IntEnum.FooBar)).toEqual('FooBar');
    });

    it('should output correct value for number enum with case change', () => {
      const AnEnum = enumType(IntEnum, { name: 'AnEnum', changeCase: EnumTypeCase.Constant });
      expect(AnEnum.transformOutput!(IntEnum.Foo)).toEqual('FOO');
      expect(AnEnum.transformOutput!(IntEnum.Bar)).toEqual('BAR');
      expect(AnEnum.transformOutput!(IntEnum.FooBar)).toEqual('FOO_BAR');
    });

    it('should output correct value for string enum, no case change', () => {
      const AnEnum = enumType(StringEnum, { name: 'AnEnum' });
      expect(AnEnum.transformOutput!(StringEnum.Foo)).toEqual('Foo');
      expect(AnEnum.transformOutput!(StringEnum.Bar)).toEqual('Bar');
      expect(AnEnum.transformOutput!(StringEnum.FooBar)).toEqual('FooBar');
    });

    it('should output correct value for string enum with case change', () => {
      const AnEnum = enumType(StringEnum, { name: 'AnEnum', changeCase: EnumTypeCase.Constant });
      expect(AnEnum.transformOutput!(StringEnum.Foo)).toEqual('FOO');
      expect(AnEnum.transformOutput!(StringEnum.Bar)).toEqual('BAR');
      expect(AnEnum.transformOutput!(StringEnum.FooBar)).toEqual('FOO_BAR');
    });
  });
});
