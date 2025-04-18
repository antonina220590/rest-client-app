export const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const copyToClipboardText = (text: string) => {
  navigator.clipboard.writeText(text);
};
