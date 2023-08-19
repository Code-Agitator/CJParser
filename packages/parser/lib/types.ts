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
    streamConfig?: StreamerConfig
}

export interface ParserResult {
    data: string[][],
    partOfLine?: string
}

export interface HeaderCustomizer {
    (header: string, index: number): string
}