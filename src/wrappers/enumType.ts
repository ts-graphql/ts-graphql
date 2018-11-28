import { Wrapper } from './Wrapper';
import { GraphQLEnumType } from 'graphql';
import { mapValues } from 'lodash';
import pascalCase from 'pascal-case';
import constantCase from 'constant-case';

export enum EnumTypeCase {
  Pascal,
  Constant,
}

export type EnumTypeConfig<K> = {
  name: string,
  changeCase?: EnumTypeCase,
}

const performChangeCase = (type: EnumTypeCase, value: string): string => {
  switch (type) {
    case EnumTypeCase.Constant:
      return constantCase(value);
    case EnumTypeCase.Pascal:
      return pascalCase(value);
  }
};

const enumType = <K extends string, TEnum extends string | number>(
  enumObject: Record<K, TEnum>,
  config: EnumTypeConfig<K>,
): Wrapper<TEnum, GraphQLEnumType> => {
  const { changeCase } = config;

  const valueToOutputMap: Record<TEnum, K> = Object.keys(enumObject).reduce((map, key) => ({
    ...map as any,
    [enumObject[key as K]]: changeCase ? performChangeCase(changeCase, key) : key,
  }), {} as Record<TEnum, K>);

  const graphQLType = new GraphQLEnumType({
    ...config,
    values: mapValues(enumObject, (value) => ({
      value,
    }))
  });

  return {
    graphQLType,
    type: null as any as TEnum,
    transformOutput(value: TEnum) {
      return valueToOutputMap[value] as any;
    }
  }
}

export default enumType;
