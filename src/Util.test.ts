import { inProps, betweenRange, withDefault, getDefaultValue, response} from "./Util"
import * as t from "io-ts"

// @ts-ignore
import Motion from "./Motion"

// @ts-ignore
import Votum from "./Votum"

jest.mock("./Motion", () => ({}))
jest.mock("./Votum", () => ({getCouncil: jest.fn().mockReturnValue({})}))

describe("Test Util", () => {
  test("Should get correct value for withDefault", () => {
    const ioTS_withDefault = withDefault(t.number, 34)
    expect(ioTS_withDefault.decode(90).isRight()).toBe(true)
    expect(ioTS_withDefault.decode(90).isLeft()).toBe(false)
    expect(ioTS_withDefault.decode(90).value).toBe(90)

    expect(ioTS_withDefault.decode(null).isRight()).toBe(true)
    expect(ioTS_withDefault.decode(null).isLeft()).toBe(false)
    expect(ioTS_withDefault.decode(null).value).toBe(34)

    expect(ioTS_withDefault.decode("85").isRight()).toBe(false)
    expect(ioTS_withDefault.decode("85").isLeft()).toBe(true)
  })

  test("Should validate numbers within the range", () => {
    const ioTS_betweenRange = betweenRange(1, 10);

    expect(ioTS_betweenRange.decode(5).isRight()).toBe(true);
    expect(ioTS_betweenRange.decode(5).isLeft()).toBe(false);
    expect(ioTS_betweenRange.decode(1).isRight()).toBe(true);
    expect(ioTS_betweenRange.decode(1).isLeft()).toBe(false);
    expect(ioTS_betweenRange.decode(10).isRight()).toBe(true);
    expect(ioTS_betweenRange.decode(10).isLeft()).toBe(false);

    expect(ioTS_betweenRange.decode(0).isRight()).toBe(false);
    expect(ioTS_betweenRange.decode(0).isLeft()).toBe(true);
    expect(ioTS_betweenRange.decode(11).isRight()).toBe(false);
    expect(ioTS_betweenRange.decode(11).isLeft()).toBe(true);

    expect(ioTS_betweenRange.decode("7").isRight()).toBe(false);
    expect(ioTS_betweenRange.decode("7").isLeft()).toBe(true);
  });

  const mockType = t.intersection([
    t.interface({
      prop1: t.string,
      prop2: t.number,
    }),
    t.interface({
      prop3: t.boolean,
    }),
  ]);

  test('Should return true if name is in props', () => {
    expect(inProps('prop1', mockType)).toBe(true);
    expect(inProps('prop2', mockType)).toBe(true);
    expect(inProps('prop3', mockType)).toBe(true);
  });

  test('Should return false if name is not in props', () => {
    expect(inProps('prop4', mockType)).toBe(false);
    expect(inProps('prop5', mockType)).toBe(false);
  });

  //TODO
  // test('Should return props for an ExactType', () => {
  //   const mockType = t.exact(t.interface({
  //     prop1: t.string,
  //     prop2: t.number,
  //   }));
  //   console.log(mockType.decode({prop1: 2, prop2: 'gustavo', prop3: true}))
  //   const props = getProps(mockType);
  //   expect(props).toEqual({
  //     prop1: t.string,
  //     prop2: t.number,
  //   });
  // });

  test('Should return default value for a prop', () => {
    const mockType = t.interface({
      prop1: t.string,
      prop2: withDefault(t.number, 34),
    });
    const defaultValue = getDefaultValue('prop2', mockType)
    expect(defaultValue).toBe(34)
  });

  //TODO
  // test('Nome qualquer', async () => {
  //   // @ts-ignore
  //  const mockType = await parseType({}, {}, 'qualquer', {})
  // });

  test('Should correct return response value', () => {
    const mockType = response(0x2ecc71,
      'Votação foi aprovada por ~N votos~')
    expect(mockType).toStrictEqual( {"embed": {"color": 3066993, "description": "Votação foi aprovada por `N votos`", "title": undefined}});
  });
})

