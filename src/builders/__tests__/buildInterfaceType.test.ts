import 'jest';
import buildInterfaceType from '../buildInterfaceType';
import InterfaceType from '../../decorators/InterfaceType';
import Implements from '../../decorators/Implements';
import ObjectType from '../../decorators/ObjectType';
import buildObjectType from '../buildObjectType';

describe('buildInterfaceType', () => {
  it('should throw if not an interface type', () => {
    class Foo {}
    expect(() => buildInterfaceType(Foo)).toThrow();
  });

  describe('resolveType', () => {
    @InterfaceType()
    class Foo {}

    @ObjectType()
    @Implements(Foo)
    class A {}

    @ObjectType()
    @Implements(Foo)
    class B {}

    const iface = buildInterfaceType(Foo);

    it('should resolve correct object type', () => {
      expect(iface.resolveType!(new A(), {}, null as any, iface)).toEqual(buildObjectType(A));
      expect(iface.resolveType!(new B(), {}, null as any, iface)).toEqual(buildObjectType(B));
    });

    it('should throw if source does not implement', () => {
      class C {}
      expect(() => iface.resolveType!(new C(), {}, null as any, iface)).toThrow();
    });

    it('should support multiple inheritance', () => {
      @InterfaceType()
      class IfaceA {}

      @InterfaceType()
      class IfaceB {}

      @ObjectType()
      @Implements(IfaceA)
      @Implements(IfaceB)
      class Bar {}

      const ifaceA = buildInterfaceType(IfaceA);
      const ifaceB = buildInterfaceType(IfaceB);

      expect(ifaceA.resolveType!(new Bar(), {}, null as any, ifaceA)).toEqual(buildObjectType(Bar));
      expect(ifaceB.resolveType!(new Bar(), {}, null as any, ifaceB)).toEqual(buildObjectType(Bar));
    })
  })
});
