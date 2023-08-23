import {ParserConfig, ParserResult} from "./types";
import {guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "./parserHelper";
import {Readable} from "stream";
import {stream} from "@cjparser/stream";


export class Parser {
    private config: ParserConfig
    private datasource: string | Readable
    private partOfLine: string
    private headers: string[] | undefined

    constructor(datasource: string | Readable, config: ParserConfig = {mode: 'default'}) {
        this.config = config
        this.datasource = datasource
        this.partOfLine = ''
    }


    protected parseChunk(content: string, ignoreLastLine: boolean = true): ParserResult {
        const lineEnd = this.config.lineEnd ?? guessLineEndingCharFromCsv(content)
        const delimiter = this.config.delimiter ?? guessDelimiterFromCsv(content)
        const result: ParserResult = {
            data: []
        };
        const lines = content.split(lineEnd);
        if (lines.length > 1) {
            this.config.lineEnd = lineEnd
            this.config.delimiter = delimiter
        }
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

    public run() {
        stream(this.datasource, this.config.streamConfig, {
            onChunk: (chunk) => {
                const result = this.parseChunk(this.partOfLine + chunk.data, !chunk.isLastChunk)
                this.partOfLine = result.partOfLine ?? ''
                const lines = result.data;
                if (!this.headers && lines.length > 0) {
                    this.headers = lines[0]
                    lines.shift()
                    if (this.config.headerCustomizer) {
                        for (let i = 0; i < this.headers.length; i++) {
                            this.headers[i] = this.config.headerCustomizer(this.headers[i], i)
                        }
                    }
                }
                if(lines){

                }



            },
            onFinish() {

            }
        })
    }


}


