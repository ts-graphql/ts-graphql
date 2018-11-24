import 'reflect-metadata';
import { Constructor, Maybe, ObjectLiteral, SimpleConstructor } from './types';
import { FieldConfig, FieldConfigMap } from './fields';
import { Thunk } from './utils/thunk';
import { InputFieldConfig } from './decorators/InputField';
import getArgs from './builders/getArgs';
import { InterfaceTypeConfig } from './decorators/InterfaceType';
import { FieldResolverMethod } from './decorators/Field';

export type StoredObjectTypeConfig = {
  name?: string,
  description?: string,
};

type StoredFieldConfig = { [key: string]: Thunk<FieldConfig<any, any, any>> };

const isInputObjectTypeKey = Symbol('is-input-object-type');
const isObjectTypeKey = Symbol('is-object-type');
const objectTypeKey = Symbol('object-type');
const fieldKey = Symbol('field');
const fieldMapKey = Symbol('field-map');
const inputFieldKey = Symbol('input-field');
const isArgsKey = Symbol('isArgs');
const implementsKey = Symbol('implements');
const implementersKey = Symbol('implementers');
const interfaceKey = Symbol('interface');

export const storeIsInputObjectType = (target: Constructor<any>) => {
  Reflect.defineMetadata(isInputObjectTypeKey, true, target);
}

export const isInputObjectType = (target: Constructor<any>) => {
  return Reflect.getMetadata(isInputObjectTypeKey, target);
}

export const storeIsObjectType = (target: Constructor<any>) => {
  Reflect.defineMetadata(isObjectTypeKey, true, target);
}

export const isObjectType = (target: Constructor<any>) => {
  return Reflect.getMetadata(isObjectTypeKey, target);
}

export const getObjectTypeConfig = (target: Constructor<any>): Maybe<StoredObjectTypeConfig> => {
  return Reflect.getMetadata(objectTypeKey, target);
};

export const hasObjectTypeConfig = (target: Constructor<any>) => !!getObjectTypeConfig(target);

export const storeObjectTypeConfig = (target: Constructor<any>, config: StoredObjectTypeConfig) => {
  Reflect.defineMetadata(objectTypeKey, config, target);
};

export const getFieldConfig = (target: Constructor<any>): Maybe<StoredFieldConfig> =>
  Reflect.getMetadata(fieldKey, target.prototype);

export const hasFieldConfig = (target: Constructor<any>) => !!getFieldConfig(target);

export const getSavedFieldConfigMap = (target: Constructor<any>): Maybe<Thunk<FieldConfigMap<any, any>>> =>
  Reflect.getMetadata(fieldMapKey, target);

export const hasSavedFieldConfigMap = (target: Constructor<any>) => !!getSavedFieldConfigMap(target);

export const storeFieldConfig = (prototype: ObjectLiteral, name: string, config: Thunk<FieldConfig<any, any, any, any>>) => {
  const currentFields = Reflect.getMetadata(fieldKey, prototype);
  Reflect.defineMetadata(fieldKey, {...currentFields, [name]: config }, prototype);
};

export const storeFieldConfigMap = (
  target: Constructor<any>,
  configMap: Thunk<FieldConfigMap<any, any>>,
) => {
  Reflect.defineMetadata(fieldMapKey, configMap, target);
};

export const getInputFieldConfig = (target: Constructor<any>): Maybe<{ [key: string]: InputFieldConfig<any> }> => {
  return Reflect.getMetadata(inputFieldKey, target.prototype);
};

export const hasInputFieldConfig = (target: Constructor<any>) => !!getInputFieldConfig(target);

export const storeInputFieldConfig = (
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<InputFieldConfig<any>>,
) => {
  const currentFields = Reflect.get(prototype, inputFieldKey);
  Reflect.defineMetadata(inputFieldKey, { ...currentFields, [name]: config }, prototype);
};

export const isArgs = (target: SimpleConstructor<any>) => {
  return !!Reflect.getMetadata(isArgsKey, target);
};

export const storeIsArgs = (target: SimpleConstructor<any>) => {
  Reflect.defineMetadata(isArgsKey, true, target);
};

export const getImplements = (target: Constructor<any>): Maybe<Array<Constructor<any>>> => {
  return Reflect.getMetadata(implementsKey, target);
};

export const getImplementers = (iface: Constructor<any>): Maybe<Array<Constructor<any>>> => {
  return Reflect.getMetadata(implementersKey, iface);
}

export const storeImplements = (target: Constructor<any>, iface: Constructor<any>) => {
  const currentImplements = getImplements(target) || [];
  const currentImplementers = getImplementers(iface) || [];
  Reflect.defineMetadata(implementsKey, [...currentImplements, iface], target);
  Reflect.defineMetadata(implementersKey, [...currentImplementers, target], iface);
};

export const getInterfaceTypeConfig = (target: Constructor<any>) => {
  return Reflect.getMetadata(interfaceKey, target);
};

export const isInterfaceType = (target: Constructor<any>) => {
  return !!getInterfaceTypeConfig(target);
};

export const storeInterfaceTypeConfig = (target: Constructor<any>, config: InterfaceTypeConfig) => {
  Reflect.defineMetadata(interfaceKey, config, target);
};
