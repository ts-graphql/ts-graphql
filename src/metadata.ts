import 'reflect-metadata';
import { AnyConstructor, Maybe, ObjectLiteral, EmptyConstructor } from './types';
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

export const storeIsInputObjectType = (target: AnyConstructor<any>) => {
  Reflect.defineMetadata(isInputObjectTypeKey, true, target);
}

export const isInputObjectType = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(isInputObjectTypeKey, target);
}

export const storeIsObjectType = (target: AnyConstructor<any>) => {
  Reflect.defineMetadata(isObjectTypeKey, true, target);
}

export const isObjectType = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(isObjectTypeKey, target);
}

export const getObjectTypeConfig = (target: AnyConstructor<any>): Maybe<StoredObjectTypeConfig> => {
  return Reflect.getMetadata(objectTypeKey, target);
};

export const hasObjectTypeConfig = (target: AnyConstructor<any>) => !!getObjectTypeConfig(target);

export const storeObjectTypeConfig = (target: AnyConstructor<any>, config: StoredObjectTypeConfig) => {
  Reflect.defineMetadata(objectTypeKey, config, target);
};

export const getFieldConfig = (target: AnyConstructor<any>): Maybe<StoredFieldConfig> =>
  Reflect.getMetadata(fieldKey, target.prototype);

export const hasFieldConfig = (target: AnyConstructor<any>) => !!getFieldConfig(target);

export const getSavedFieldConfigMap = (target: AnyConstructor<any>): Maybe<Thunk<FieldConfigMap<any, any>>> =>
  Reflect.getMetadata(fieldMapKey, target);

export const hasSavedFieldConfigMap = (target: AnyConstructor<any>) => !!getSavedFieldConfigMap(target);

export const storeFieldConfig = (prototype: ObjectLiteral, name: string, config: Thunk<FieldConfig<any, any, any, any>>) => {
  const currentFields = Reflect.getMetadata(fieldKey, prototype);
  Reflect.defineMetadata(fieldKey, {...currentFields, [name]: config }, prototype);
};

export const storeFieldConfigMap = (
  target: AnyConstructor<any>,
  configMap: Thunk<FieldConfigMap<any, any>>,
) => {
  Reflect.defineMetadata(fieldMapKey, configMap, target);
};

export const getInputFieldConfig = (target: AnyConstructor<any>): Maybe<{ [key: string]: InputFieldConfig<any> }> => {
  return Reflect.getMetadata(inputFieldKey, target.prototype);
};

export const hasInputFieldConfig = (target: AnyConstructor<any>) => !!getInputFieldConfig(target);

export const storeInputFieldConfig = (
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<InputFieldConfig<any>>,
) => {
  const currentFields = Reflect.get(prototype, inputFieldKey);
  Reflect.defineMetadata(inputFieldKey, { ...currentFields, [name]: config }, prototype);
};

export const isArgs = (target: EmptyConstructor<any>) => {
  return !!Reflect.getMetadata(isArgsKey, target);
};

export const storeIsArgs = (target: EmptyConstructor<any>) => {
  Reflect.defineMetadata(isArgsKey, true, target);
};

export const getImplements = (target: AnyConstructor<any>): Maybe<Array<AnyConstructor<any>>> => {
  return Reflect.getMetadata(implementsKey, target);
};

export const getImplementers = (iface: AnyConstructor<any>): Maybe<Array<AnyConstructor<any>>> => {
  return Reflect.getMetadata(implementersKey, iface);
}

export const storeImplements = (target: AnyConstructor<any>, iface: AnyConstructor<any>) => {
  const currentImplements = getImplements(target) || [];
  const currentImplementers = getImplementers(iface) || [];
  Reflect.defineMetadata(implementsKey, [...currentImplements, iface], target);
  Reflect.defineMetadata(implementersKey, [...currentImplementers, target], iface);
};

export const getInterfaceTypeConfig = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(interfaceKey, target);
};

export const isInterfaceType = (target: AnyConstructor<any>) => {
  return !!getInterfaceTypeConfig(target);
};

export const storeInterfaceTypeConfig = (target: AnyConstructor<any>, config: InterfaceTypeConfig) => {
  Reflect.defineMetadata(interfaceKey, config, target);
};
