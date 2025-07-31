const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Decode(str: string): string {
	// Remove any padding
	str = str.replace(/=+$/, '');
	let bytes: number[] = [];
	for (let i = 0; i < str.length; i += 4) {
		const n =
			(chars.indexOf(str[i]) << 18) |
			(chars.indexOf(str[i + 1]) << 12) |
			((i + 2 < str.length ? chars.indexOf(str[i + 2]) : 0) << 6) |
			(i + 3 < str.length ? chars.indexOf(str[i + 3]) : 0);
		bytes.push((n >> 16) & 0xff);
		if (str[i + 2] && str[i + 2] !== '=') bytes.push((n >> 8) & 0xff);
		if (str[i + 3] && str[i + 3] !== '=') bytes.push(n & 0xff);
	}
	// Convert UTF-8 bytes back to string
	let out = '';
	for (let i = 0; i < bytes.length; ) {
		const b1 = bytes[i++];
		if (b1 < 0x80) {
			out += String.fromCharCode(b1);
		} else if (b1 >= 0xc0 && b1 < 0xe0) {
			const b2 = bytes[i++];
			out += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
		} else if (b1 >= 0xe0 && b1 < 0xf0) {
			const b2 = bytes[i++];
			const b3 = bytes[i++];
			out += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
		}
	}
	return out;
}
