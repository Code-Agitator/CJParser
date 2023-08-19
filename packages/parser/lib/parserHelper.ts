

export const ONE_MB = 1024 * 1024

/**
 * 猜测文本中换行符
 * @param content 猜测文本
 */
export function guessLineEndingCharFromCsv(content: string) {
    content = content.substring(0, ONE_MB)

    const rSplit = content.split('\r');
    const nSplit = content.split('\n');

    const isRExist = rSplit.length > 1;
    if (!isRExist) {
        return '\n'
    }

    const isNExist = nSplit.length > 1;
    const isNAppearsFirst = (isNExist && nSplit[0].length < rSplit[0].length);
    if (isNAppearsFirst) {
        return '\n';
    }

    let nrMathCounter = 0;
    for (let i = 0; i < rSplit.length; i++) {
        if (rSplit[i][0] === '\n')
            nrMathCounter++;
    }
    // \r\n 匹配数大于 \r的一半就说明 \r\n是分隔符
    return nrMathCounter > rSplit.length / 2 ? '\r\n' : '\r';
}


export const DELIMITERS_FOR_GUESS = [',', ';', '|', ' ', '\t']
export const DEFAULT_DELIMITERS = ","
/**
 * 猜测文本中的分隔符
 * @param content 猜测文本
 */
export function guessDelimiterFromCsv(content: string) {
    content = content.substring(0, ONE_MB)
    const delimiters = DELIMITERS_FOR_GUESS;
    let bestGuess = DEFAULT_DELIMITERS;
    let bestConfidence = 0;

    for (const delimiter of delimiters) {
        let count = 0;
        for (const char of content) {
            if (char === delimiter) {
                count++;
            }
        }

        const confidence = count / content.length;
        if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestGuess = delimiter;
        }
    }

    return bestGuess;
}