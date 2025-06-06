const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Encode(str: string): string {
	// Convert string to UTF-8 bytes
	const bytes: number[] = [];
	for (let i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		if (code < 0x80) {
			bytes.push(code);
		} else if (code < 0x800) {
			bytes.push(0xc0 | (code >> 6));
			bytes.push(0x80 | (code & 0x3f));
		} else if (code < 0x10000) {
			bytes.push(0xe0 | (code >> 12));
			bytes.push(0x80 | ((code >> 6) & 0x3f));
			bytes.push(0x80 | (code & 0x3f));
		}
	}

	let encoded = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const b1 = bytes[i];
		const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
		const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

		const triplet = (b1 << 16) | (b2 << 8) | b3;

		encoded += chars[(triplet >> 18) & 0x3f];
		encoded += chars[(triplet >> 12) & 0x3f];
		encoded += i + 1 < bytes.length ? chars[(triplet >> 6) & 0x3f] : '=';
		encoded += i + 2 < bytes.length ? chars[triplet & 0x3f] : '=';
	}

	return encoded;
}

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
