const express = require('express');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// BẢNG ÁNH XẠ MÃ NGÂN HÀNG (TEXT -> BIN)
// ==========================================
const BANK_MAPPING = {
    "ICB": "970415",
    "VCB": "970436",
    "BIDV": "970418",
    "VBA": "970405",
    "OCB": "970448",
    "MB": "970422",
    "TCB": "970407",
    "ACB": "970416",
    "VPB": "970432",
    "TPB": "970423",
    "STB": "970403",
    "HDB": "970437",
    "VCCB": "970454",
    "SCB": "970429",
    "VIB": "970441",
    "SHB": "970443",
    "EIB": "970431",
    "MSB": "970426",
    "CAKE": "546034",
    "UBANK": "546035",
    "TIMO": "963388",
    "VTLMONEY": "971005",
    "VNPTMONEY": "971011",
    "SGICB": "970400",
    "BAB": "970409",
    "PVCB": "970412",
    "MBV": "970414",
    "NCB": "970419",
    "SHBVN": "970424",
    "ABB": "970425",
    "VAB": "970427",
    "NAB": "970428",
    "PGB": "970430",
    "VIETBANK": "970433",
    "BVB": "970438",
    "SEAB": "970440",
    "COOPBANK": "970446",
    "LPB": "970449",
    "KLB": "970452",
    "KBANK": "668888",
    "KBHN": "970462",
    "KEBHANAHCM": "970466",
    "KEBHANAHN": "970467",
    "MAFC": "977777",
    "CITIBANK": "533948",
    "KBHCM": "970463",
    "VBSP": "999888",
    "WVN": "970457",
    "VRB": "970421",
    "UOB": "970458",
    "SCVN": "970410",
    "PBVN": "970439",
    "NHB HN": "801011",
    "IVB": "970434",
    "IBK - HCM": "970456",
    "IBK - HN": "970455",
    "HSBC": "458761",
    "HLBVN": "970442",
    "GPB": "970408",
    "VIKKI": "970406",
    "DBS": "796500",
    "CIMB": "422589",
    "CBB": "970444"
};

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
        let inputBank = req.query.bank ? req.query.bank.trim().toUpperCase() : "";
        const accountNumber = req.query.account ? req.query.account.trim() : "";
        const amount = req.query.amount ? req.query.amount.trim() : "0";
        const description = req.query.desc ? req.query.desc.trim() : "";

        if (!inputBank || !accountNumber) {
            return res.status(400).send("Thiếu thông tin ngân hàng (bank) hoặc số tài khoản (account)!");
        }

        // Tự động quy đổi từ mã chữ (VD: TPB) sang mã BIN (VD: 970423). 
        // Nếu người dùng lỡ truyền vào mã BIN số luôn thì server vẫn nhận diện được.
        let bankBin = BANK_MAPPING[inputBank] ? BANK_MAPPING[inputBank] : inputBank;

        const stk = accountNumber;
        const noidung = removeVietnameseDiacritics(description);
        const sotien = amount;

        // Chuẩn hóa cấu trúc VietQR EMVCo
        let merchantInfo = `0010A00000072701${bankBin.length + 14}0006${bankBin}01${stk.length.toString().padStart(2, '0')}${stk}0208QRIBFTTA`;
        let tag38 = `38${(merchantInfo.length).toString().padStart(2, '0')}${merchantInfo}`;

        let chuoi1 = `000201010212`;
        chuoi1 += tag38;
        chuoi1 += `5303704`;
        
        if (Number(sotien) > 0) {
            chuoi1 += `54${sotien.length.toString().padStart(2, '0')}${sotien}`;
        }
        
        chuoi1 += `5802VN`;

        if (noidung) {
            let tag62Sub = `08${noidung.length.toString().padStart(2, '0')}${noidung}`;
            chuoi1 += `62${tag62Sub.length.toString().padStart(2, '0')}${tag62Sub}`;
        }

        chuoi1 += `6304`;

        const crc = crc_ccitt_ffff(chuoi1);
        const qrDataFinal = chuoi1 + crc;

        // Sinh ảnh PNG
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
