export const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const copyToClipboardText = (
  text: string,
  options?: { wrapInBraces?: boolean }
) => {
  const finalText = options?.wrapInBraces ? `{{${text}}}` : text;
  navigator.clipboard.writeText(finalText);
};
