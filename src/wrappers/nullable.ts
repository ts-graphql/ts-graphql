import { isWrapper, Wrapper, WrapperOrType } from './Wrapper';
import { buildType } from '../typeHelpers';
import { GraphQLNullableType } from 'graphql';
import { Maybe } from '../types';

export default function nullable<T, Q extends GraphQLNullableType>(
  type: WrapperOrType<T, Q>,
): Wrapper<Maybe<T>, Q> {
  const currentType = buildType(type) as Q;
  const transformOutput = isWrapper(type) && type.transformOutput;
  return {
    graphQLType: currentType,
    transformOutput: transformOutput
      ? (output: Maybe<T>) => output != null ? transformOutput.bind(type)(output) : output
      : undefined,
    type: null,
    nullable: true,
  };
}
