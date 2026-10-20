
const express = require('express');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DANH SÁCH NGÂN HÀNG: TÊN, VIẾT TẮT, BIN
// ==========================================
const BANKS = [
    { bin: '970415', names: ['ICB', 'VietinBank', 'Vietin Bank', 'Ngân hàng Công thương Việt Nam'] },
    { bin: '970436', names: ['VCB', 'Vietcombank', 'Vietcom Bank', 'Ngân hàng Ngoại thương Việt Nam'] },
    { bin: '970418', names: ['BIDV', 'Ngân hàng Đầu tư và Phát triển Việt Nam'] },
    { bin: '970405', names: ['VBA', 'Agribank', 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam'] },
    { bin: '970448', names: ['OCB', 'Orient Commercial Bank', 'Ngân hàng Phương Đông'] },
    { bin: '970422', names: ['MB', 'MBBank', 'MB Bank', 'Military Bank', 'Ngân hàng Quân đội'] },
    { bin: '970407', names: ['TCB', 'Techcombank', 'Techcom Bank', 'Ngân hàng Kỹ thương Việt Nam'] },
    { bin: '970416', names: ['ACB', 'Asia Commercial Bank', 'Ngân hàng Á Châu'] },
    { bin: '970432', names: ['VPB', 'VPBank', 'VP Bank', 'Ngân hàng Việt Nam Thịnh Vượng'] },
    { bin: '970423', names: ['TPB', 'TPBank', 'TP Bank', 'Ngân hàng Tiên Phong'] },
    { bin: '970403', names: ['STB', 'Sacombank', 'Sac om Bank', 'Ngân hàng Sài Gòn Thương Tín'] },
    { bin: '970437', names: ['HDB', 'HDBank', 'HD Bank', 'Ngân hàng Phát triển Thành phố Hồ Chí Minh'] },
    { bin: '970454', names: ['VCCB', 'VietCapitalBank', 'BVBank', 'Ngân hàng Bản Việt'] },
    { bin: '970429', names: ['SCB', 'Saigon Commercial Bank', 'Ngân hàng Sài Gòn'] },
    { bin: '970441', names: ['VIB', 'Vietnam International Bank', 'Ngân hàng Quốc tế'] },
    { bin: '970443', names: ['SHB', 'Saigon Hanoi Bank', 'Ngân hàng Sài Gòn - Hà Nội'] },
    { bin: '970431', names: ['EIB', 'Eximbank', 'Export Import Bank', 'Ngân hàng Xuất nhập khẩu Việt Nam'] },
    { bin: '970426', names: ['MSB', 'Maritime Bank', 'Ngân hàng Hàng hải Việt Nam'] },
    { bin: '546034', names: ['CAKE'] },
    { bin: '546035', names: ['UBANK', 'Ubank', 'U Bank'] },
    { bin: '963388', names: ['TIMO', 'Timo'] },
    { bin: '971005', names: ['VTLMONEY', 'Viettel Money'] },
    { bin: '971011', names: ['VNPTMONEY', 'VNPT Money'] },
    { bin: '970400', names: ['SGICB', 'Saigon Bank', 'Saigonbank', 'Ngân hàng Sài Gòn Công Thương'] },
    { bin: '970409', names: ['BAB', 'BacABank', 'Bắc Á Bank', 'Ngân hàng Bắc Á'] },
    { bin: '970412', names: ['PVCB', 'PVcomBank', 'PVcom Bank'] },
    { bin: '970414', names: ['MBV', 'MBV Bank'] },
    { bin: '970419', names: ['NCB', 'National Citizen Bank', 'Ngân hàng Quốc Dân'] },
    { bin: '970424', names: ['SHBVN', 'ShinhanBank', 'Shinhan Bank', 'Ngân hàng Shinhan Việt Nam'] },
    { bin: '970425', names: ['ABB', 'ABBANK', 'AB Bank', 'Ngân hàng An Bình'] },
    { bin: '970427', names: ['VAB', 'VietABank', 'Viet A Bank', 'Ngân hàng Việt Á'] },
    { bin: '970428', names: ['NAB', 'NamABank', 'Nam A Bank', 'Ngân hàng Nam Á'] },
    { bin: '970430', names: ['PGB', 'PGBank', 'Petrolimex Bank', 'Ngân hàng Xăng dầu Petrolimex'] },
    { bin: '970433', names: ['VIETBANK', 'VietBank', 'Ngân hàng Việt Nam Thương Tín'] },
    { bin: '970438', names: ['BVB', 'BaoVietBank', 'Bao Viet Bank', 'Ngân hàng Bảo Việt'] },
    { bin: '970440', names: ['SEAB', 'SeABank', 'South East Asia Bank', 'Ngân hàng Đông Nam Á'] },
    { bin: '970446', names: ['COOPBANK', 'Co-op Bank', 'Ngân hàng Hợp tác xã Việt Nam'] },
    { bin: '970449', names: ['LPB', 'LPBank', 'LienVietPostBank', 'Lien Viet Post Bank', 'Ngân hàng Bưu điện Liên Việt'] },
    { bin: '970452', names: ['KLB', 'KienLongBank', 'Kien Long Bank', 'Ngân hàng Kiên Long'] },
    { bin: '668888', names: ['KBANK', 'KBank', 'Kasikornbank'] },
    { bin: '970462', names: ['KBHN'] },
    { bin: '970466', names: ['KEBHANAHCM', 'KEB Hana HCM'] },
    { bin: '970467', names: ['KEBHANAHN', 'KEB Hana HN'] },
    { bin: '977777', names: ['MAFC'] },
    { bin: '533948', names: ['CITIBANK', 'Citi Bank', 'Citi'] },
    { bin: '970463', names: ['KBHCM'] },
    { bin: '999888', names: ['VBSP', 'Ngân hàng Chính sách xã hội'] },
    { bin: '970457', names: ['WVN', 'Woori', 'Woori Bank'] },
    { bin: '970421', names: ['VRB', 'Vietnam Russia Bank', 'Ngân hàng Liên doanh Việt Nga'] },
    { bin: '970458', names: ['UOB', 'United Overseas Bank'] },
    { bin: '970410', names: ['SCVN', 'Standard Chartered Vietnam', 'Standard Chartered'] },
    { bin: '970439', names: ['PBVN', 'Public Bank Vietnam', 'Public Bank'] },
    { bin: '801011', names: ['NHB HN', 'NHBHN', 'Ngân hàng NongHyup Hà Nội'] },
    { bin: '970434', names: ['IVB', 'Indovina Bank'] },
    { bin: '970456', names: ['IBK - HCM', 'IBK HCM', 'IBKHCM', 'Industrial Bank of Korea HCM'] },
    { bin: '970455', names: ['IBK - HN', 'IBK HN', 'IBKHN', 'Industrial Bank of Korea Hanoi'] },
    { bin: '458761', names: ['HSBC'] },
    { bin: '970442', names: ['HLBVN', 'Hong Leong Bank Vietnam', 'Hong Leong Bank'] },
    { bin: '970408', names: ['GPB', 'GPBank', 'Global Petro Bank'] },
    { bin: '970406', names: ['VIKKI', 'Vikki Bank', 'Vikki'] },
    { bin: '796500', names: ['DBS', 'DBS Bank'] },
    { bin: '422589', names: ['CIMB', 'CIMB Bank'] },
    { bin: '970444', names: ['CBB', 'CBBank', 'Ngân hàng Xây dựng'] }
];

// Chuẩn hóa: không phân biệt hoa/thường, dấu tiếng Việt,
// khoảng trắng, dấu gạch nối và dấu câu.
function normalizeBankName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

// Tạo bảng tra cứu từ tất cả bí danh.
const BANK_MAPPING = Object.create(null);
const VALID_BANK_BINS = new Set();

for (const bank of BANKS) {
    VALID_BANK_BINS.add(bank.bin);

    // Cho phép nhập trực tiếp mã BIN.
    BANK_MAPPING[bank.bin] = bank.bin;

    // Cho phép nhập tên viết tắt hoặc tên đầy đủ.
    for (const name of bank.names) {
        BANK_MAPPING[normalizeBankName(name)] = bank.bin;
    }
}

// ==========================================
// HÀM XỬ LÝ UTF-8
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
        } else if (
            (c & 0xFC00) === 0xD800 &&
            i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xFC00) === 0xDC00
        ) {
            c = 0x10000 +
                ((c & 0x03FF) << 10) +
                (str.charCodeAt(++i) & 0x03FF);

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

// ==========================================
// CRC16 CCITT-FALSE
// ==========================================
const CRC_TABLE = (() => {
    const table = new Array(256);

    for (let i = 0; i < 256; i++) {
        let crc = 0;
        let c = i << 8;

        for (let j = 0; j < 8; j++) {
            if ((crc ^ c) & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }

            c <<= 1;
        }

        table[i] = crc & 0xFFFF;
    }

    return table;
})();

function crc_ccitt_ffff(str) {
    const bytes = stringToUtf8ByteArray(str);
    let crc = 0xFFFF;

    for (const byte of bytes) {
        crc = ((crc << 8) ^
            CRC_TABLE[((crc >> 8) ^ byte) & 0xFF]) & 0xFFFF;
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ==========================================
// BỎ DẤU TIẾNG VIỆT TRONG NỘI DUNG CHUYỂN TIỀN
// ==========================================
function removeVietnameseDiacritics(str) {
    if (!str) return '';

    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9\s.,]/g, '') // Chỉ giữ lại chữ, số, khoảng trắng, dấu . và ,
        .trim()                          // Xóa khoảng trắng thừa ở đầu và cuối
        .substring(0, 50);               // Cắt chuỗi tối đa 50 ký tự
}

// ==========================================
// API TẠO ẢNH VIETQR
// GET /api/qr?bank=VCB&account=0123456789
// ==========================================
app.get('/api/qr', async (req, res) => {
    try {
        const inputBank = String(req.query.bank || '').trim();
        const accountNumber = String(req.query.account || '').trim();
        const amount = String(req.query.amount || '0').trim();
        const description = String(req.query.desc || '').trim();

        if (!inputBank || !accountNumber) {
            return res.status(400).send(
                'Thiếu thông tin ngân hàng (bank) hoặc số tài khoản (account)!'
            );
        }

        // Nhận diện BIN, tên viết tắt hoặc tên đầy đủ.
        const normalizedBank = normalizeBankName(inputBank);
        const bankBin = BANK_MAPPING[normalizedBank];

        if (!bankBin || !VALID_BANK_BINS.has(bankBin)) {
            return res.status(400).send(
                'Ngân hàng không hợp lệ hoặc chưa được hỗ trợ. ' +
                'Vui lòng nhập tên ngân hàng, mã viết tắt hoặc mã BIN hợp lệ.'
            );
        }

        if (!/^\d+$/.test(accountNumber)) {
            return res.status(400).send(
                'Số tài khoản chỉ được chứa chữ số.'
            );
        }

        if (amount !== '' && !/^\d+$/.test(amount)) {
            return res.status(400).send(
                'Số tiền phải là số nguyên không âm.'
            );
        }

        const sotien = amount || '0';
        const noidung = removeVietnameseDiacritics(description);

        if (sotien !== '0' && Number(sotien) > 0 &&
            sotien.length > 99) {
            return res.status(400).send('Số tiền không hợp lệ.');
        }

        if (noidung.length > 95) {
            return res.status(400).send(
                'Nội dung chuyển tiền quá dài.'
            );
        }

        // 1. Thông tin định danh Napas.
        const tag00 = '0010A000000727';

        // 2. Thông tin tài khoản nhận tiền.
        const subAcc =
            `0006${bankBin}01` +
            `${accountNumber.length.toString().padStart(2, '0')}` +
            accountNumber;

        const tag01 =
            `01${subAcc.length.toString().padStart(2, '0')}` +
            `${subAcc}0208QRIBFTTA`;

        // 3. Tag 38.
        const merchantInfo = tag00 + tag01;
        const tag38 =
            `38${merchantInfo.length.toString().padStart(2, '0')}` +
            merchantInfo;

        // 4. Ghép dữ liệu QR.
        let chuoi1 = '000201010212';
        chuoi1 += tag38;
        chuoi1 += '5303704';

        if (Number(sotien) > 0) {
            chuoi1 +=
                `54${sotien.length.toString().padStart(2, '0')}` +
                sotien;
        }

        chuoi1 += '5802VN';

        if (noidung) {
            const tag62Sub =
                `08${noidung.length.toString().padStart(2, '0')}` +
                noidung;

            chuoi1 +=
                `62${tag62Sub.length.toString().padStart(2, '0')}` +
                tag62Sub;
        }

        chuoi1 += '6304';

        const crc = crc_ccitt_ffff(chuoi1);
        const qrDataFinal = chuoi1 + crc;

        // 5. Tạo ảnh PNG.
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
        res.setHeader('Cache-Control', 'no-store');
        res.send(qrBuffer);

    } catch (error) {
        console.error('Lỗi tạo VietQR:', error);
        res.status(500).send('Lỗi server khi tạo mã QR');
    }
});

app.listen(PORT, () => {
    console.log(`VietQR Server đang chạy tại cổng ${PORT}`);
});
