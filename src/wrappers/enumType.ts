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

type EnumValue<TEnumObject> = TEnumObject extends Record<keyof TEnumObject, infer V> ? V : never;

const performChangeCase = (type: EnumTypeCase, value: string): string => {
  switch (type) {
    case EnumTypeCase.Constant:
      return constantCase(value);
    case EnumTypeCase.Pascal:
      return pascalCase(value);
  }
};

const enumType = <TEnumObject extends Record<any, any>>(
  enumObject: TEnumObject,
  config: EnumTypeConfig<keyof TEnumObject>,
): Wrapper<EnumValue<TEnumObject>, GraphQLEnumType> => {
  const { changeCase } = config;

  const getKey = (key: string) => changeCase ? performChangeCase(changeCase, key) : key;

  const graphQLType = new GraphQLEnumType({
    ...config,
    values: Object.keys(enumObject).reduce((map: GraphQLEnumValueConfigMap, key) => {
      if (!isNaN(parseInt(key, 10))) {
        return map;
      }

      const transformedKey = getKey(key);

      if (map[transformedKey]) {
        return map;
      }

      return {
        ...map,
        [transformedKey]: {
          ...config.additional && config.additional[key],
          value: enumObject[key],
        },
      }
    }, {}),
  });

  return {
    graphQLType,
    type: null as any as EnumValue<TEnumObject>,
  }
}

export default enumType;
