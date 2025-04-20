import JSON5 from 'json5';
import { PrettifyJsonInputOptions } from '@/app/interfaces';

export const prettifyJsonInput = ({
  value,
  language,
  readOnly,
  onChange,
  toast,
  t,
}: PrettifyJsonInputOptions): void => {
  if (language !== 'json' || readOnly) {
    toast.info(t('Prettify is only available for JSON'));
    return;
  }

  let parsedData: unknown = null;

  try {
    parsedData = JSON.parse(value);
  } catch {
    try {
      parsedData = JSON5.parse(value);
    } catch (errorJson5) {
      toast.error(t('Invalid Syntax'), {
        description:
          errorJson5 instanceof Error
            ? errorJson5.message
            : 'Cannot parse JSON/JSON5.',
      });
      return;
    }
  }
  try {
    const pretty = JSON.stringify(parsedData, null, 2);

    if (pretty !== value) {
      onChange(pretty);
      toast.success(t('JSON prettified successfully'));
    } else {
      toast.info(t('JSON is already prettified'));
    }
  } catch (stringifyError) {
    toast.error(t('Error formatting data'), {
      description:
        stringifyError instanceof Error ? stringifyError.message : undefined,
    });
  }
};
