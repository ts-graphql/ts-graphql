import 'jest';
import enumType, { EnumTypeCase } from '../enumType';
import ObjectType from '../../decorators/ObjectType';
import Field from '../../decorators/Field';
import { graphql, GraphQLSchema } from 'graphql';
import buildObjectType from '../../builders/buildObjectType';
import { resolveThunk } from '../../utils/thunk';

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

describe('enumType', () => {
  it('should generate GraphQLEnumType with correct keys', () => {
    const PascalCase = enumType(IntEnum, { name: 'foo' });
    const pascalNames = resolveThunk(PascalCase.graphQLType).getValues().map(({ name }) => name);
    expect(pascalNames).toEqual(['Foo', 'Bar', 'FooBar']);

    const StringPascalCase = enumType(StringEnum, { name: 'foo' });
    const stringPascalNames = resolveThunk(StringPascalCase.graphQLType).getValues().map(({ name }) => name);
    expect(stringPascalNames).toEqual(['Foo', 'Bar', 'FooBar']);

    const ConstantCase = enumType(IntEnum, { name: 'foo', changeCase: EnumTypeCase.Constant });
    const constantNames = resolveThunk(ConstantCase.graphQLType).getValues().map(({ name }) => name);
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

    expect(resolveThunk(AnEnum.graphQLType).getValue('Bar')!.description).toEqual('Description');
  });

  it('should successfully resolve in schema', async () => {
    const AnEnum = enumType(IntEnum, {
      name: 'AnEnum',
    });

    @ObjectType()
    class Query {
      @Field({ type: () => AnEnum })
      enumTest() {
        return IntEnum.FooBar;
      }
    }

    const schema = new GraphQLSchema({
      query: buildObjectType(Query),
    });

    const result = await graphql(schema, `{ enumTest }`);
    expect(result.errors).toBeFalsy();
    expect(result.data!.enumTest).toEqual('FooBar');
  });
});
