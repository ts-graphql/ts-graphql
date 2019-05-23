export abstract class Extension<TSource, TContext = undefined> {
  /**
   * This field is required for type checking and should not be accessed,
   * it is undefined.
   */
  __source!: TSource;
  /**
   * This field is required for type checking and should not be accessed,
   * it is undefined.
   */
  __context!: TContext;
}
