import Field from '../../Field';

class A {
  a!: string;
}

class Test {
  @Field({ type: A })
  async test() {
    return null;
  }
}
