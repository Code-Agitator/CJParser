import {stream} from "../lib/stream";
import * as fs from "fs";


describe("Streamer", function () {
    const testCaseFilePath = __dirname + "/../../../document/titanic.csv";
    const titanicStr = fs.readFileSync(testCaseFilePath, 'utf8');
    const testCase = "123456i am better man now"
    const chunksForTestCase = [
        "1234",
        "56i ",
        "am b",
        "ette",
        "r ma",
        "n no",
        "w"
    ]
    it("StringSteamer", async function () {
        const result = await new Promise<string[]>((resolve, reject) => {
            let chunkNum = 0
            const result: string[] = []
            stream(testCase, {
                chunkSize: 4
            }, {
                onChunk(chunk) {
                    result.push(chunk.data)
                    chunkNum++
                },
                onFinish() {
                    resolve(result)
                }
            })
        })
        expect(result).toStrictEqual(chunksForTestCase)
    })
    it("ReaderStreamer", async function () {
        const result = await new Promise<string>((resolve, reject) => {
            let result: string = ""
            stream(fs.createReadStream(testCaseFilePath), {encoding: 'utf-8'}, {
                onChunk(chunk) {
                    result += chunk.data;
                },
                onFinish() {
                    resolve(result)
                },
                onError(err) {
                    reject(err)
                }
            })
        })
        expect(result).toEqual(titanicStr)
    })
})



