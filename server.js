const express = require('express');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CÁC HÀM XỬ LÝ LOGIC CHUẨN VIETQR & CRC16
// ==========================================
function stringToUtf8ByteArray(str) {
    let out = [], p = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (((c & 0xFC00) == 0xD800) && (i + 1) < str.length && ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
}

function crc_ccitt_ffff(str) {
    const CRC_POLY_CCITT = 0x1021;
    const CRC_START_CCITT_FFFF = 0xFFFF;
    let crc_tabccitt = new Array(256);
    let isInit = false;

    if (!isInit) {
        for (let i = 0; i < 256; i++) {
            let crc = 0;
            let c = i << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc ^ c) & 0x8000) {
                    crc = (crc << 1) ^ CRC_POLY_CCITT;
                } else {
                    crc = crc << 1;
                }
                c = c << 1;
            }
            crc_tabccitt[i] = crc & 0xFFFF;
        }
        isInit = true;
    }

    let b = stringToUtf8ByteArray(str);
    let crc = CRC_START_CCITT_FFFF;
    for (let i = 0; i < b.length; i++) {
        crc = ((crc << 8) ^ crc_tabccitt[((crc >> 8) ^ b[i]) & 0x00FF]) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function removeVietnameseDiacritics(str) {
    if (!str) return "";
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

// ==========================================
// API ENDPOINT TRẢ VỀ ẢNH QR CODE
// ==========================================
app.get('/api/qr', async (req, res) => {
    try {
        const bankBin = req.query.bank;
        const accountNumber = req.query.account;
        const amount = req.query.amount || "0";
        const description = req.query.desc || "";

        if (!bankBin || !accountNumber) {
            return res.status(400).send("Thiếu thông tin mã ngân hàng (bank) hoặc số tài khoản (account)!");
        }

        const stk = accountNumber;
        const noidung = removeVietnameseDiacritics(description);
        const sotien = amount;
        const lenStk = stk.length;
        const lenSotien = sotien.toString().length;
        const lenNoidung = noidung.length;

        // Lắp ráp chuỗi tiêu chuẩn EMVCo VietQR
        let chuoi1 = `00020101021138${lenStk + 44}0010A00000072701${lenStk + 14}0006${bankBin}01${lenStk.toString().padStart(2, '0')}${stk}0208QRIBFTTA5303704`;
        chuoi1 += Number(sotien) > 0 ? `54${lenSotien.toString().padStart(2, '0')}${sotien}` : "";
        chuoi1 += `5802VN62`;
        chuoi1 += noidung ? `${(lenNoidung + 4).toString().padStart(2, '0')}08${lenNoidung.toString().padStart(2, '0')}${noidung}` : "";
        chuoi1 += `6304`;

        // Tính mã CRC cuối chuỗi
        const crc = crc_ccitt_ffff(chuoi1);
        const qrDataFinal = chuoi1 + crc;

        // Sinh ảnh QR dạng Buffer (PNG) và gửi về client (VBA Excel)
        const qrBuffer = await QRCode.toBuffer(qrDataFinal, {
            type: 'png',
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.setHeader('Content-Type', 'image/png');
        res.send(qrBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server khi tạo mã QR");
    }
});

app.listen(PORT, () => {
    console.log(`VietQR Server đang chạy tại cổng ${PORT}`);
});
