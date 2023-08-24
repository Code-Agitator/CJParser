import {StreamerConfig} from "@cjparser/stream";

export type ParserMode = 'default' | 'chunk'

export interface ParserConfig {
    lineEnd?: string,
    delimiter?: string,
    /**
     * it will be chunk if datasource is type `Readable`
     */
    mode?: ParserMode
    headerCustomizer?: HeaderCustomizer
    cellsCustomizer?: CellCustomizer
    onLine?: OnLine
    streamConfig?: StreamerConfig
    onFinish?: Function
}

export interface ParserResult {
    data: string[][],
    partOfLine?: string
}

export interface HeaderCustomizer {
    (header: string, index: number): string
}

export interface CellCustomizer {
    (cell: string, header: string, index: number): string
}

export interface OnLine {
    (line: string[]): void
}