import { withDefault } from "./Util"
import * as t from "io-ts"

// @ts-ignore
import Motion from "./Motion"

// @ts-ignore
import Votum from "./Votum"

jest.mock("./Motion", () => ({}))
jest.mock("./Votum", () => ({}))

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
})
