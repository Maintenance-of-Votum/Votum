import {
  inProps,
  betweenRange,
  withDefault,
  response,
  ResponseType,
  forwardMotion,
  getProps,
  getDefaultValue,
} from "./Util"
import * as t from "io-ts"

// @ts-ignore
import Motion from "./Motion"

// @ts-ignore
import Votum from "./Votum"

jest.mock("./Motion", () => ({ MotionResolution: {} }))
jest.mock("./Votum", () => ({ getCouncil: jest.fn() }))

describe("Test Util", () => {
  test.each`
    input   | toBe       | output
    ${90}   | ${"Right"} | ${90}
    ${null} | ${"Right"} | ${34}
    ${"85"} | ${"Left"}  | ${null}
  `("Should be $toBe and return $output", ({ input, toBe, output }) => {
    const ioTS_withDefault = withDefault(t.number, 34)
    expect(ioTS_withDefault.decode(input).isRight()).toBe(toBe == "Right")
    expect(ioTS_withDefault.decode(input).isLeft()).toBe(toBe == "Left")
    if (toBe == "Right")
      expect(ioTS_withDefault.decode(input).value).toBe(output)
  })

  test("Should validate numbers within the range", () => {
    const ioTS_betweenRange = betweenRange(1, 10)

    expect(ioTS_betweenRange.decode(5).isRight()).toBe(true)
    expect(ioTS_betweenRange.decode(5).isLeft()).toBe(false)
    expect(ioTS_betweenRange.decode(1).isRight()).toBe(true)
    expect(ioTS_betweenRange.decode(1).isLeft()).toBe(false)
    expect(ioTS_betweenRange.decode(10).isRight()).toBe(true)
    expect(ioTS_betweenRange.decode(10).isLeft()).toBe(false)

    expect(ioTS_betweenRange.decode(0).isRight()).toBe(false)
    expect(ioTS_betweenRange.decode(0).isLeft()).toBe(true)
    expect(ioTS_betweenRange.decode(11).isRight()).toBe(false)
    expect(ioTS_betweenRange.decode(11).isLeft()).toBe(true)

    expect(ioTS_betweenRange.decode("7").isRight()).toBe(false)
    expect(ioTS_betweenRange.decode("7").isLeft()).toBe(true)
  })

  const mockType = t.intersection([
    t.interface({
      prop1: t.string,
      prop2: t.number,
    }),
    t.interface({
      prop3: t.boolean,
    }),
  ])

  test("Should return true if name is in props", () => {
    expect(inProps("prop1", mockType)).toBe(true)
    expect(inProps("prop2", mockType)).toBe(true)
    expect(inProps("prop3", mockType)).toBe(true)
  })

  test("Should return false if name is not in props", () => {
    expect(inProps("prop4", mockType)).toBe(false)
    expect(inProps("prop5", mockType)).toBe(false)
  })

  test("Should return props for an ExactType", () => {
    const A = t.type({
      foo: t.string,
    })

    const B = t.partial({
      bar: t.number,
      caz: t.number,
    })

    const C = t.intersection([A, B])

    type CType = t.TypeOf<typeof C>

    const foo: CType = {
      foo: "dsd",
      bar: 12,
    }

    // foo its just a show case of io-ts lib
    expect(foo.caz).toBe(undefined)

    const props = getProps(C)
    expect(Object.keys(props)).toEqual(["foo", "bar", "caz"])
    expect(props.foo.constructor.name).toBe("StringType")
    expect(props.bar.constructor.name).toBe("NumberType")
    expect(props.caz.constructor.name).toBe("NumberType")
  })

  test("Should return default value for a prop", () => {
    const SampleType = t.type({
      foo: withDefault(t.string, "A Default Value"),
    })
    expect(getDefaultValue("foo", SampleType)).toBe("A Default Value")
  })

  // test("Nome qualquer", async () => {
  //   const mockClient = {
  //     emit: jest.fn(),
  //     dispatcher: { _awaiting: { add: jest.fn(), delete: jest.fn() } },
  //   }
  //   const mockType = await parseType(
  //     // @ts-ignore
  //     {
  //       ...mockClient,
  //       // @ts-ignore
  //       registry: new CommandoRegistry(mockClient).registerType(
  //         // @ts-ignore
  //         new WeightsType(mockClient)
  //       ),
  //     },
  //     {
  //       author: { id: 1 },
  //       channel: { id: 2, awaitMessages: jest.fn() },
  //       reply: jest.fn(),
  //     },
  //     "qualquer",
  //     ConfigurableCouncilDataSerializers["voteWeights"]
  //   )
  //   console.log(mockType)
  // })

  test("Should correct return response value", () => {
    const mockType = response(
      ResponseType.Good,
      "Votação foi aprovada por ~N votos~"
    )
    expect(mockType).toStrictEqual({
      embed: {
        color: ResponseType.Good,
        description: "Votação foi aprovada por `N votos`",
        title: undefined,
      },
    })
  })

  // TODO: Rename it and test something useful
  test("Test forward motion", async () => {
    ;(Votum.getCouncil as jest.Mock).mockReturnValue({
      enabled: true,
      createMotion: jest.fn().mockReturnValue({ postMessage: jest.fn() }),
      channel: {
        guild: {
          members: { fetch: jest.fn() },
        },
      },
    })
    // @ts-ignore
    forwardMotion({ getData: jest.fn().mockReturnValue({ votes: [] }) }, "12")
  })
})
