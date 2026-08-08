const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '.tmp/data.db');
const db = new Database(dbPath);

function randomDocId() {
  const crypto = require('crypto');
  return crypto.randomBytes(12).toString('hex');
}

const now = new Date().toISOString();

// Danh sách các file thực tế đã upload trong public/uploads trên VPS
const mediaFiles = [
  { name: 'Quyet_dinh_so_62_ngay_09_11_2011_cee7e4685c.doc', hash: 'Quyet_dinh_so_62_ngay_09_11_2011_cee7e4685c', ext: '.doc', mime: 'application/msword', size: 68096, url: '/uploads/Quyet_dinh_so_62_ngay_09_11_2011_cee7e4685c.doc' },
  { name: 'Thong_tu_95_ve_tiep_cong_dan_5b85335aec.pdf', hash: 'Thong_tu_95_ve_tiep_cong_dan_5b85335aec', ext: '.pdf', mime: 'application/pdf', size: 1076845, url: '/uploads/Thong_tu_95_ve_tiep_cong_dan_5b85335aec.pdf' },
  { name: 'luat_nvqs_2015_0955a5d4ef.pdf', hash: 'luat_nvqs_2015_0955a5d4ef', ext: '.pdf', mime: 'application/pdf', size: 1697418, url: '/uploads/luat_nvqs_2015_0955a5d4ef.pdf' },
  { name: '154_ndcp_signed_140a46af5d.pdf', hash: '154_ndcp_signed_140a46af5d', ext: '.pdf', mime: 'application/pdf', size: 1415651, url: '/uploads/154_ndcp_signed_140a46af5d.pdf' },
  { name: 'luat136_2025_719b9cad6e.pdf', hash: 'luat136_2025_719b9cad6e', ext: '.pdf', mime: 'application/pdf', size: 3519170, url: '/uploads/luat136_2025_719b9cad6e.pdf' },
  { name: 'anh_500_1f29c94883.jpg', hash: 'anh_500_1f29c94883', ext: '.jpg', mime: 'image/jpeg', size: 107686, url: '/uploads/anh_500_1f29c94883.jpg' },
  { name: 'image_a38143a288.png', hash: 'image_a38143a288', ext: '.png', mime: 'image/png', size: 349266, url: '/uploads/image_a38143a288.png' }
];

console.log('📡 Đang liên kết danh sách file media trong public/uploads vào database...');
const checkFile = db.prepare('SELECT id FROM files WHERE url = ?');
const insertFile = db.prepare(`
  INSERT INTO files (document_id, name, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, locale)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, 'vi')
`);

const fileMap = {};

for (const file of mediaFiles) {
  let existing = checkFile.get(file.url);
  if (!existing) {
    const docId = randomDocId();
    const info = insertFile.run(docId, file.name, file.hash, file.ext, file.mime, file.size, file.url, now, now, now);
    fileMap[file.hash] = info.lastInsertRowid;
    console.log(`✅ Đã liên kết file: ${file.name} (id: ${info.lastInsertRowid})`);
  } else {
    fileMap[file.hash] = existing.id;
    console.log(`ℹ️ File đã có sẵn: ${file.name} (id: ${existing.id})`);
  }
}

// 1. Khôi phục Văn bản pháp quy
const vanBanRecords = [
  {
    tieuDe: 'Quyết định 62/2011/QĐ-TTg về chế độ, chính sách đối với đối tượng tham gia chiến tranh bảo vệ Tổ quốc',
    trichYeu: 'Quy định chế độ, chính sách đối với đối tượng tham gia chiến tranh bảo vệ Tổ quốc, làm nhiệm vụ quốc tế ở Campuchia, giúp bạn Lào sau ngày 30/4/1975 đã phục viên, xuất ngũ, thôi việc.',
    ngayBanHanh: '2011-11-09',
    hieuLuc: 'Còn hiệu lực',
    loaiVanBan: 'phap_ly',
    fileHash: 'Quyet_dinh_so_62_ngay_09_11_2011_cee7e4685c'
  },
  {
    tieuDe: 'Thông tư 95/2021/TT-BQP quy định về tiếp công dân trong Bộ Quốc phòng',
    trichYeu: 'Quy định trách nhiệm, trình tự, thủ tục tiếp công dân, xử lý đơn thư khiếu nại, tố cáo, kiến nghị, phản ánh trong Bộ Quốc phòng.',
    ngayBanHanh: '2021-08-05',
    hieuLuc: 'Còn hiệu lực',
    loaiVanBan: 'huong_dan',
    fileHash: 'Thong_tu_95_ve_tiep_cong_dan_5b85335aec'
  },
  {
    tieuDe: 'Luật Nghĩa vụ quân sự số 84/2015/QH13',
    trichYeu: 'Luật Nghĩa vụ quân sự quy định về nghĩa vụ quân sự; chế độ phục vụ và chế độ, chính sách đối với hạ sĩ quan, binh sĩ phục viên.',
    ngayBanHanh: '2015-06-25',
    hieuLuc: 'Còn hiệu lực',
    loaiVanBan: 'phap_ly',
    fileHash: 'luat_nvqs_2015_0955a5d4ef'
  },
  {
    tieuDe: 'Nghị định 154/2020/NĐ-CP sửa đổi, bổ sung một số điều về chính sách quân nhân',
    trichYeu: 'Nghị định quy định chi tiết về tinh giản biên chế, giải quyết chế độ chính sách đối với quân nhân, công chức quốc phòng.',
    ngayBanHanh: '2020-12-31',
    hieuLuc: 'Còn hiệu lực',
    loaiVanBan: 'phap_ly',
    fileHash: '154_ndcp_signed_140a46af5d'
  },
  {
    tieuDe: 'Luật số 136/2025/QH15 về lực lượng dự bị động viên và công tác quân sự địa phương',
    trichYeu: 'Quy định về đăng ký, quản lý, huấn luyện lực lượng dự bị động viên và bảo đảm chế độ chính sách cho quân nhân dự bị.',
    ngayBanHanh: '2025-01-15',
    hieuLuc: 'Còn hiệu lực',
    loaiVanBan: 'phap_ly',
    fileHash: 'luat136_2025_719b9cad6e'
  }
];

