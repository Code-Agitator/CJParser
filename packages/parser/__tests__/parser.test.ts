import {DEFAULT_DELIMITERS, guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "../lib/parserHelper";
import assert from "assert";

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

