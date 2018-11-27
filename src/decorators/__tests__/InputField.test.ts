import 'jest';
import InputField from '../InputField';
import { getInputFieldConfig } from '../../metadata';
import { resolveThunk } from '../../utils/thunk';

class InputFieldTest {
  @InputField()
  foo: string = 'bar';
}

describe('InputField', () => {
  it('sets default value from property initializer', () => {
    const config = getInputFieldConfig(InputFieldTest);
    expect(config).toHaveProperty('foo');
    expect(resolveThunk(config!.foo).defaultValue).toEqual('bar');
  })
});
