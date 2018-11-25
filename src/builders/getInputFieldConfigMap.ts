import { AnyConstructor } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap } from 'graphql';
import { InputFieldConfig } from '../decorators/InputField';
import { getConstructorChain } from './utils';
import { getInputFieldConfig } from '../metadata';
import { mapValues } from 'lodash';
import { getInputType } from '../typeHelpers';

export default (source: AnyConstructor<any>): Thunk<GraphQLInputFieldConfigMap> => {
  return () => {
    const chain = getConstructorChain(source);
    const allFields: { [key: string]: InputFieldConfig<any> } = chain
      .map(getInputFieldConfig)
      .filter((config) => !!config)
      .map((config) => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    return mapValues(allFields, ((config) => ({
      type: getInputType(config.type, true),
      description: config.description,
      defaultValue: config.defaultValue,
    } as GraphQLInputFieldConfig)));
  };
};
