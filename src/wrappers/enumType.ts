import { Wrapper } from './Wrapper';
import { GraphQLEnumType, GraphQLEnumValueConfigMap } from 'graphql';
import pascalCase from 'pascal-case';
import constantCase from 'constant-case';

export enum EnumTypeCase {
  Pascal,
  Constant,
}

export type EnumValueConfig = {
  deprecationReason?: string,
  description?: string,
}

export type EnumValueConfigMap<K extends keyof any> = {
  [key in K]?: EnumValueConfig
}

export type EnumTypeConfig<K extends keyof any> = {
  name: string,
  changeCase?: EnumTypeCase,
  additional?: EnumValueConfigMap<K>,
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

  const getKey = (key: string) => changeCase ? performChangeCase(changeCase, key) : key;

  const valueToOutputMap: Record<TEnum, K> = Object.keys(enumObject).reduce((map, key) => ({
    ...map as any,
    [enumObject[key as K]]: getKey(key),
  }), {} as Record<TEnum, K>);

  const graphQLType = new GraphQLEnumType({
    ...config,
    values: Object.keys(enumObject).reduce((map: GraphQLEnumValueConfigMap, key) => {
      if (!isNaN(parseInt(key, 10))) {
        return map;
      }
      return {
        ...map,
        [getKey(key)]: {
          ...config.additional && (config.additional as any)[key],
          value: (enumObject as any)[key],
        },
      }
    }, {}),
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
