/* eslint-disable */
export function sha256(input: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  function utf8Encode(string: string) {
    string = string.replace(/\r\n/g, '\n');
    let utfText = '';

    for (let index = 0; index < string.length; index++) {
      const charCode = string.charCodeAt(index);

      if (charCode < 128) {
        utfText += String.fromCharCode(charCode);
      } else if (charCode < 2048) {
        utfText += String.fromCharCode((charCode >> 6) | 192);
        utfText += String.fromCharCode((charCode & 63) | 128);
      } else {
        utfText += String.fromCharCode((charCode >> 12) | 224);
        utfText += String.fromCharCode(((charCode >> 6) & 63) | 128);
        utfText += String.fromCharCode((charCode & 63) | 128);
      }
    }

    return utfText;
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words: number[] = [];
  const hash: number[] = [];
  const roundConstants: number[] = [];
  const isComposite: Record<number, boolean> = {};
  let primeCounter = 0;
  let message = utf8Encode(input);
  const messageBitLength = message.length * 8;

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let index = 0; index < 313; index += candidate) {
        isComposite[index] = true;
      }

      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }

      roundConstants[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  message += '\x80';

  while (message.length % 64 !== 56) {
    message += '\x00';
  }

  for (let index = 0; index < message.length; index++) {
    words[index >> 2] |= message.charCodeAt(index) << ((3 - (index % 4)) * 8);
  }

  words[words.length] = (messageBitLength / maxWord) | 0;
  words[words.length] = messageBitLength;

  for (let chunkStart = 0; chunkStart < words.length; chunkStart += 16) {
    const workingHash = hash.slice(0, 8);
    const schedule = words.slice(chunkStart, chunkStart + 16);

    for (let round = 16; round < 64; round++) {
      const word15 = schedule[round - 15];
      const word2 = schedule[round - 2];
      const sigma0 = rightRotate(word15, 7) ^ rightRotate(word15, 18) ^ (word15 >>> 3);
      const sigma1 = rightRotate(word2, 17) ^ rightRotate(word2, 19) ^ (word2 >>> 10);

      schedule[round] = (schedule[round - 16] + sigma0 + schedule[round - 7] + sigma1) | 0;
    }

    for (let round = 0; round < 64; round++) {
      const a = workingHash[0];
      const b = workingHash[1];
      const c = workingHash[2];
      const d = workingHash[3];
      const e = workingHash[4];
      const f = workingHash[5];
      const g = workingHash[6];
      const h = workingHash[7];
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const choose = (e & f) ^ (~e & g);
      const temp1 = (h + sigma1 + choose + roundConstants[round] + schedule[round]) | 0;
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + majority) | 0;

      workingHash[7] = g;
      workingHash[6] = f;
      workingHash[5] = e;
      workingHash[4] = (d + temp1) | 0;
      workingHash[3] = c;
      workingHash[2] = b;
      workingHash[1] = a;
      workingHash[0] = (temp1 + temp2) | 0;
    }

    for (let index = 0; index < 8; index++) {
      hash[index] = (hash[index] + workingHash[index]) | 0;
    }
  }

  return hash
    .map(value => (value >>> 0).toString(16).padStart(8, '0'))
    .join('');
}
