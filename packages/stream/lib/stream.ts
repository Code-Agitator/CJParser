import {ChunkModel, StreamerConfig, StreamerEventHandler} from "./types";
import {Readable} from "stream";

export abstract class Streamer<T, R> {
    config: StreamerConfig
    content: T
    handler?: StreamerEventHandler<R>

    protected constructor(content: T, config?: StreamerConfig, handler?: StreamerEventHandler<R>) {
        this.config = config ?? {};
        this.content = content;
        handler && (this.handler = handler)
    }

    protected abstract nextChunk(): ChunkModel<R>

    abstract hasNext(): boolean

    read(handler?: StreamerEventHandler<R>): void {
        handler && (this.handler = handler)
        while (this.hasNext()) {
            this.handler?.onChunk && this.handler?.onChunk(this.nextChunk())
        }
        this.handler?.onFinish && this.handler.onFinish()
    }
}


export class StringStreamer extends Streamer<string, string> {

    constructor(content: string, config?: StreamerConfig, handler?: StreamerEventHandler<string>) {
        super(content, config, handler);
        this.config.chunkSize = this.config.chunkSize ?? content.length
    }

    hasNext(): boolean {
        return !!this.content;
    }

    protected nextChunk(): ChunkModel<string> {
        const chunkContent = this.content?.substring(0, this.config?.chunkSize)
        this.content = this.content?.substring(chunkContent.length)
        return {
            data: chunkContent ?? "",
            isLastChunk: !this.hasNext()
        };

    }

}

export class ReadableStreamer extends Streamer<Readable, string> {

    pauseInternal: boolean
    bufferCache: string[]
    streamEnd: boolean

    constructor(content: Readable, config?: StreamerConfig, handler?: StreamerEventHandler<string>) {
        super(content, config, handler);
        this.pauseInternal = false
        this.bufferCache = []
        this.streamEnd = false
    }

    hasNext(): boolean {
        return !this.streamEnd && this.bufferCache.length === 1;
    }

    nextChunk(): ChunkModel<string> {
        const data = this.bufferCache.length ? this.bufferCache.shift() : ""
        return {data: data ?? "", isLastChunk: !this.hasNext()};
    }

    private onStreamData = (chunk: any) => {
        try {
            if (chunk instanceof String) {
                this.bufferCache.push(chunk as string)
            } else {
                const buffer = chunk as Buffer
                this.bufferCache.push(buffer.toString(this.config.encoding ?? 'utf-8'))
            }
            while (this.hasNext()) {
                this.handler?.onChunk && this.handler?.onChunk(this.nextChunk())
            }
        } catch (err) {
            this.handler?.onError && this.handler?.onError(err)
        }
    }

    private onStreamEnd = () => {
        try {
            this.streamCleanUp()
            this.streamEnd = true
            this.handler?.onFinish && this.handler?.onFinish()
        } catch (err) {
            this.handler?.onError && this.handler?.onError(err)
        }
    }

    private streamCleanUp() {
        this.content.removeListener('data', this.onStreamData)
        this.content.removeListener('end', this.onStreamEnd)
        this.content.removeListener('error', this.onStreamError)
    }

    private onStreamError = () => {
        this.handler?.onError && this.handler?.onError(new Error())
    }

    read(handler?: StreamerEventHandler<string>) {
        this.content.on('data', this.onStreamData)
        this.content.on('end', this.onStreamEnd)
        this.content.on('error', this.onStreamError)
        handler && (this.handler = handler)
    }
}


export const stream = (content: string | Readable, config?: StreamerConfig, handler?: StreamerEventHandler<string>) => {
    if (typeof content === 'string') {
        new StringStreamer(content as string, config, handler).read()
        return
    } else {
        new ReadableStreamer(content as Readable, config, handler).read()
        return;
    }
}



