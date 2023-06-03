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
import Motion, { MotionResolution } from "./Motion"

// @ts-ignore
import Votum from "./Votum"

jest.mock("./Motion", () => ({ MotionResolution: {Unresolved: 0} }))
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

  test.each`
    input   | toBe       | output
    ${1}    | ${"Right"} | ${1}
    ${5}    | ${"Right"} | ${5}
    ${10}   | ${"Right"} | ${10}
    ${0}    | ${"Left"}  | ${null}
    ${11}   | ${"Left"}  | ${null}
    ${"7"}  | ${"Left"}  | ${null}
  `("Should validate numbers within the range", ({ input, toBe, output }) => {
      const ioTS_betweenRange = betweenRange(1, 10)
      expect(ioTS_betweenRange.decode(input).isRight()).toBe(toBe == "Right")
      expect(ioTS_betweenRange.decode(input).isLeft()).toBe(toBe == "Left")
      if (toBe == "Right")
        expect(ioTS_betweenRange.decode(input).value).toBe(output)
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

  test("Should return props for an IntersectionType", () => {
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

  test("Should return props for an ExactType", () => {
    const A = t.exact(t.type({
      foo: t.string,
    }))

    const props = getProps(A)

    expect(Object.keys(props)).toEqual(["foo"])
    expect(props.foo).toBe(t.string)
  })

  test("Should return props for a RefinementType", () => {
    const isPositive = (n: number): n is t.Branded<number, { readonly Positive: unique symbol }> =>
      n > 0

    const NumberType = t.refinement(t.number, isPositive)

    const user = t.type({
      age: NumberType
    })
    const props = getProps(user)

    expect(Object.keys(props)).toEqual(["age"])
    expect(props.age).toEqual(NumberType)
  })


  test("Should return props for a ReadonlyType", () => {
    const PointType = t.type({
      x: t.number,
      y: t.number,
    })

    const ReadonlyPointType = t.readonly(PointType)

    const props = getProps(ReadonlyPointType)

    expect(Object.keys(props)).toEqual(["x", "y"])
    expect(props.x).toBe(t.number)
    expect(props.y).toBe(t.number)
  })

  test("Should return props for an InterfaceType", () => {
    const A = t.type({
      foo: t.string,
    })

    const B = t.type({
      bar: t.number,
      caz: t.number,
    })

    const C = t.interface({
      ...A.props,
      ...B.props,
    })

    const props = getProps(C)

    expect(Object.keys(props)).toEqual(["foo", "bar", "caz"])
    expect(props.foo).toBe(t.string)
    expect(props.bar).toBe(t.number)
    expect(props.caz).toBe(t.number)
  })

  test("Should return props for a StrictType", () => {
    const A = t.type({
      foo: t.string,
    })

    const B = t.type({
      bar: t.number,
      caz: t.number,
    })

    const C = t.strict({
      ...A.props,
      ...B.props,
    })

    const props = getProps(C)

    expect(Object.keys(props)).toEqual(["foo", "bar", "caz"])
    expect(props.foo).toBe(t.string)
    expect(props.bar).toBe(t.number)
    expect(props.caz).toBe(t.number)
  })

  test("Should return props for a PartialType", () => {
    const A = t.type({
      foo: t.string,
    });

    const B = t.partial({
      bar: t.number,
      caz: t.number,
    });

    const C = t.partial({
      ...A.props,
      ...B.props,
    });

    const props = getProps(C);

    expect(Object.keys(props)).toEqual(["foo", "bar", "caz"]);
    expect(props.foo).toBe(t.string);
    expect(props.bar).toBe(t.number);
    expect(props.caz).toBe(t.number);
  });


  test("Should return default value for a prop", () => {
    const SampleType = t.type({
      foo: withDefault(t.string, "A Default Value"),
    })
    expect(getDefaultValue("foo", SampleType)).toBe("A Default Value")
  })

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

  test("Test forward motion", async () => {
    const date = Date.now()
    jest.useFakeTimers().setSystemTime(date)

    // Mocking the dependencies
    const mockCouncilId = "mockCouncilId"
    const mockMotionData = {
      votes: [
        {
          state: undefined,
          authorId: "0",
          authorName: "»mockAuthorName",
        },
      ],
      resolution: MotionResolution.Unresolved,
      active: true,
      didExpire: false,
      createdAt: date,
    }

    const mockCouncil = {
      enabled: true,
      createMotion: jest.fn().mockReturnValue({ postMessage: jest.fn() }),
      channel: {
        guild: {
          members: { fetch: jest.fn() },
        },
      },
    };

    // Mocking the external dependencies
    (Votum.getCouncil as jest.Mock).mockReturnValue(mockCouncil)

    // Creating the mock Motion object
    const mockMotion: Motion = {
      // @ts-ignore
      council: {}, // Preencha com os dados do council necessários
      // @ts-ignore
      motionIndex: "mockMotionIndex",
      // @ts-ignore
      data: { votes: [] }, // Preencha com os dados do motion necessários
      authorId: "mockAuthorId",
      getData: jest.fn().mockReturnValue({ votes: [{
        authorName: "mockAuthorName"
        }]})
      // Adicione as outras propriedades necessárias aqui
    }

    // Calling the tested method
    await forwardMotion(mockMotion, mockCouncilId)

    // Verifying the calls and assertions
    expect(Votum.getCouncil).toHaveBeenCalledWith(mockCouncilId)
    expect(mockCouncil.createMotion).toHaveBeenCalledWith(mockMotionData)
    expect(mockCouncil.channel.guild.members.fetch).toHaveBeenCalled()
    expect(mockMotionData.votes[0].state).toBeUndefined()
    expect(mockMotionData.votes[0].authorId).toBe("0")
    expect(mockMotionData.votes[0].authorName).toBe("»mockAuthorName")
    expect(mockMotionData.resolution).toBe(0)
    expect(mockMotionData.active).toBe(true)
    expect(mockMotionData.didExpire).toBe(false)
    expect(mockMotionData.createdAt).toBe(date)
    expect(mockCouncil.createMotion().postMessage).toHaveBeenCalledWith(true)
  });
})
