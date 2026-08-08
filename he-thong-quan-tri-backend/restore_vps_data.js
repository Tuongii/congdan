const Database = require('better-sqlite3');
const path = require('path');

// Target database path
const dbPath = path.join(__dirname, '.tmp/data.db');
console.log(`📡 Đang kết nối tới cơ sở dữ liệu: ${dbPath}`);

const db = new Database(dbPath);

function randomDocId() {
  const crypto = require('crypto');
  return crypto.randomBytes(12).toString('hex');
}

const records = [
  {
    maTraCuu: 'QK2-3392',
    hoTen: 'Lê Mạnh Hùng',
    soDienThoai: '0956123456',
    ngaySinh: '2026-01-07',
    tinhThanh: 'Tỉnh Lào Cai',
    xaPhuong: 'Xã Bát Xát',
    ngayNhapNgu: null,
    donViCongTac: null,
    tieuDe: 'ktyktk',
    noiDung: 'ktyktk',
    loaiYeuCau: 'kien_nghi_phan_anh',
    trangThai: 'moi',
    createdAt: '2026-07-06T07:03:16.398Z'
  },
  {
    maTraCuu: 'QK2-2006',
    hoTen: 'Nguyễn Văn B',
    soDienThoai: '0367515806',
    ngaySinh: '2025-10-02',
    tinhThanh: 'Tỉnh Sơn La',
    xaPhuong: 'Xã Chiềng La',
    ngayNhapNgu: null,
    donViCongTac: null,
    tieuDe: 'dâcc',
    noiDung: 'dâcc',
    loaiYeuCau: 'kien_nghi_phan_anh',
    trangThai: 'moi',
    createdAt: '2026-07-06T07:10:22.670Z'
  },
  {
    maTraCuu: 'QK2-6627',
    hoTen: 'Lê Mạnh Hùng',
    soDienThoai: '0368241313',
    ngaySinh: '2026-07-10',
    tinhThanh: 'Tỉnh Lào Cai',
    xaPhuong: 'Xã Y Tý',
    ngayNhapNgu: '2026-07-02',
    donViCongTac: 'Sư đoàn 316 Quân khu 2',
    tieuDe: 'Xác nhận',
    noiDung: 'Xác nhận thông tin quá trình công tác',
    loaiYeuCau: 'xac_nhan_cong_tac',
    trangThai: 'moi',
    createdAt: '2026-07-10T03:25:19.368Z'
  },
  {
    maTraCuu: 'QK2-2095',
    hoTen: 'Lê Mạnh Hùng',
    soDienThoai: '0367515806',
    ngaySinh: '2025-02-05',
    tinhThanh: 'Tỉnh Phú Thọ',
    xaPhuong: 'Phường Hòa Bình',
    ngayNhapNgu: null,
    donViCongTac: null,
    tieuDe: 'xác nhận quá trình công tác phục vụ tại ngũ tại đơn vị',
    noiDung: 'xác nhận quá trình công tác phục vụ tại ngũ tại đơn vị',
    loaiYeuCau: 'xac_nhan_cong_tac',
    trangThai: 'moi',
    createdAt: '2026-07-18T07:36:47.919Z'
  },
  {
    maTraCuu: 'QK2-4554',
    hoTen: 'Nguyễn Xuân Trường',
    soDienThoai: '0912345567',
    ngaySinh: '1966-12-21',
    tinhThanh: 'Tỉnh Lai Châu',
    xaPhuong: 'Phường Tân Phong',
    ngayNhapNgu: null,
    donViCongTac: 'Sư đoàn 304',
    tieuDe: 'Đề nghị xác nhận quá trình công tác của cán bộ trong thời gian phục vụ tại ngũ',
    noiDung: 'Đề nghị xác nhận quá trình công tác của cán bộ trong thời gian phục vụ tại ngũ',
    loaiYeuCau: 'xac_nhan_cong_tac',
    trangThai: 'moi',
    createdAt: '2026-08-04T08:52:16.132Z'
  },
  {
    maTraCuu: 'QK2-1853',
    hoTen: 'Nguyễn Văn An',
    soDienThoai: '0368241313',
    ngaySinh: '2026-06-03',
    tinhThanh: 'Tỉnh Lào Cai',
    xaPhuong: 'Phường Lào Cai',
    ngayNhapNgu: null,
    donViCongTac: null,
    tieuDe: 'xác nhận quá trình công tác tài liệu bằng chứng giấy tờ đính kèm',
    noiDung: 'xác nhận quá trình công tác tài liệu bằng chứng giấy tờ đính kèm',
    loaiYeuCau: 'xac_nhan_cong_tac',
    trangThai: 'moi',
    createdAt: '2026-08-04T09:39:39.152Z'
  },
  {
    maTraCuu: 'QK2-6782',
    hoTen: 'Trần Văn Bách',
    soDienThoai: '0367515806',
    ngaySinh: '2019-03-05',
    tinhThanh: 'Tỉnh Sơn La',
    xaPhuong: 'Xã Mường Giôn',
    ngayNhapNgu: null,
    donViCongTac: null,
    tieuDe: 'xác nhận quá trình công tác',
    noiDung: 'xác nhận quá trình công tác',
    loaiYeuCau: 'xac_nhan_cong_tac',
    trangThai: 'moi',
    createdAt: '2026-08-04T12:57:56.679Z'
  }
];

const checkStmt = db.prepare('SELECT id FROM tncdtts WHERE ma_tra_cuu = ?');
const updateStmt = db.prepare('UPDATE tncdtts SET so_dien_thoai = ? WHERE ma_tra_cuu = ?');
const insertStmt = db.prepare(`
  INSERT INTO tncdtts (
    document_id, created_at, updated_at, published_at,
    ho_ten, so_dien_thoai, ngay_sinh, tinh_thanh, xa_phuong,
    ngay_nhap_ngu, don_vi_cong_tac, tieu_de, noi_dung,
    ma_tra_cuu, trang_thai, loai_yeu_cau
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let updatedCount = 0;
let insertedCount = 0;

for (const item of records) {
  const existing = checkStmt.get(item.maTraCuu);
  if (existing) {
    updateStmt.run(item.soDienThoai, item.maTraCuu);
    console.log(`🔄 Đã sửa số điện thoại chuẩn (${item.soDienThoai}) cho mã ${item.maTraCuu}`);
    updatedCount++;
  } else {
    insertStmt.run(
      randomDocId(),
      item.createdAt,
      item.createdAt,
      item.createdAt,
      item.hoTen,
      item.soDienThoai,
      item.ngaySinh,
      item.tinhThanh,
      item.xaPhuong,
      item.ngayNhapNgu,
      item.donViCongTac,
      item.tieuDe,
      item.noiDung,
      item.maTraCuu,
      item.trangThai,
      item.loaiYeuCau
    );
    console.log(`✅ Thêm thành công mã ${item.maTraCuu} với SĐT ${item.soDienThoai}`);
    insertedCount++;
  }
}

console.log(`\n🎉 HOÀN TẤT! Đã cập nhật SĐT: ${updatedCount} đơn | Đã thêm mới: ${insertedCount} đơn.`);
