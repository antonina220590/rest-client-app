import { describe, it, expect } from 'vitest';

import {
  decodeFromBase64Url,
  encodeToBase64Url,
} from '@/app/components/rest-client/helpers/encoding';

describe('Encoding Helpers', () => {
  describe('encodeToBase64Url', () => {
    it('should correctly encode a simple ASCII string to URL-safe Base64', () => {
      const inputString = 'hello world';
      const expectedOutput = 'aGVsbG8gd29ybGQ';
      const result = encodeToBase64Url(inputString);
      expect(result).toBe(expectedOutput);
    });
    it('should replace +, / and remove trailing = padding for URL safety', () => {
      const inputString = 'any string here';
      const mockBtoaOutput = 'f+j/Qw==';
      const expectedUrlSafeOutput = 'f-j_Qw';
      const btoaSpy = vi
        .spyOn(globalThis, 'btoa')
        .mockReturnValueOnce(mockBtoaOutput);
      const result = encodeToBase64Url(inputString);
      expect(btoaSpy).toHaveBeenCalled();
      expect(result).toBe(expectedUrlSafeOutput);
      btoaSpy.mockRestore();
    });
    it('should correctly remove double padding ==', () => {
      const inputProducingDoublePadding = 'base';
      const expected = 'YmFzZQ';
      expect(encodeToBase64Url(inputProducingDoublePadding)).toBe(expected);
    });
    it('should correctly remove single padding =', () => {
      const inputProducingSinglePadding = 'base6';
      const expected = 'YmFzZTY';
      expect(encodeToBase64Url(inputProducingSinglePadding)).toBe(expected);
    });
    it('should return an empty string when encoding an empty string', () => {
      const inputString = '';
      const expectedOutput = '';
      const result = encodeToBase64Url(inputString);
      expect(result).toBe(expectedOutput);
    });
    it('should return an empty string if an error occurs during encoding (triggering catch block)', () => {
      const inputString = 'trigger error';
      const expectedOutput = '';
      const btoaSpy = vi
        .spyOn(globalThis, 'btoa')
        .mockImplementationOnce(() => {
          throw new Error('Simulated Error in btoa');
        });

      const result = encodeToBase64Url(inputString);
      expect(btoaSpy).toHaveBeenCalled();
      expect(result).toBe(expectedOutput);
      btoaSpy.mockRestore();
    });
  });

  describe('decodeFromBase64Url', () => {
    it('should correctly decode a simple URL-safe Base64 string to ASCII', () => {
      const inputBase64Url = 'aGVsbG8gd29ybGQ';
      const expectedOutput = 'hello world';
      const result = decodeFromBase64Url(inputBase64Url);
      expect(result).toBe(expectedOutput);
    });
    it('should correctly decode strings with URL-safe characters - and _', () => {
      const inputCyrillicEncoded = '0L_RgNC40LLQtdGC';
      const expectedCyrillicDecoded = 'привет';

      const inputSpecialChars = '-_-_';
      const expectedSpecialCharsDecoded = '\uFFFD\uFFFD\uFFFD';

      const resultCyrillic = decodeFromBase64Url(inputCyrillicEncoded);
      const resultSpecial = decodeFromBase64Url(inputSpecialChars);

      expect(resultCyrillic).toBe(expectedCyrillicDecoded);
      expect(resultSpecial).toBe(expectedSpecialCharsDecoded);
    });
    it('should return an empty string for invalid Base64 input (triggering catch block)', () => {
      const invalidInput1 = 'aGVsbG8gd29ybGQ!';
      const invalidInput2 = 'YWF=YQ==';
      const invalidInput3 = 'Y W F';
      const result1 = decodeFromBase64Url(invalidInput1);
      const result2 = decodeFromBase64Url(invalidInput2);
      const result3 = decodeFromBase64Url(invalidInput3);
      expect(result1).toBe('');
      expect(result2).toBe('');
      expect(result3).toBe('');
    });
  });
});
