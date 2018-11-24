import { Constructor } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap } from 'graphql';
import { InputFieldConfig } from '../decorators/InputField';
import { graphQLInputTypeForWrapper } from '../wrappers/Wrapper';
import { getConstructorChain } from './utils';
import { getInputFieldConfig } from '../metadata';
import { mapValues } from 'lodash';

export default (source: Constructor<any>): Thunk<GraphQLInputFieldConfigMap> => {
  return () => {
    const chain = getConstructorChain(source);
    const allFields: { [key: string]: InputFieldConfig<any> } = chain
      .map(getInputFieldConfig)
      .map((config) => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    return mapValues(allFields, ((config) => ({
      type: graphQLInputTypeForWrapper(config.type),
      description: config.description,
      defaultValue: config.defaultValue,
    } as GraphQLInputFieldConfig)));
  };
};
