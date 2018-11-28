import { Wrapper } from './Wrapper';
import { GraphQLEnumType } from 'graphql';
import { mapValues } from 'lodash';
import pascalCase from 'pascal-case';
import constantCase from 'constant-case';

export enum TSGraphQLEnumCase {
  Pascal,
  Constant,
}

export type TSGraphQLEnumTypeConfig<K> = {
  name: string,
  changeCase?: TSGraphQLEnumCase,
}

const performChangeCase = (type: TSGraphQLEnumCase, value: string): string => {
  switch (type) {
    case TSGraphQLEnumCase.Constant:
      return constantCase(value);
    case TSGraphQLEnumCase.Pascal:
      return pascalCase(value);
  }
};

export default class TSGraphQLEnumType<K extends string, TEnum extends string | number> implements Wrapper<TEnum, GraphQLEnumType> {
  graphQLType: GraphQLEnumType;
  type: TEnum;
  private readonly valueToOutput: Record<TEnum, K>;
  constructor(enumType: Record<K, TEnum>, config: TSGraphQLEnumTypeConfig<K>) {
    const { changeCase } = config;
    this.valueToOutput = Object.keys(enumType).reduce((map, key) => ({
      ...map as any,
      [enumType[key as K]]: changeCase ? performChangeCase(changeCase, key) : key,
    }), {} as Record<TEnum, K>);

    this.graphQLType = new GraphQLEnumType({
      ...config,
      values: mapValues(enumType, (value) => ({
        value,
      }))
    });
    this.type = null as any as TEnum;
  }

  transformOutput(value: TEnum) {
    return this.valueToOutput[value] as any;
  }
}
