import {DEFAULT_DELIMITERS, guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "../lib/parserHelper";
import assert from "assert";
import {Parser} from "../lib/parser";
import fs from "fs";
import camelcase from 'camelcase'

const testCaseFilePath = __dirname + "/../../../document/titanic.csv";
const simpleTestCaseFilePath = __dirname + "/../../../document/titanic.csv.simple";
const titanicStr = fs.readFileSync(testCaseFilePath, 'utf8');
const simpleTitanicStr = fs.readFileSync(simpleTestCaseFilePath, 'utf8');
describe("parser", () => {
    const expectHeaders = ['survived', 'pclass', 'sex', 'age', 'sibsp', 'parch', 'fare', 'embarked', 'class', 'who', 'adult_male', 'deck', 'embark_town', 'alive', 'alone']
    const expectSimpleLines = [
        ["0","3","male","22.0","1","0","7.25","S","Third","man","True","","Southampton","no","False"],
        ["1","1","female","38.0","1","0","71.2833","C","First","woman","False","C","Cherbourg","yes","False"],
        ["1","3","female","26.0","0","0","7.925","S","Third","woman","False","","Southampton","yes","True"],
        ["1","1","female","35.0","1","0","53.1","S","First","woman","False","C","Southampton","yes","False"],
        ["0","3","male","35.0","0","0","8.05","S","Third","man","True","","Southampton","no","True"],
        ["0","3","male","","0","0","8.4583","Q","Third","man","True","","Queenstown","no","True"],
        ["0","1","male","54.0","0","0","51.8625","S","First","man","True","E","Southampton","no","True"],
        ["0","3","male","2.0","3","1","21.075","S","Third","child","False","","Southampton","no","False"],
        ["1","3","female","27.0","0","2","11.1333","S","Third","woman","False","","Southampton","yes","False"],
        ["1","2","female","14.0","1","0","30.0708","C","Second","child","False","","Cherbourg","yes","False"],
        ["1","3","female","4.0","1","1","16.7","S","Third","child","False","G","Southampton","yes","False"],
        ["1","1","female","58.0","0","0","26.55","S","First","woman","False","C","Southampton","yes","True"],
        ["0","3","male","20.0","0","0","8.05","S","Third","man","True","","Southampton","no","True"],
        ["0","3","male","39.0","1","5","31.275","S","Third","man","True","","Southampton","no","False"]
    ]
    describe("parser.parserString", () => {

        it('parser with string', async () => {
            let realHeaders: string[] = [];
            const realLines: string[][] = [];
            await new Promise<void>((resolve, reject) => {
                new Parser(simpleTitanicStr, {
                    onLine: (line) => {
                        realLines.push(line)
                    },
                    onHeaders: (headers) => {
                        realHeaders = headers
                    },
                    onFinish: () => {
                        resolve()
                    }
                }).run()
            })
            expect(realHeaders).toStrictEqual(expectHeaders)
            expect(realLines).toStrictEqual(expectSimpleLines)
        })

        it('parser with readable', async () => {
            let realHeaders: string[] = [];
            const realLines: string[][] = [];
            await new Promise<void>((resolve, reject) => {
                new Parser(fs.createReadStream(simpleTestCaseFilePath), {
                    onLine: (line) => {
                        realLines.push(line)
                    },
                    onHeaders: (headers) => {
                        realHeaders = headers
                    },
                    onFinish: () => {
                        resolve()
                    }
                }).run()
            })
            expect(realHeaders).toStrictEqual(expectHeaders)
            expect(realLines).toStrictEqual(expectSimpleLines)
        })

        it('parse with chunk', async () => {
            let realHeaders: string[] = [];
            const realLines: string[][] = [];
            await new Promise<void>((resolve, reject) => {
                new Parser(simpleTitanicStr, {
                    streamConfig: {
                        chunkSize: 90
                    },
                    onLine: (line) => {
                        realLines.push(line)
                    },
                    onHeaders: (headers) => {
                        realHeaders = headers
                    },
                    onFinish: () => {
                        resolve()
                    }
                }).run()
            })
            expect(realHeaders).toStrictEqual(expectHeaders)
            expect(realLines).toStrictEqual(expectSimpleLines)
        })
        it('parse with chunk', async () => {
            let realHeaders: string[] = [];
            const realLines: string[][] = [];
            await new Promise<void>((resolve, reject) => {
                new Parser(simpleTitanicStr, {
                    streamConfig: {
                        chunkSize: 90
                    },
                    onLine: (line) => {
                        realLines.push(line)
                    },
                    onHeaders: (headers) => {
                        realHeaders = headers
                    },
                    onFinish: () => {
                        resolve()
                    }
                }).run()
            })
            expect(realHeaders).toStrictEqual(expectHeaders)
            expect(realLines).toStrictEqual(expectSimpleLines)
        })
    })
})

describe("parserHelper", () => {
    describe("parserHelper.guessLineEndingCharFromCsv", () => {
        it('CRLF', () => {
            const testCaseForCRLF = "line1\r\nline2\r\nline3\r\n"
            const endingCharFromCsv = guessLineEndingCharFromCsv(testCaseForCRLF);
            expect(endingCharFromCsv).toBe("\r\n")
        });
        it('LF', () => {
            const testCaseForLF = "line1\nline2\nline3\n"
            const endingCharFromCsv = guessLineEndingCharFromCsv(testCaseForLF);
            expect(endingCharFromCsv).toBe("\n")

        });
        it('CR', () => {
            const testCaseForCR = "line1\rline2\rline3\r"
            const endingCharFromCsv = guessLineEndingCharFromCsv(testCaseForCR);
            expect(endingCharFromCsv).toBe("\r")
        });
        it('Mixed', () => {
            const testCaseForMixed = "line1\r\nline2\nline3\r"
            const endingCharFromCsv = guessLineEndingCharFromCsv(testCaseForMixed);
            expect(endingCharFromCsv).toBe("\r")
        });
    })


    describe('guessDelimiterFromCsv', () => {
        it('should return the correct delimiter', () => {
            const text = 'col1,col2,col3\nval1,val2,val3\nval4,val5,val6';
            const expectedDelimiter = ',';
            expect(guessDelimiterFromCsv(text)).toBe(expectedDelimiter);
        });

        it('should return the default delimiter when no matches found', () => {
            const text = 'col1col2col3\nval1val2val3\nval4val5val6';
            expect(guessDelimiterFromCsv(text)).toBe(DEFAULT_DELIMITERS);
        });

        it('should be able to guess other delimiters', () => {
            const text = 'col1|col2|col3\nval1|val2|val3\nval4|val5|val6';
            const expectedDelimiter = '|';
            expect(guessDelimiterFromCsv(text)).toBe(expectedDelimiter);
        });

        it('should return the first delimiter with the highest confidence', () => {
            const text = 'col1,col2;col3\nval1,val2;val3\nval4,val5;val6';
            const expectedDelimiter = ',';
            expect(guessDelimiterFromCsv(text)).toBe(expectedDelimiter);
        });
    });
})

