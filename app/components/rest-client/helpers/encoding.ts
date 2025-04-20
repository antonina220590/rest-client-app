export function encodeToBase64Url(str: string): string {
  try {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    let binaryString = '';
    uint8Array.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });

    const base64 = btoa(binaryString);

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeFromBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binaryString = atob(base64);

    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  } catch {
    return '';
  }
}
