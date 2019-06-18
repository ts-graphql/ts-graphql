import { TSGraphQLID } from '../../..';
import InputField from '../../InputField';
import nullable from '../../../wrappers/nullable';
import nullableInput from '../../../wrappers/nullableInput';
import { Maybe } from '../../../types';
import list from '../../../wrappers/list';

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

  @InputField({ type: () => nullableInput(Data) })
  maybeData: Maybe<Data>;

  @InputField({ type: () => list(Data) })
  dataList!: Data[];

  @InputField({ type: () => list(nullableInput(Data)) })
  nullableDataList!: Array<Maybe<Data>>;

  @InputField({ type: () => nullable(list(nullableInput(Data))) })
  maybeDataMaybeList: Maybe<Array<Maybe<Data>>>;
}
