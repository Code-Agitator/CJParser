export interface ParserConfig {
    lineEnd: string,
    delimiter: string
}

export interface ParserResult {
    data: string[][],
    partOfLine?: string

}