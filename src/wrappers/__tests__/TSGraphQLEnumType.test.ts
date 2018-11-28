import 'jest';
import TSGraphQLEnumType, { TSGraphQLEnumCase } from '../TSGraphQLEnumType';

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
  describe('#transformOutput', () => {
    it('should output correct value for number enum, no case change', () => {
      const AnEnum = new TSGraphQLEnumType(IntEnum, { name: 'AnEnum' });
      expect(AnEnum.transformOutput(IntEnum.Foo)).toEqual('Foo');
      expect(AnEnum.transformOutput(IntEnum.Bar)).toEqual('Bar');
      expect(AnEnum.transformOutput(IntEnum.FooBar)).toEqual('FooBar');
    });

    it('should output correct value for number enum with case change', () => {
      const AnEnum = new TSGraphQLEnumType(IntEnum, { name: 'AnEnum', changeCase: TSGraphQLEnumCase.Constant });
      expect(AnEnum.transformOutput(IntEnum.Foo)).toEqual('FOO');
      expect(AnEnum.transformOutput(IntEnum.Bar)).toEqual('BAR');
      expect(AnEnum.transformOutput(IntEnum.FooBar)).toEqual('FOO_BAR');
    });

    it('should output correct value for string enum, no case change', () => {
      const AnEnum = new TSGraphQLEnumType(StringEnum, { name: 'AnEnum' });
      expect(AnEnum.transformOutput(StringEnum.Foo)).toEqual('Foo');
      expect(AnEnum.transformOutput(StringEnum.Bar)).toEqual('Bar');
      expect(AnEnum.transformOutput(StringEnum.FooBar)).toEqual('FooBar');
    });

    it('should output correct value for string enum with case change', () => {
      const AnEnum = new TSGraphQLEnumType(StringEnum, { name: 'AnEnum', changeCase: TSGraphQLEnumCase.Constant });
      expect(AnEnum.transformOutput(StringEnum.Foo)).toEqual('FOO');
      expect(AnEnum.transformOutput(StringEnum.Bar)).toEqual('BAR');
      expect(AnEnum.transformOutput(StringEnum.FooBar)).toEqual('FOO_BAR');
    });
  });
});
