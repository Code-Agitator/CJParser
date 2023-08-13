import {Encoding} from "crypto";

export interface StreamerConfig {
    chunkSize?: number
    encoding?: Encoding
}

export interface StreamerEventHandler<T> {
    onChunk?: ChunkConsumer<T>
    onFinish?: VoidFunction
    onError?: AnyParamFunction
}

export interface ChunkModel<T> {
    data: T,
    isLastChunk: boolean
}

export interface ChunkConsumer<T> {
    (chunk: ChunkModel<T>): void
}

export interface AnyParamFunction {
    (param: any): void
}