import { Wrapper } from './Wrapper';
import { GraphQLEnumType, GraphQLNonNull, GraphQLType } from 'graphql';
import { mapValues } from 'lodash';

export type TSGraphQLEnumTypeConfig<K> = {
  name: string;
}

export default class TSGraphQLEnumType<K extends string, TEnum> implements Wrapper<K, GraphQLEnumType> {
  graphQLType: GraphQLEnumType;
  type: K;
  constructor(enumType: Record<K, TEnum>, config: TSGraphQLEnumTypeConfig<K>) {
    this.graphQLType = new GraphQLEnumType({
      ...config,
      values: mapValues(enumType, (value) => ({
        value,
      })),
    });
    this.type = null as any as K;
  }
}
