import { TSGraphQLID } from '../../..';
import InputField from '../../InputField';

class Data {
  foo!: number;
}

class Args {
  @InputField()
  string!: string;

  @InputField()
  int: number = 4;

  @InputField()
  bool!: boolean;

  @InputField({ type: () => TSGraphQLID })
  id!: string | number;

  @InputField({ type: () => Data })
  data!: Data;
}