console.log('\n📜 Đang khôi phục danh sách Văn bản pháp quy...');
const checkVB = db.prepare('SELECT id FROM van_ban_phap_quys WHERE tieu_de = ?');
const insertVB = db.prepare(`
  INSERT INTO van_ban_phap_quys (document_id, tieu_de, trich_yeu, ngay_ban_hanh, hieu_luc, loai_van_ban, created_at, updated_at, published_at, locale)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'vi')
`);
const insertMorph = db.prepare(`
  INSERT INTO files_related_morphs (file_id, related_id, related_type, field, order)
  VALUES (?, ?, ?, ?, 1)
`);

for (const vb of vanBanRecords) {
  let existing = checkVB.get(vb.tieuDe);
  let vbId;
  if (!existing) {
    const docId = randomDocId();
    const info = insertVB.run(docId, vb.tieuDe, vb.trichYeu, vb.ngayBanHanh, vb.hieuLuc, vb.loaiVanBan, now, now, now);
    vbId = info.lastInsertRowid;
    console.log(`✅ Khôi phục Văn bản: ${vb.tieuDe} (id: ${vbId})`);
  } else {
    vbId = existing.id;
    console.log(`ℹ️ Văn bản đã có sẵn: ${vb.tieuDe}`);
  }

  const fileId = fileMap[vb.fileHash];
  if (fileId && vbId) {
    try {
      insertMorph.run(fileId, vbId, 'api::van-ban-phap-quy.van-ban-phap-quy', 'tepVanBan');
      console.log(`   🔗 Gắn file đính kèm ID ${fileId} vào Văn bản ID ${vbId}`);
    } catch (e) {}
  }
}

// 2. Khôi phục Tin nổi bật
const tinNoiBatRecords = [
  {
    tieuDe: 'Cơ quan Thanh tra Quân khu 2 đẩy mạnh công tác tiếp công dân và giải quyết đơn thư kiến nghị',
    moTa: 'Quân khu 2 tập trung nâng cao chất lượng tiếp nhận, xử lý đơn thư phản ánh, giải quyết kịp thời chế độ chính sách cho quân nhân và nhân dân trên địa bàn.',
    ngayDang: '21/07/2026',
    fileHash: 'anh_500_1f29c94883'
  },
  {
    tieuDe: 'Hướng dẫn công tác tư vấn tuyển quân, tuyển sinh quân sự và thực hiện nghĩa vụ quân sự năm 2026',
    moTa: 'Bộ Tư lệnh Quân khu 2 chỉ đạo các đơn vị tổ chức tuyên truyền, tư vấn tuyển sinh quân sự, giải quyết thắc mắc về tiêu chuẩn và chế độ cho thanh niên nhập ngũ.',
    ngayDang: '04/08/2026',
    fileHash: 'image_a38143a288'
  }
];

console.log('\n📰 Đang khôi phục danh sách Tin nổi bật...');
const checkTin = db.prepare('SELECT id FROM tin_noi_bats WHERE tieu_de = ?');
const insertTin = db.prepare(`
  INSERT INTO tin_noi_bats (document_id, tieu_de, mo_ta, ngay_dang, created_at, updated_at, published_at, locale)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'vi')
`);

for (const tin of tinNoiBatRecords) {
  let existing = checkTin.get(tin.tieuDe);
  let tinId;
  if (!existing) {
    const docId = randomDocId();
    const info = insertTin.run(docId, tin.tieuDe, tin.moTa, tin.ngayDang, now, now, now);
    tinId = info.lastInsertRowid;
    console.log(`✅ Khôi phục Tin nổi bật: ${tin.tieuDe} (id: ${tinId})`);
  } else {
    tinId = existing.id;
    console.log(`ℹ️ Tin nổi bật đã có sẵn: ${tin.tieuDe}`);
  }

  const fileId = fileMap[tin.fileHash];
  if (fileId && tinId) {
    try {
      insertMorph.run(fileId, tinId, 'api::tin-noi-bat.tin-noi-bat', 'hinhAnh');
      console.log(`   🔗 Gắn hình ảnh ID ${fileId} vào Tin nổi bật ID ${tinId}`);
    } catch (e) {}
  }
}

console.log('\n🎉 HOÀN TẤT KHÔI PHỤC TOÀN BỘ VĂN BẢN PHÁP QUY & TIN NỔI BẬT!');
