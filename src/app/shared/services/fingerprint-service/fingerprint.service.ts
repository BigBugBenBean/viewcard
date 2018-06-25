/**
 * @author James
 * @since
 * @copyright pccw
 */
import {MsksService} from '../../msks';
import {Injectable} from '@angular/core';
import {ConfirmComponent} from '../../sc2-confirm';

@Injectable()
export class FingerprintService {
    fingerprintInfo = '1313213213';
    base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    base64DecodeChars = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];
    toBase64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    base64Pad = '=';
    toBinaryTable = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    ];
    constructor(private service: MsksService) {}

    /**
     * get fingerprint data fun.
     */
    getFingerprintData() {
        console.log('start call function : getFingerprintData');
    }

    /**
     *  start scanner fingerprint
     */
    startFingerprintScanner(fingerprintCode: ConfirmComponent, fingerprintInfo: string) {
        console.log('call : startFingerprintScanner fun.')
        this.service.sendRequest('RR_FPSCANNERREG', 'takephoto', {'icno': 'A123456'}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('fingerprint operate success');
                fingerprintInfo = resp.fpdata;
                fingerprintCode.show();
                setTimeout(() => {
                    fingerprintCode.hide();
                }, 1000)
            }
        });
    }

    /**
     *  stop scanner fingerprint
     */
    stopFingerprintScanner() {
        console.log('call : stopFingerprintScanner fun.')
        this.service.sendRequest('RR_FPSCANNERREG', 'stopscan', {'icno': 'A123456'}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('fingerprint scanner stop success');

            }
        });
    }

/*
    utf16to8(str) {
        let out, i, len, c;
        out = '';
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    utf8to16(str) {
        let out, i, len, c;
        let char2, char3;

        out = '';
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
                case 12: case 13:
                // 110x xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
                case 14:
                    // 1110 xxxx 10xx xxxx 10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }

    base64encode(str: string) {
        let out, i, len;
        let c1, c2, c3;

        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i === len) {
                out += this.base64EncodeChars.charAt(c1 >> 2);
                out += this.base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += '==';
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i === len) {
                out += this.base64EncodeChars.charAt(c1 >> 2);
                out += this.base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += this.base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += '===';
                break;
            }
            c3 = str.charCodeAt(i++);
            out += this.base64EncodeChars.charAt(c1 >> 2);
            out += this.base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += this.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += this.base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    base64decode(str) {
        let c1, c2, c3, c4;
        let i, len, out;
        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            /!* c1 *!/
            do {
                c1 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 === -1) {
                if (c1 === -1) {
                    break;
                }
            }
            /!* c2 *!/
            do {
                c2 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 === -1) {
                if (c2 === -1) {
                    break;
                }
                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
            }
            /!* c3 *!/
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 === 61) {
                    return out;
                }
                c3 = this.base64DecodeChars[c3];
            } while (i < len && c3 === -1);
            if (c3 === -1) {
                break;
            }
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
            /!* c4 *!/
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 === 61) {
                    return out;
                }
                c4 = this.base64DecodeChars[c4];

            } while (i < len && c4 === -1) {
                if (c4 === -1) {
                    break;
                }
            }
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }*/

    /** Convert data (an array of integers) to a Base64 string. */

/*    toBase64(data) {
        let result = '';
        const length = data.length;
        let i;
        // Convert every three bytes to 4 ascii characters.

        for (i = 0; i < (length - 2); i += 3) {
            result += this.toBase64Table[ data.charCodeAt(i) >> 2];
            result += this.toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i + 1) >> 4)];
            result += this.toBase64Table[((data.charCodeAt(i + 1) & 0x0f) << 2) + (data.charCodeAt(i + 2) >> 6)];
            result += this.toBase64Table[data.charCodeAt(i + 2) & 0x3f];
        }

        // Convert the remaining 1 or 2 bytes, pad out to 4 characters.

        if (length % 3) {
            i = length - (length % 3);
            result += this.toBase64Table[data.charCodeAt(i) >> 2];
            if ((length % 3) === 2) {
                result += this.toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i + 1) >> 4)];
                result += this.toBase64Table[(data.charCodeAt(i + 1) & 0x0f) << 2];
                result += this.base64Pad;
            } else {
                result += this.toBase64Table[(data.charCodeAt(i) & 0x03) << 4];
                result += this.base64Pad + this.base64Pad;
            }
        }
        return result;
    }

    /!** Convert Base64 data to a string *!/

    base64ToString(data) {
        let result = '';
        // number of bits decoded, but yet to be appended
        let leftbits = 0;
        // bits decoded, but yet to be appended
        let leftdata = 0;
        // Convert one by one.
        for (let i = 0; i < data.length; i++) {
            const c = this.toBinaryTable[data.charCodeAt(i) & 0x7f];
            const padding = (data.charCodeAt(i) === this.base64Pad.charCodeAt(0));
            // Skip illegal characters and whitespace
            if (c === -1) {
                continue;
            }
            // Collect data into leftdata, update bitcount
            leftdata = (leftdata << 6) | c;
            leftbits += 6;

            // If we have 8 or more bits, append 8 bits to the result
            if (leftbits >= 8) {
                leftbits -= 8;
                // Append if not padding.
                if (!padding)
                    result += String.fromCharCode((leftdata >> leftbits) & 0xff);
                leftdata &= (1 << leftbits) - 1;
            }

        }
        // If there are any bits left, the base64 string was corrupted
        if (leftbits) {
          console.log('exception!');
        }
        return result;
    }*/

    // toBase64() 将字符串转换为base64
    // base64ToString()  将base64 转换为字符串
}
