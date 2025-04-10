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

  const rawQuery = params
    .filter((p) => p.key)
    .map((p) => `${p.key}=${p.value}`)
    .join('&');

  return rawQuery ? `${baseUrlString}?${rawQuery}` : baseUrlString;
};

export const decodeTemplate = (str: string): string =>
  str.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');
