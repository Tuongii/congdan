const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '.tmp', 'data.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

const actions = [
  'api::van-ban-phap-quy.van-ban-phap-quy.find',
  'api::van-ban-phap-quy.van-ban-phap-quy.findOne',
  'api::van-ban-phap-quy.van-ban-phap-quy.create',
  'api::van-ban-phap-quy.van-ban-phap-quy.update',
  'api::van-ban-phap-quy.van-ban-phap-quy.delete',
  'api::van-ban-phap-quy.van-ban-phap-quy.publish',
  'plugin::upload.content-api.upload'
];

try {
  // Dọn dẹp quyền cũ bị đặt sai tên
  db.prepare(`
    DELETE FROM up_permissions_role_lnk 
    WHERE permission_id IN (SELECT id FROM up_permissions WHERE action = 'plugin::upload.upload')
  `).run();
  db.prepare(`
    DELETE FROM up_permissions WHERE action = 'plugin::upload.upload'
  `).run();

  // Bắt đầu một giao dịch (transaction) để đảm bảo dữ liệu toàn vẹn
  const insertPermission = db.prepare(`
    INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLink = db.prepare(`
    INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord)
    VALUES (?, ?, ?)
  `);

  const now = Date.now();

  for (const action of actions) {
    // Kiểm tra xem permission đã tồn tại chưa
    const existing = db.prepare('SELECT id FROM up_permissions WHERE action = ?').get(action);
    let permId;

    if (existing) {
      permId = existing.id;
      console.log(`Quyền '${action}' đã tồn tại với ID ${permId}`);
    } else {
      // Sinh một UUID/document_id ngẫu nhiên 24 kí tự
      const docId = crypto.randomBytes(12).toString('hex');
      const info = insertPermission.run(docId, action, now, now, now);
      permId = info.lastInsertRowid;
      console.log(`Đã thêm quyền '${action}' với ID ${permId}`);
    }

    // Kiểm tra xem liên kết quyền này với Public role (ID = 2) đã có chưa
    const existingLink = db.prepare('SELECT id FROM up_permissions_role_lnk WHERE permission_id = ? AND role_id = 2').get(permId);
    if (existingLink) {
      console.log(`Liên kết quyền ${permId} với role Public đã có sẵn.`);
    } else {
      // Đếm số lượng liên kết hiện tại của Public role để lấy vị trí xếp tiếp theo (ord)
      const count = db.prepare('SELECT COUNT(*) as cnt FROM up_permissions_role_lnk WHERE role_id = 2').get().cnt;
      const nextOrd = parseFloat(count + 1);
      
      insertLink.run(permId, 2, nextOrd);
      console.log(`Đã liên kết quyền ${permId} với role Public.`);
    }
  }

  console.log('Cấu hình quyền bảo mật hoàn thành thành công!');
} catch (err) {
  console.error('Lỗi cấu hình database:', err);
} finally {
  db.close();
}
