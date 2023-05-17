import Motion from "./Motion"
// @ts-ignore
import Votum from "./Votum"
import { promises as fs } from "fs"
import path from "path"
import { MotionData } from "./MotionData"
import { MotionResolution } from "./Motion"
import { getCouncil } from "./__mocks__/council"

jest.mock("./Votum", () => jest.fn().mockImplementation(() => ({})))

const clearDataFolder = async () => {
  // https://stackoverflow.com/a/42182416/13152732
  const directory = `${__dirname}/../data`

  for (const file of await fs.readdir(directory)) {
    if (file.match(/test-/)) await fs.unlink(path.join(directory, file))
  }
}

describe("Motion Class Test", () => {
    afterEach(async() => {
        await clearDataFolder()
    })
    afterAll(async() => {
        await clearDataFolder()
    })
    const foo: MotionData = {
        authorId: "",
        authorName: "",
        active: false,
        resolution: MotionResolution.Unresolved,
        text: "",
        createdAt: 0,
        didExpire: false,
        votes: [],
    }
test("Should start a motion correctly", () => {
    //@ts-ignore
    const motion = new Motion(0, foo, {
        //getConfig: () => 0.75
        motionExpiration: 0
    })
    expect(motion.authorId).toBe("")
    expect(motion.authorName).toBe("")
    expect(motion.number).toBe(1)
    expect(motion.isExpired).toBe(false)
    expect(motion.votes).toStrictEqual([])
    expect(motion.createdAt).toBe(0)
    motion.createdAt = 1
    expect(motion.createdAt).toBe(1)
    expect(motion.text).toBe("")
    expect(motion.resolution).toBe(MotionResolution.Unresolved)
    expect(Object.is(motion.getData(), foo))
})
test("Test motion majorities", () => {
    //@ts-ignore
    const motion = new Motion(0, foo, {
        //getConfig: () => 0.75
        getConfig: jest.fn().mockReturnValueOnce(0.75).mockReturnValue(undefined),
    })
    expect(motion.requiredMajority).toBe(0.75)
    expect(motion.requiredMajority).toBe(0.5)
    foo.options = {majority: 1}
    expect(motion.requiredMajority).toBe(1)
    foo.options = undefined
})
describe("Test getReadableMajorities", () => {
    test("Test getReadableMajorities return Unanimous", () => {
        //@ts-ignore
        const motion = new Motion(0, foo, {
            getConfig: jest.fn().mockReturnValue(1),
        })
        expect(motion.getReadableMajority()).toBe("Unanimous")
    })
    test("Test getReadableMajorities return Simple Majority", () => {
        //@ts-ignore
        const motion = new Motion(0, foo, {
            getConfig: jest.fn().mockReturnValue(0.5),
        })
        expect(motion.getReadableMajority()).toBe("Simple majority")
    })
    test("Test getReadableMajorities return fraction of value", () => {
        //@ts-ignore
        const motion = new Motion(0, foo, {
            getConfig: jest.fn().mockReturnValue("0.75"),
        })
        expect(motion.getReadableMajority()).toBe("3/4")
    })
})
describe("Test Resolve", () => {
    //@ts-ignore
    const motion = new Motion(0, foo, getCouncil())
    test("Test Attempt to resolve a resolved motion error", () => {
        //@ts-ignore
        expect(() => {motion.resolve({})}).toThrow(Error)
    })
    test("Test data is active", () => {
        foo.active = true
        //@ts-ignore
        expect(motion.resolve({})).toBe(undefined)
        expect(foo.active).toBe(false)
        expect(foo.resolution).toBe(foo.resolution)
        expect(foo.didExpire).toBe(false)
    })

    test("Test MotionResolution Failed", () =>{
        foo.active = true
        motion.council.setConfig("onFailedAnnounce", "foo")
        const motionResolve = MotionResolution.Failed
        motion.resolve(motionResolve)
        expect(motion.council.isUserOnCooldown(foo.authorId)).toBe(false)
    })

    test("Test MotionResolution Passed", () =>{
        foo.active = true
        motion.council.setConfig("onPassedAnnounce", "foo")
        const motionResolve = MotionResolution.Passed
        motion.resolve(motionResolve)
        expect(motion.council.isUserOnCooldown(foo.authorId)).toBe(false)
    })

    test("Test MotionResolution Killed", () =>{
        foo.active = true
        motion.council.setConfig("onKilledAnnounce", "foo")
        const motionResolve = MotionResolution.Killed
        motion.resolve(motionResolve)
        expect(motion.council.isUserOnCooldown(foo.authorId)).toBe(false)
    })
})

})