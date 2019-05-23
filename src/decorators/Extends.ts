import { AnyConstructor } from '../types';
import { Extension } from '../Extension';
import { storeExtends } from '../metadata';

export default <TSource>(source: AnyConstructor<TSource>) =>
  (target: AnyConstructor<Extension<TSource, any>>) => {
    storeExtends(target, source);
  };
