import {ParserConfig, ParserResult} from "./types";
import {guessDelimiterFromCsv, guessLineEndingCharFromCsv} from "./parserHelper";
import {Readable} from "stream";
import {stream} from "@cjparser/stream";


export class Parser {
    private config: ParserConfig
    private readonly datasource: string | Readable
    private partOfLine: string
    private headers: string[]

    constructor(datasource: string | Readable, config: ParserConfig = {mode: 'default'}) {
        this.config = config
        this.datasource = datasource
        this.partOfLine = ''
        this.headers = []
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
                if (this.hasHeaders() && lines.length > 0) {
                    this.headers = lines[0]
                    lines.shift()
                    if (this.config.headerCustomizer) {
                        for (let i = 0; i < this.headers.length; i++) {
                            this.headers[i] = this.config.headerCustomizer(this.headers[i], i)
                        }
                    }
                    if (this.config.onHeaders) {
                        this.config.onHeaders(this.headers)
                    }
                }
                if (lines) {
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i]
                        if (this.config.cellsCustomizer) {
                            for (let j = 0; j < line.length; j++) {
                                line[j] = this.config.cellsCustomizer(line[j], this.headers[j], j)
                            }
                        }
                        if (this.config.onLine) {
                            this.config.onLine(line)
                        }
                    }
                }
            },
            onFinish: () => {
                if (this.config.onFinish) {
                    this.config.onFinish()
                }
            }
        })
    }


    private hasHeaders() {
        return this.headers.length <= 0;
    }
}


