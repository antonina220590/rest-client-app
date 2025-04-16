import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestBodyEditor from './BodyEditor';
import type { RequestBodyEditorProps } from '@/app/interfaces';
import { ToggleGroup } from '@/components/ui/toggle-group';

type MockCodemirrorExtension = { mockExtensionId: string } & Extension;
const mockCodeMirrorOnChange = vi.fn();

vi.mock('@uiw/react-codemirror', () => {
  const mockLineWrappingExtensionObj = {
    id: 'mockLineWrappingExtension',
  } as unknown as Extension;

  return {
    __esModule: true,
    default: vi.fn(
      ({
        value,
        onChange,
        extensions,
        readOnly,
        contentEditable,
      }: {
        value: string;
        onChange: (value: string) => void;
        extensions?: Extension[];
        readOnly?: boolean;
        contentEditable?: boolean;
      }) => {
        mockCodeMirrorOnChange.mockImplementation((e) =>
          onChange(e.target.value)
        );
        return (
          <textarea
            data-testid="mock-codemirror"
            value={value}
            readOnly={readOnly}
            onChange={mockCodeMirrorOnChange}
            data-extensions={JSON.stringify(
              extensions?.map(
                (e) => (e as MockCodemirrorExtension)?.mockExtensionId ?? e
              ) ?? []
            )}
            data-content-editable={String(contentEditable)}
            style={{ height: '100px' }}
          />
        );
      }
    ),
    EditorView: {
      lineWrapping: mockLineWrappingExtensionObj,
    },
  };
});

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => `${key}`,
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  WandSparkles: vi.fn(() => <div data-testid="icon-wand" />),
  Braces: vi.fn(() => <div data-testid="icon-braces" />),
  Type: vi.fn(() => <div data-testid="icon-type" />),
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}));
vi.mock('@/components/ui/toggle-group', () => ({
  ToggleGroup: vi.fn(
    ({ children, 'aria-label': ariaLabel, value, ...props }) => (
      <div role="group" aria-label={ariaLabel} {...props}>
        {children}
      </div>
    )
  ),
  ToggleGroupItem: vi.fn(
    ({ children, 'aria-label': ariaLabel, value, ...props }) => (
      <button
        role="radio"
        aria-checked
        aria-label={ariaLabel}
        data-item-value={value}
        {...props}
      >
        {children}
      </button>
    )
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: vi.fn(({ children }) => <>{children}</>),
  TooltipProvider: vi.fn(({ children }) => <>{children}</>),
  TooltipContent: vi.fn(({ children }) => (
    <div data-testid="mock-tooltip-content">{children}</div>
  )),
  TooltipTrigger: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock('../helpers/prettifier', () => ({
  prettifyJsonInput: vi.fn(),
}));

const mockBaseExtensionObj1 = { id: 'mockBaseExt1' } as unknown as Extension;
const mockBaseExtensionObj2 = { id: 'mockBaseExt2' } as unknown as Extension;
const mockBaseExtensionsArray = [mockBaseExtensionObj1, mockBaseExtensionObj2];
vi.mock('@/app/hooks/useCodeMirrorExtensions', () => ({
  useCodeMirrorExtensions: vi.fn(() => mockBaseExtensionsArray),
}));

import { toast } from 'sonner';
import * as prettifierHelper from '../helpers/prettifier';
import { useCodeMirrorExtensions } from '@/app/hooks/useCodeMirrorExtensions';
import { Extension } from '@codemirror/state';

describe('RequestBodyEditor Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnLanguageChange: ReturnType<typeof vi.fn>;
  let defaultProps: RequestBodyEditorProps;

  const mockToastInfo = toast.info as Mock;
  const mockPrettify = prettifierHelper.prettifyJsonInput as Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useCodeMirrorExtensions).mockReturnValue([
      { id: 'mockBaseExt1' } as unknown as Extension,
      { id: 'mockBaseExt2' } as unknown as Extension,
    ]);

    mockOnChange = vi.fn();
    mockOnLanguageChange = vi.fn();
    defaultProps = {
      value: '',
      onChange: mockOnChange,
      language: 'json',
      onLanguageChange: mockOnLanguageChange,
      readOnly: false,
      showPrettifyButton: true,
      showLanguageSelector: true,
      contentEditable: true,
      lineWrapping: false,
    };
  });

  it('should call prettify helper when Prettify button is clicked for JSON', async () => {
    const user = userEvent.setup();
    const initialValue = '{"a":1,"b":2}';
    render(
      <RequestBodyEditor
        {...defaultProps}
        value={initialValue}
        language="json"
      />
    );

    const prettifyButton = screen.getByRole('button', {
      name: /prettify json/i,
    });
    await user.click(prettifyButton);

    expect(mockPrettify).toHaveBeenCalledTimes(1);
    expect(mockPrettify).toHaveBeenCalledWith(
      expect.objectContaining({
        value: initialValue,
        language: 'json',
        onChange: mockOnChange,
        toast: toast,
        t: expect.any(Function),
      })
    );
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('should disable Prettify button and NOT call helper/toast when language is not JSON', async () => {
    render(<RequestBodyEditor {...defaultProps} language="plaintext" />);

    const prettifyButton = screen.getByRole('button', {
      name: /prettify json/i,
    });
    expect(prettifyButton).toBeDisabled();
    expect(mockPrettify).not.toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('should pass correct initial language to ToggleGroup and set Prettify button state', () => {
    const { rerender } = render(
      <RequestBodyEditor {...defaultProps} language="json" />
    );

    const MockedToggleGroupComponent = vi.mocked(ToggleGroup);
    expect(MockedToggleGroupComponent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'json',
        'aria-label': 'Select Body Language',
      }),
      undefined
    );
    const prettifyButtonJson = screen.getByRole('button', {
      name: /prettify json/i,
    });
    expect(prettifyButtonJson).not.toBeDisabled();
    rerender(<RequestBodyEditor {...defaultProps} language="plaintext" />);
    expect(MockedToggleGroupComponent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'plaintext',
        'aria-label': 'Select Body Language',
      }),
      undefined
    );
    const prettifyButtonPlain = screen.getByRole('button', {
      name: /prettify json/i,
    });
    expect(prettifyButtonPlain).toBeDisabled();
  });
  it('should pass readOnly prop to the CodeMirror editor', () => {
    const { rerender } = render(
      <RequestBodyEditor {...defaultProps} readOnly={true} />
    );

    const editorReadOnly = screen.getByTestId('mock-codemirror');
    expect(editorReadOnly).toHaveAttribute('readonly');
    expect(editorReadOnly).toHaveProperty('readOnly', true);

    rerender(<RequestBodyEditor {...defaultProps} readOnly={false} />);
    const editorNotReadOnly = screen.getByTestId('mock-codemirror');
    expect(editorNotReadOnly).not.toHaveAttribute('readonly');
    expect(editorNotReadOnly).toHaveProperty('readOnly', false);
    expect(editorNotReadOnly).not.toBeDisabled();
  });

  it('should pass contentEditable prop to the CodeMirror editor mock', () => {
    const { rerender } = render(
      <RequestBodyEditor {...defaultProps} contentEditable={true} />
    );
    const editorTrue = screen.getByTestId('mock-codemirror');

    expect(editorTrue).toHaveAttribute('data-content-editable', 'true');
    rerender(<RequestBodyEditor {...defaultProps} contentEditable={false} />);
    const editorFalse = screen.getByTestId('mock-codemirror');
    expect(editorFalse).toHaveAttribute('data-content-editable', 'false');
  });

  it('should handle editor changes and prettify attempt gracefully when onChange prop is not provided', async () => {
    const user = userEvent.setup();
    const initialValue = '{"a":1}';
    const propsWithoutOnChange: RequestBodyEditorProps = {
      value: initialValue,
      language: 'json',
      onLanguageChange: mockOnLanguageChange,
      onChange: undefined,
      readOnly: false,
      showPrettifyButton: true,
      showLanguageSelector: true,
      contentEditable: true,
      lineWrapping: false,
    };

    render(<RequestBodyEditor {...propsWithoutOnChange} />);
    const editor = screen.getByTestId('mock-codemirror');
    const newValue = 'no handler';
    await expect(user.type(editor, newValue)).resolves.toBeUndefined();
    expect(mockCodeMirrorOnChange).toHaveBeenCalled();
    const prettifyButton = screen.getByRole('button', {
      name: /prettify json/i,
    });

    expect(prettifyButton).not.toBeDisabled();
    await user.click(prettifyButton);
    expect(mockPrettify).not.toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
  });
  it('should render tooltip content with correct text', () => {
    render(<RequestBodyEditor {...defaultProps} />);
    const tooltipContents = screen.getAllByTestId('mock-tooltip-content');
    const tooltipTexts = tooltipContents.map((node) =>
      node.textContent?.trim()
    );
    expect(tooltipTexts).toEqual(
      expect.arrayContaining(['JSON', 'text', 'prettify'])
    );

    expect(tooltipTexts).toHaveLength(3);
  });
});
