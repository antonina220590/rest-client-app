import { Variable } from '@/app/interfaces';

export const interpolateVariables = (
  text: string,
  variables: Variable[]
): string => {
  if (!text || typeof text !== 'string') return text;

  return variables.reduce((result, variable) => {
    const pattern = new RegExp(`\\{\\{\\s*${variable.key}\\s*\\}\\}`, 'g');
    return result.replace(pattern, variable.value);
  }, text);
};
