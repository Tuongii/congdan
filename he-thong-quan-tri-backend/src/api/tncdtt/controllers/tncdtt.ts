/**
 * tncdtt controller
 * Custom controller to auto-generate tracking code and set default status
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tncdtt.tncdtt', ({ strapi }) => ({
  async create(ctx) {
    // Sinh mã tra cứu unique dạng QD-XXXX
    let maTraCuu: string;
    let isUnique = false;

    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      maTraCuu = `QD-${randomNum}`;

      // Kiểm tra mã đã tồn tại chưa
      const existing = await strapi.documents('api::tncdtt.tncdtt').findMany({
        filters: { maTraCuu: { $eq: maTraCuu } },
      });

      if (existing.length === 0) {
        isUnique = true;
      }
    } while (!isUnique);

    // Gán mã tra cứu và trạng thái mặc định vào dữ liệu request
    const requestBody = ctx.request.body as { data?: Record<string, unknown> };
    if (requestBody.data) {
      requestBody.data.maTraCuu = maTraCuu;
      requestBody.data.trangThai = 'moi';
    } else {
      requestBody.data = {
        maTraCuu,
        trangThai: 'moi',
      };
    }

    // Gọi hàm create mặc định của Strapi
    const response = await super.create(ctx);

    // Tự động publish bản ghi (Strapi v5 draft/publish)
    if (response.data && response.data.documentId) {
      try {
        await strapi.documents('api::tncdtt.tncdtt').publish({
          documentId: response.data.documentId,
        });
      } catch (err) {
        strapi.log.warn('Auto-publish failed:', err);
      }

      // Tự động đồng bộ lên Google Sheets (bất đồng bộ) nếu có cấu hình
      const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;
      if (googleSheetUrl) {
        // Thực thi trong background để không block response trả về cho công dân
        (async () => {
          try {
            const dataToSync = {
              maTraCuu: response.data.maTraCuu,
              hoTen: response.data.hoTen,
              soDienThoai: response.data.soDienThoai,
              ngaySinh: response.data.ngaySinh,
              tinhThanh: response.data.tinhThanh,
              xaPhuong: response.data.xaPhuong,
              ngayNhapNgu: response.data.ngayNhapNgu || '',
              donViCongTac: response.data.donViCongTac || '',
              noiDung: response.data.noiDung,
              trangThai: response.data.trangThai || 'moi',
              createdAt: response.data.createdAt,
            };

            strapi.log.info(`Syncing entry ${dataToSync.maTraCuu} to Google Sheets...`);
            const syncRes = await fetch(googleSheetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dataToSync),
            });

            if (!syncRes.ok) {
              strapi.log.error(`Google Sheets Sync failed with status: ${syncRes.status}`);
            } else {
              const result = await syncRes.json().catch(() => null);
              strapi.log.info(`Google Sheets Sync success: ${JSON.stringify(result)}`);
            }
          } catch (syncErr) {
            strapi.log.error('Error during Google Sheets Sync:', syncErr);
          }
        })();
      }
    }

    return response;
  },
}));

