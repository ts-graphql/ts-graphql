import 'jest';
import ObjectType from '../decorators/ObjectType';
import Field from '../decorators/Field';
import InputObjectType from '../decorators/InputObjectType';
import InputField from '../decorators/InputField';
import nullable from '../wrappers/nullable';
import { getInputType, getNamedType, getOutputType, TSGraphQLString } from '..';
import InterfaceType from '../decorators/InterfaceType';
import {
  isEnumType,
  isInputObjectType, isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
} from 'graphql';
import { getType } from '../typeHelpers';
import list from '../wrappers/list';
import enumType from '../wrappers/enumType';
import unionType from '../wrappers/unionType';

@ObjectType()
class AnObjectType {
  @Field()
  foo!: string;
}

@ObjectType()
class AnotherObjectType {
  @Field()
  bar!: string;
}

@InputObjectType()
class AnInputObjectType {
  @InputField()
  foo!: string;
}

@InterfaceType()
class AnInterfaceType {
  @Field()
  foo!: string;
}

enum AnEnum {
  Foo,
}

const AnEnumType = enumType(AnEnum, { name: 'AnEnumType' })

const AUnionType = unionType<AnObjectType | AnotherObjectType>({
  name: 'AUnionType',
  types: [AnObjectType, AnotherObjectType]
})

const ANullableType = nullable(TSGraphQLString);
const AListType = list(TSGraphQLString);

describe('typeHelpers', () => {
  describe('getType', () => {
    it('should never return GraphQLNonNull if nonNull is false', () => {
      expect(isNonNullType(getType(AnObjectType))).toBeFalsy();
      expect(isNonNullType(getType(AnInputObjectType))).toBeFalsy();
      expect(isNonNullType(getType(AnInterfaceType))).toBeFalsy();
      expect(isNonNullType(getType(ANullableType))).toBeFalsy();
      expect(isNonNullType(getType(TSGraphQLString))).toBeFalsy();
    });

    it('should return GraphQLNonNull if nonNull true and type not nullable', () => {
      expect(isNonNullType(getType(ANullableType, true))).toBeFalsy();

      expect(isNonNullType(getType(AnObjectType, true))).toBeTruthy();
      expect(isNonNullType(getType(AnInputObjectType, true))).toBeTruthy();
      expect(isNonNullType(getType(AnInterfaceType, true))).toBeTruthy();
      expect(isNonNullType(getType(TSGraphQLString, true))).toBeTruthy();
    });
  });

  describe('getInputType', () => {
    it('should correctly return input types', () => {
      expect(isEnumType(getInputType(AnEnumType))).toBeTruthy();
      expect(isScalarType(getInputType(TSGraphQLString))).toBeTruthy();
      expect(isInputObjectType(getInputType(AnInputObjectType))).toBeTruthy();
      expect(isListType(getInputType(AListType))).toBeTruthy();
      expect(isNonNullType(getInputType(TSGraphQLString, true))).toBeTruthy();
    });

    it('should throw if not an input type', () => {
      expect(() => getInputType(AnObjectType)).toThrow();
    });
  });

  describe('getOutputType', () => {
    it('should correctly return output types', () => {
      expect(isEnumType(getOutputType(AnEnumType))).toBeTruthy();
      expect(isScalarType(getOutputType(TSGraphQLString))).toBeTruthy();
      expect(isObjectType(getOutputType(AnObjectType))).toBeTruthy();
      expect(isListType(getOutputType(AListType))).toBeTruthy();
      expect(isInterfaceType(getOutputType(AnInterfaceType))).toBeTruthy();
      expect(isNonNullType(getOutputType(TSGraphQLString, true))).toBeTruthy();
    });

    it('should throw if not an output type', () => {
      expect(() => getOutputType(AnInputObjectType)).toThrow();
    });
  });

  describe('getNamedType', () => {
    it('should correctly return named types', () => {
      expect(isEnumType(getNamedType(AnEnumType))).toBeTruthy();
      expect(isScalarType(getNamedType(TSGraphQLString))).toBeTruthy();
      expect(isObjectType(getNamedType(AnObjectType))).toBeTruthy();
      expect(isInputObjectType(getNamedType(AnInputObjectType))).toBeTruthy();
      expect(isUnionType(getNamedType(AUnionType))).toBeTruthy();
      expect(isInterfaceType(getNamedType(AnInterfaceType))).toBeTruthy();
    });
  });
});
