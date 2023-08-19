import {ParserConfig, ParserResult} from "./types";
import {guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "./parserHelper";


class Parser {
    private config: ParserConfig

    constructor(config: ParserConfig) {
        this.config = config
    }

    public parse(content: string, ignoreLastLine: boolean = true): ParserResult {
        const lineEnd = this.config.lineEnd ?? guessLineEndingCharFromCsv(content)
        const delimiter = this.config.delimiter ?? guessDelimiterFromCsv(content)
        const result: ParserResult = {
            data: []
        };
        const lines = content.split(lineEnd);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (i === lines.length - 1 && ignoreLastLine) {
                result.partOfLine = line
                continue
            }
            const columns = line.split(delimiter);
            result.data.push(columns)
        }
        return result
    }


}


