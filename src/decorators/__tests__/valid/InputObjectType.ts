import InputObjectType from '../../InputObjectType';

@InputObjectType()
class SomeInput{}

@InputObjectType({
  name: 'blah',
  description: '',
})
class AnotherInput{}
