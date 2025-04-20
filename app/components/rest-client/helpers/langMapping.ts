type GeneratedCodeMirrorLanguage =
  | 'shell'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'plaintext';

export function mapSelectedLangToCm(lang: string): GeneratedCodeMirrorLanguage {
  const lowerLang = lang.toLowerCase();

  if (lowerLang.includes('curl')) {
    return 'shell';
  } else if (
    lowerLang.includes('javascript') ||
    lowerLang.includes('fetch') ||
    lowerLang.includes('xhr') ||
    lowerLang.includes('nodejs')
  ) {
    return 'javascript';
  } else if (lowerLang.includes('python')) {
    return 'python';
  } else if (lowerLang.includes('java')) {
    return 'java';
  } else if (lowerLang.includes('c#')) {
    return 'csharp';
  } else if (lowerLang.includes('go')) {
    return 'go';
  } else {
    return 'plaintext';
  }
}
