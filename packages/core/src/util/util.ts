import { ReadStream, Stats } from 'fs';
import { fromBuffer, fromFile } from 'file-type';
import { getType as getMimeType } from 'mime';
import { extname } from 'path';
import { Readable, Stream } from 'stream';
import { EFileType } from '../enum';

/**
 * read file type
 * @param stats
 */
export function getType(stats: Stats): EFileType {
  if (stats.isSymbolicLink()) {
    return EFileType.link;
  } else if (stats.isDirectory()) {
    return EFileType.dir;
  } else {
    return EFileType.file;
  }
}

/**
 * get file mimetype by content
 * @param path
 * @param content
 */
export async function guessMimeType(path: string, content?: Buffer): Promise<string | undefined> {
  if (content) {
    const mimetype = await fromBuffer(content);
    if (mimetype) {
      return mimetype.mime;
    }
  }

  const mimetype = await fromFile(path);
  if (mimetype) {
    return mimetype.mime;
  }
  const ext = extname(path);

  if (ext) {
    const mime = getMimeType(ext);
    if (mime) {
      return mime;
    }
  }
  return;
}

/**
 *
 * @param stats
 * @param {number} mask 1、execute; 4、read; 2、write
 */
export function fileHasPermission(stats: Stats, mask: number): boolean {
  return !!(mask & parseInt((stats.mode & 0o1777).toString(8)[0], 10));
}

/**
 * js check variable is stream
 * @param stream
 */
export function isReadableStream(stream: Readable) {
  return (
    stream instanceof Stream &&
    typeof ((stream as any)._read === 'function') &&
    typeof ((stream as any)._readableState === 'object')
  );
}

/**
 * string chunk by length
 * @param {string} str
 * @param {number} length
 * @return {string[]}
 */
export function stringChunk(str: string, length = 1): string[] {
  const len = str.length;
  const ret = [];
  let start = 0;
  while (true) {
    if (start >= len) {
      break;
    }
    const chunked = str.substr(start, length);
    ret.push(chunked);
    start += length;
  }
  return ret;
}

/**
 * parse date from format
 * @param input
 * @param format
 */
export function createDateFromFormat(input: string, format = 'yyyy-mm-dd') {
  const parts: any = input.match(/(\d+)/g),
    fmt: any = {};
  let i = 0;
  // extract date-part indexes from the format
  format.replace(/(yyyy|dd|mm)/g, (part: string) => {
    fmt[part] = i++;
    return part;
  });

  return new Date(parts[fmt['yyyy']], parts[fmt['mm'] as any] - 1, parts[fmt['dd']]);
}

/**
 * check var is numeric
 */
export function isNumeric(mixedVar: string | null | any): boolean {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/is_numeric/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: David
  // improved by: taith
  // bugfixed by: Tim de Koning
  // bugfixed by: WebDevHobo (https://webdevhobo.blogspot.com/)
  // bugfixed by: Brett Zamir (https://brett-zamir.me)
  // bugfixed by: Denis Chenu (https://shnoulle.net)
  //   example 1: is_numeric(186.31)
  //   returns 1: true
  //   example 2: is_numeric('Kevin van Zonneveld')
  //   returns 2: false
  //   example 3: is_numeric(' +186.31e2')
  //   returns 3: true
  //   example 4: is_numeric('')
  //   returns 4: false
  //   example 5: is_numeric([])
  //   returns 5: false
  //   example 6: is_numeric('1 ')
  //   returns 6: false
  const whitespace = [
    ' ',
    '\n',
    '\r',
    '\t',
    '\f',
    '\x0b',
    '\xa0',
    '\u2000',
    '\u2001',
    '\u2002',
    '\u2003',
    '\u2004',
    '\u2005',
    '\u2006',
    '\u2007',
    '\u2008',
    '\u2009',
    '\u200a',
    '\u200b',
    '\u2028',
    '\u2029',
    '\u3000',
  ].join('');

  // @todo: Break this up using many single conditions with early returns
  return (
    (typeof mixedVar === 'number' || (typeof mixedVar === 'string' && whitespace.indexOf(mixedVar.slice(-1)) === -1)) &&
    mixedVar !== '' &&
    !isNaN(mixedVar as any)
  );
}
