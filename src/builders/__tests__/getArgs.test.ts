import 'jest';
import Arg from '../../decorators/Arg';
import Args from '../../decorators/Args';
import getArgs from '../buildArgs';
import { resolveThunk } from '../../utils/thunk';

class WithoutDecorator {
  @Arg()
  foo!: string;
}

@Args()
class WithDecorator {
  @Arg()
  foo!: string;
}

describe('getArgs', () => {
  it('should throw on class without Args decorator', () => {
    expect(() => getArgs(WithoutDecorator)).toThrow();
  });

  it('should get args for class with Args decorator', () => {
    const args = resolveThunk(getArgs(WithDecorator));
    expect(args).toBeTruthy();
    expect(args).toHaveProperty('foo');
  });
})
