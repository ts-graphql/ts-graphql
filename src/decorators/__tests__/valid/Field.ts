import Field from '../../Field';
import { nullable, TSGraphQLID, TSGraphQLInt, TSGraphQLString } from '../../..';
import { Maybe } from '../../../types';
import { GraphQLResolveInfo } from 'graphql';
import Implements from '../../Implements';
import list from '../../../wrappers/list';

class Data {
  value!: string;
}

class SomeArgs {
  a!: string;
  b!: number;
  c!: boolean;
}

class Context {
  isAuthorized!: boolean;
}

@Implements(Data)
class DataImplementation {
  value() {
    return 'something';
  }
}

class SomeType {
  @Field()
  string!: string;

  @Field()
  boolean!: boolean;

  @Field()
  number!: number;

  @Field({ type: nullable(TSGraphQLInt) })
  nullableInt: Maybe<number>;

  @Field({ type: TSGraphQLID })
  id!: Promise<string | number>;

  @Field({ type: Data })
  async data() {
    return new Data();
  }

  @Field({ type: Data, context: Context })
  async dataWithContext() {
    return new Data();
  }

  @Field({ type: Data })
  dataNoContext(args: {}, context: undefined, info: GraphQLResolveInfo) {
    return new Data();
  }

  @Field({
    type: nullable(Data),
    args: SomeArgs,
    description: 'some data',
    isDeprecated: true,
    deprecationReason: 'old',
    context: Context,
  })
  async oldData(args: SomeArgs, context: Context) {
    return null;
  }

  @Field({ type: Data })
  dataImpl() {
    return new DataImplementation();
  }

  @Field({ type: list(list(Data)) })
  dataImplArray() {
    return [[new DataImplementation()]];
  }
}
