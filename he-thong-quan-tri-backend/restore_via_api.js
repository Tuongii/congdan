const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337/api/tncdtts';

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
    trangThai: 'moi'
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
    trangThai: 'moi'
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
    trangThai: 'moi'
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
    trangThai: 'moi'
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
    trangThai: 'moi'
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
    trangThai: 'moi'
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
    trangThai: 'moi'
  }
];

async function restoreAll() {
  console.log(`🚀 Bắt đầu khôi phục dữ liệu tới Strapi API: ${STRAPI_API_URL}`);
  let count = 0;

  for (const record of records) {
    try {
      const res = await fetch(STRAPI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: record })
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Khôi phục thành công trên Strapi: ${record.maTraCuu} (documentId: ${data.data?.documentId})`);
        count++;
      } else {
        const errText = await res.text();
        console.error(`❌ Lỗi khôi phục mã ${record.maTraCuu}: ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.error(`❌ Lỗi kết nối khi nạp mã ${record.maTraCuu}:`, err.message);
    }
  }

  console.log(`\n🎉 HOÀN TẤT KHÔI PHỤC TRÊN STRAPI! Đã nạp thành công: ${count} / ${records.length} đơn.`);
}

restoreAll();
