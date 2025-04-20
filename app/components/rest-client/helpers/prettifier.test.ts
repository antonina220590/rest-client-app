import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { prettifyJsonInput } from '@/app/components/rest-client/helpers/prettifier';
import type { PrettifyJsonInputOptions } from '@/app/interfaces';
import JSON5 from 'json5';

type MockOnChangeFn = Mock;
type MockToastMethod = Mock;
type MockTranslateFn = Mock;

interface MockToastObject {
  info: MockToastMethod;
  success: MockToastMethod;
  error: MockToastMethod;
}

describe('prettifyJsonInput Helper', () => {
  let mockOnChange: MockOnChangeFn;
  let mockToast: MockToastObject;
  let mockT: MockTranslateFn;
  let defaultOptionsBase: Omit<PrettifyJsonInputOptions, 'value'>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockToast = {
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
    };
    mockT = vi.fn((key: string) => key);
    defaultOptionsBase = {
      language: 'json',
      readOnly: false,
      onChange: mockOnChange,
      toast: mockToast,
      t: mockT,
    };
    vi.clearAllMocks();
  });

  it('should call toast.info and return early if language is not "json"', () => {
    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: '{a: 1}',
      language: 'plaintext',
    };
    const expectedInfoKey = 'Prettify is only available for JSON';
    prettifyJsonInput(options);

    expect(mockT).toHaveBeenCalledWith(expectedInfoKey);
    expect(mockToast.info).toHaveBeenCalledOnce();
    expect(mockToast.info).toHaveBeenCalledWith(expectedInfoKey);
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });
  it('should call toast.info and return early if readOnly is true', () => {
    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: '{"valid": "json"}',
      language: 'json',
      readOnly: true,
    };

    const expectedInfoKey = 'Prettify is only available for JSON';

    prettifyJsonInput(options);
    expect(mockT).toHaveBeenCalledWith(expectedInfoKey);
    expect(mockToast.info).toHaveBeenCalledOnce();
    expect(mockToast.info).toHaveBeenCalledWith(expectedInfoKey);

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('should call onChange with prettified JSON and toast.success for valid unformatted JSON', () => {
    const unformattedJson =
      '{"name":"Test","count":1,"active":true,"items":[1,"two"]}';

    const parsedData = JSON.parse(unformattedJson);
    const expectedFormattedJson = JSON.stringify(parsedData, null, 2);

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: unformattedJson,
    };
    const expectedSuccessKey = 'JSON prettified successfully';

    prettifyJsonInput(options);
    expect(mockOnChange).toHaveBeenCalledOnce();
    expect(mockOnChange).toHaveBeenCalledWith(expectedFormattedJson);
    expect(mockT).toHaveBeenCalledWith(expectedSuccessKey);
    expect(mockToast.success).toHaveBeenCalledOnce();
    expect(mockToast.success).toHaveBeenCalledWith(expectedSuccessKey);
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('should call onChange with valid JSON representing the parsed data (JSON5 input)', () => {
    const json5String = "{key: 'value', list: [1, 2,],}";
    const expectedJsObject = { key: 'value', list: [1, 2] };
    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: json5String,
    };
    const expectedSuccessKey = 'JSON prettified successfully';
    prettifyJsonInput(options);
    expect(mockOnChange).toHaveBeenCalledOnce();
    const receivedString = mockOnChange.mock.calls[0][0];
    let receivedObject: unknown;
    try {
      receivedObject = JSON.parse(receivedString);
    } catch (e) {
      throw new Error(
        `onChange received invalid JSON: ${receivedString}. Error: ${e}`
      );
    }
    expect(receivedObject).toEqual(expectedJsObject);
    expect(mockT).toHaveBeenCalledWith(expectedSuccessKey);
    expect(mockToast.success).toHaveBeenCalledOnce();
    expect(mockToast.success).toHaveBeenCalledWith(expectedSuccessKey);
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });
  it('should call toast.info with "already prettified" message if JSON input matches formatted output', () => {
    const data = { id: 1, values: ['a', 'b'] };
    const alreadyPrettifiedJsonInput = JSON.stringify(data, null, 2);

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: alreadyPrettifiedJsonInput,
    };
    const expectedInfoKey = 'JSON is already prettified';

    prettifyJsonInput(options);

    expect(mockT).toHaveBeenCalledWith(expectedInfoKey);
    expect(mockToast.info).toHaveBeenCalledOnce();
    expect(mockToast.info).toHaveBeenCalledWith(expectedInfoKey);

    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });
  it('should call toast.error with "Invalid Syntax" if input is not valid JSON or JSON5', () => {
    const invalidJsonString = '{"key": "value",}invalid';

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: invalidJsonString,
    };
    const expectedErrorKey = 'Invalid Syntax';
    let expectedDescription = 'Cannot parse JSON/JSON5.';
    try {
      JSON5.parse(invalidJsonString);
    } catch (e) {
      if (e instanceof Error) {
        expectedDescription = e.message;
      }
    }
    prettifyJsonInput(options);

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockT).toHaveBeenCalledWith(expectedErrorKey);
    expect(mockToast.error).toHaveBeenCalledOnce();
    expect(mockToast.error).toHaveBeenCalledWith(expectedErrorKey, {
      description: expectedDescription,
    });

    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should call toast.error if JSON.stringify fails (e.g., circular reference)', () => {
    const validJsonInput = '{"a": 1}';
    const circularData: { name: string; myself?: unknown } = {
      name: 'circular',
    };
    circularData.myself = circularData;

    const parseSpy = vi.spyOn(JSON, 'parse').mockReturnValueOnce(circularData);

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: validJsonInput,
    };
    const expectedErrorKey = 'Error formatting data';
    let expectedDescription: string | undefined;
    try {
      JSON.stringify(circularData);
    } catch (e) {
      if (e instanceof Error) expectedDescription = e.message;
    }

    prettifyJsonInput(options);

    expect(parseSpy).toHaveBeenCalledOnce();
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledOnce();
    expect(mockToast.error).toHaveBeenCalledWith(expectedErrorKey, {
      description: expectedDescription,
    });
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle non-Error exceptions during stringify', () => {
    const validJsonInput = '{"a": 1}';
    const dataToParse = { key: 'value' };
    const stringError = 'Stringify Failed!';

    const parseSpy = vi.spyOn(JSON, 'parse').mockReturnValueOnce(dataToParse);
    const stringifySpy = vi
      .spyOn(JSON, 'stringify')
      .mockImplementationOnce(() => {
        throw stringError;
      });

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: validJsonInput,
    };
    const expectedErrorKey = 'Error formatting data';

    prettifyJsonInput(options);

    expect(parseSpy).toHaveBeenCalledOnce();
    expect(stringifySpy).toHaveBeenCalledOnce();
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledOnce();
    expect(mockToast.error).toHaveBeenCalledWith(expectedErrorKey, {
      description: undefined,
    });
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle non-Error exceptions during JSON5 parsing', () => {
    const invalidJsonString = 'invalid';
    const parseErrorString = 'JSON5 Failed!';
    const parseSpy = vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error('Standard JSON parse failed');
    });
    const json5Spy = vi.spyOn(JSON5, 'parse').mockImplementationOnce(() => {
      throw parseErrorString;
    });

    const options: PrettifyJsonInputOptions = {
      ...defaultOptionsBase,
      value: invalidJsonString,
    };
    const expectedErrorKey = 'Invalid Syntax';
    const expectedDescription = 'Cannot parse JSON/JSON5.';

    prettifyJsonInput(options);

    expect(parseSpy).toHaveBeenCalledOnce();
    expect(json5Spy).toHaveBeenCalledOnce();
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledOnce();
    expect(mockToast.error).toHaveBeenCalledWith(expectedErrorKey, {
      description: expectedDescription,
    });
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });
});
