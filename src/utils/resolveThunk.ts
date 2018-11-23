import { Thunk } from 'graphql';

export default <T>(thunk: Thunk<T>): T => {
  return typeof thunk === 'function' ? (thunk as () => T)() : thunk;
}
