import { describe, it, expect } from 'vitest';
import { mapSelectedLangToCm } from './langMapping';

describe('mapSelectedLangToCm Helper', () => {
  it('should map variations of "curl" to "shell"', () => {
    const inputCurlLower = 'curl';
    const inputCurlUpper = 'CURL';
    const inputCurlMixed = 'Get cURL command';
    const expectedOutput = 'shell';

    const resultLower = mapSelectedLangToCm(inputCurlLower);
    const resultUpper = mapSelectedLangToCm(inputCurlUpper);
    const resultMixed = mapSelectedLangToCm(inputCurlMixed);
    expect(resultLower).toBe(expectedOutput);
    expect(resultUpper).toBe(expectedOutput);
    expect(resultMixed).toBe(expectedOutput);
  });
  it('should map variations of javascript keywords (fetch, xhr, nodejs) to "javascript"', () => {
    const inputsToTest = [
      'JavaScript - Fetch',
      'JavaScript - XHR',
      'NodeJS',
      'javascript',
      'fetch example',
      'xhr request',
      'My NodeJS Script',
      'JAVASCRIPT',
    ];
    const expectedOutput = 'javascript';
    inputsToTest.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
  });
  it('should map variations of "python" to "python"', () => {
    const inputsToTest = ['Python', 'My python code', 'PYTHON'];
    const expectedOutput = 'python';

    inputsToTest.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
  });
  it('should map variations of "java" to "java"', () => {
    const inputsToTest = ['Java', 'Some java code', 'JAVA Snippet'];
    const expectedOutput = 'java';

    inputsToTest.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
  });
  it('should map variations of "c#" to "csharp"', () => {
    const inputsToTest = ['C#', 'Some C# code', 'basic c# example'];
    const expectedOutput = 'csharp';
    inputsToTest.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
  });
  it('should map variations of "go" to "go"', () => {
    const inputsToTest = ['Go', 'Generate Go Code', 'my go program'];
    const expectedOutput = 'go';

    inputsToTest.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
  });
  it('should map any other input string to "plaintext"', () => {
    const inputsToCheckDefault = [
      'Some Random String',
      'XML',
      'PHP',
      '',
      'just text',
    ];
    const expectedOutput = 'plaintext';
    inputsToCheckDefault.forEach((input) => {
      const result = mapSelectedLangToCm(input);
      expect(result, `Input: "${input}"`).toBe(expectedOutput);
    });
    expect(mapSelectedLangToCm('curl command')).not.toBe(expectedOutput);
    expect(mapSelectedLangToCm('fetch data')).not.toBe(expectedOutput);
    expect(mapSelectedLangToCm('python code')).not.toBe(expectedOutput);
  });
});
