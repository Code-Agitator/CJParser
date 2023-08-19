import {ParserConfig, ParserResult} from "./types";
import {guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "./parserHelper";
import {Readable} from "stream";
import {Streamer} from "@cjparser/stream";


export class Parser {
    private config: ParserConfig
    private datasource: string | Readable

    constructor(datasource: string | Readable, config: ParserConfig = {mode: 'default'}) {
        this.config = config
        this.datasource = datasource
    }


    protected parseChunk(content: string, ignoreLastLine: boolean = true): ParserResult {
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


