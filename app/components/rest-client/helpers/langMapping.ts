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

  switch (lowerLang) {
    case 'curl':
      return 'shell';
    case 'javascript':
    case 'fetch':
    case 'xhr':
    case 'nodejs':
      return 'javascript';
    case 'python':
      return 'python';
    case 'java':
      return 'java';
    case 'c#':
      return 'csharp';
    case 'go':
      return 'go';
    default:
      return 'plaintext';
  }
}
