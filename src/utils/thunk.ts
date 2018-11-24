import { ObjectLiteral } from '../types';

export type Thunk<T> = T | (() => T);

export const resolveThunk = <T>(thunk: Thunk<T>): T => {
  return typeof thunk === 'function' ? (thunk as () => T)() : thunk;
}

export const mergeThunks = <T extends ObjectLiteral>(...thunks: Array<Thunk<T>>): Thunk<T> => {
  return () => thunks.map(resolveThunk).reduce((merged, value) => ({
    ...merged,
    ...value as any,
  }), {});
}
