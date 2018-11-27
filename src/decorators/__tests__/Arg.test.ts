import 'jest';
import { getArgsConfig } from '../../metadata';
import { resolveThunk } from '../../utils/thunk';
import Arg from '../Arg';

class ArgTest {
  @Arg()
  foo: string = 'bar';
}

describe('Arg', () => {
  it('sets default value from property initializer', () => {
    const config = getArgsConfig(ArgTest);
    expect(config).toHaveProperty('foo');
    expect(resolveThunk(config!.foo).defaultValue).toEqual('bar');
  })
});
