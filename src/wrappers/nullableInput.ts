import { Wrapper } from './Wrapper';
import { GraphQLInputObjectType } from 'graphql';
import { AnyConstructor, Maybe } from '../types';
import { once } from 'lodash';
import buildInputObjectType from '../builders/buildInputObjectType';

export default function nullableInput<T>(
  type: AnyConstructor<T>,
): Wrapper<Maybe<T>, GraphQLInputObjectType> {
  const getCurrentType = once(() => buildInputObjectType(type));
  return {
    graphQLType: getCurrentType,
    type: null,
    nullable: true,
  };
}
