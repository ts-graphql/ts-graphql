import Field, { fieldDecoratorForContext } from '../../Field';
import { nullable, TSGraphQLID, TSGraphQLInt, TSGraphQLString } from '../../..';
import { Maybe } from '../../../types';
import { GraphQLResolveInfo } from 'graphql';

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

const ScopedField = fieldDecoratorForContext(Context);

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

  @ScopedField({ type: TSGraphQLString })
  async scoped(args: {}, context: Context) {
    return '';
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
}
