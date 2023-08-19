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
    }

    hasNext(): boolean {
        return !!this.content;
    }

    protected nextChunk(): ChunkModel<string> {
        const chunkContent = this.content?.substring(0, this.config?.chunkSize)
        this.content = this.content?.substring(this.config?.chunkSize ?? this.content?.length - 1)
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

    private onStreamData = bindFunction((chunk: any) => {
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
    }, this)

    private onStreamEnd = bindFunction(() => {
        try {
            this.streamCleanUp()
            this.streamEnd = true
            this.handler?.onFinish && this.handler?.onFinish()
        } catch (err) {
            this.handler?.onError && this.handler?.onError(err)
        }
    }, this)

    private streamCleanUp() {
        this.content.removeListener('data', this.onStreamData)
        this.content.removeListener('end', this.onStreamEnd)
        this.content.removeListener('error', this.onStreamError)
    }

    private onStreamError = bindFunction(() => {
        this.handler?.onError && this.handler?.onError(new Error())
    }, this)

    read(handler?: StreamerEventHandler<string>) {
        this.content.on('data', this.onStreamData)
        this.content.on('end', this.onStreamEnd)
        this.content.on('error', this.onStreamError)
        handler && (this.handler = handler)
    }
}


export default {
    stringStreamer: (content: string, config?: StreamerConfig, handler?: StreamerEventHandler<string>) => {
        new StringStreamer(content, config, handler).read()
    },
    readableStreamer: (content: Readable, config?: StreamerConfig, handler?: StreamerEventHandler<string>) => {
        new ReadableStreamer(content, config, handler).read()
    },
}


function bindFunction(f: Function, self: any) {
    return function () {
        f.apply(self, arguments);
    };
}

