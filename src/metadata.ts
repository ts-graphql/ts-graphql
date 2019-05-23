import 'reflect-metadata';
import { AnyConstructor, Maybe, ObjectLiteral, EmptyConstructor, Constructor } from './types';
import { FieldConfig, FieldConfigMap } from './fields';
import { resolveThunk, Thunk } from './utils/thunk';
import { InputFieldConfig } from './decorators/InputField';
import { InterfaceTypeConfig } from './decorators/InterfaceType';
import { uniq } from 'lodash';

export type StoredObjectTypeConfig = {
  name?: string,
  description?: string,
};

type StoredFieldConfig = { [key: string]: Thunk<FieldConfig<any, any, any>> };
type StoredInputFieldConfig = { [key: string]: Thunk<InputFieldConfig<any>> };

const isInputObjectTypeKey = Symbol('is-input-object-type');
const isObjectTypeKey = Symbol('is-object-type');
const objectTypeKey = Symbol('object-type');
const fieldKey = Symbol('field');
const fieldMapKey = Symbol('field-map');
const inputFieldKey = Symbol('input-field');
const extensionFieldKey = Symbol('extension-field');
const isArgsKey = Symbol('isArgs');
const implementsKey = Symbol('implements');
const implementersKey = Symbol('implementers');
const interfaceKey = Symbol('interface');
const extendsKey = Symbol('extends');

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

export const getInputFieldConfig = (target: AnyConstructor<any>): Maybe<StoredInputFieldConfig> => {
  return Reflect.getMetadata(inputFieldKey, target.prototype);
};

export const hasInputFieldConfig = (target: AnyConstructor<any>) => !!getInputFieldConfig(target);

export const getArgsConfig = getInputFieldConfig;

export const hasArgsConfig = hasInputFieldConfig;

export const storeInputFieldConfig = (
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<InputFieldConfig<any>>,
) => {
  const currentFields = Reflect.getMetadata(inputFieldKey, prototype);
  Reflect.defineMetadata(inputFieldKey, { ...currentFields, [name]: config }, prototype);
};

export const getExtensionFieldConfig = (target: AnyConstructor<any>): Maybe<StoredFieldConfig> => {
  return Reflect.getMetadata(extensionFieldKey, target);
}

export const hasExtensionFieldConfig = (target: AnyConstructor<any>) => !!getExtensionFieldConfig(target);

export const storeExtensionFieldConfig = (
  target: AnyConstructor<any>,
  name: string,
  config: Thunk<FieldConfig<any, any, any, any>>,
) => {
  const currentFields = Reflect.getMetadata(extensionFieldKey, target);
  Reflect.defineMetadata(extensionFieldKey, { ...currentFields, [name]: config }, target);
}

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
  Reflect.defineMetadata(implementsKey, uniq([...currentImplements, iface]), target);
  Reflect.defineMetadata(implementersKey, uniq([...currentImplementers, target]), iface);
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

export const storeExtends = (target: AnyConstructor<any>, extnds: AnyConstructor<any>) => {
  Reflect.defineMetadata(extendsKey, extnds, target);
}

export const getExtends = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(extendsKey, target);
}

export const isExtension = (target: AnyConstructor<any>) => !!getExtends(target);
