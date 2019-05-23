import { AnyConstructor, Maybe } from '../types';
import { Extension } from '../Extension';
import { storeExtends } from '../metadata';

export default <TSource = undefined>(source: Maybe<AnyConstructor<TSource>>) =>
  (target: AnyConstructor<Extension<TSource, any>>) => {
    if (source) {
      storeExtends(target, source);
    }
  };
