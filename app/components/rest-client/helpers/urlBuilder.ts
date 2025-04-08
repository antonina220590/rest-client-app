import { KeyValueItem } from '@/app/interfaces';

export const buildUrlWithParams = (
  baseUrlString: string,
  params: KeyValueItem[]
): string => {
  try {
    const urlObject = new URL(baseUrlString);
    baseUrlString = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
  } catch {
    const qIndex = baseUrlString.indexOf('?');
    if (qIndex !== -1) {
      baseUrlString = baseUrlString.substring(0, qIndex);
    }
  }

  const searchParams = new URLSearchParams();
  params.forEach((param) => {
    if (param.key) {
      searchParams.append(param.key, param.value);
    }
  });

  const searchString = searchParams.toString();
  return searchString ? `${baseUrlString}?${searchString}` : baseUrlString;
};
