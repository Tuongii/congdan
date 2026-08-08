export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ===== Types =====

export interface CitizenFormData {
  hoTen: string;
  soDienThoai: string;
  ngaySinh: string;       // YYYY-MM-DD
  tinhThanh: string;       // Tên tỉnh/thành
  xaPhuong: string;        // Tên xã/phường
  ngayNhapNgu?: string;    // YYYY-MM-DD (không bắt buộc)
  donViCongTac?: string;   // Đơn vị từng công tác (không bắt buộc)
  loaiYeuCau: 'kien_nghi_phan_anh' | 'che_do_chinh_sach' | 'xac_nhan_cong_tac' | 'dat_lich_hen';
  tieuDe: string;
  noiDung: string;
  taiLieuDinhKem?: File[];  // File đính kèm (frontend only)
  ngayHenMongMuon?: string; // YYYY-MM-DD (chỉ khi đặt lịch)
  gioHenMongMuon?: string;  // HH:mm (chỉ khi đặt lịch)
  hinhThucTiep?: 'truc_tiep' | 'truc_tuyen'; // Chỉ khi đặt lịch
  isGuiHo?: boolean;
  guiHo_hoTen?: string;
  guiHo_soDienThoai?: string;
  guiHo_soCCCD?: string;
  guiHo_diaChi?: string;
  guiHo_quanHe?: string;
  soCCCD?: string;
  soHieuSiQuan?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiMediaItem {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
  ext: string;
}

export interface TncdttEntry {
  id: number;
  documentId: string;
  hoTen: string;
  soDienThoai: string;
  ngaySinh: string;
  tinhThanh: string;
  xaPhuong: string;
  ngayNhapNgu: string | null;
  donViCongTac: string | null;
  loaiYeuCau: 'kien_nghi_phan_anh' | 'che_do_chinh_sach' | 'xac_nhan_cong_tac' | 'dat_lich_hen';
  tieuDe: string;
  noiDung: string;
  taiLieuDinhKem: StrapiMediaItem[] | null;
  ngayHenMongMuon: string | null;
  gioHenMongMuon: string | null;
  hinhThucTiep: 'truc_tiep' | 'truc_tuyen' | null;
  maTraCuu: string;
  trangThai: 'moi' | 'dang_xu_ly' | 'da_giai_quyet' | 'tu_choi';
  phanHoi?: string | null;
  zoomLink?: string | null;
  isGuiHo?: boolean | null;
  guiHo_hoTen?: string | null;
  guiHo_soDienThoai?: string | null;
  guiHo_soCCCD?: string | null;
  guiHo_diaChi?: string | null;
  guiHo_quanHe?: string | null;
  soCCCD?: string | null;
  soHieuSiQuan?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ===== API Functions =====

/**
 * Gửi đơn tiếp công dân lên Strapi backend
 * Sử dụng FormData (multipart) để hỗ trợ upload file đính kèm
 * Mã tra cứu (maTraCuu) sẽ được backend tự động sinh
 */
export async function submitCitizenForm(formData: CitizenFormData): Promise<TncdttEntry> {
  const files = formData.taiLieuDinhKem || [];

  // Tạo object data (loại bỏ trường File[] vì sẽ gửi riêng)
  const dataPayload: Record<string, unknown> = {
    hoTen: formData.hoTen,
    soDienThoai: formData.soDienThoai,
    ngaySinh: formData.ngaySinh,
    tinhThanh: formData.tinhThanh,
    xaPhuong: formData.xaPhuong,
    loaiYeuCau: formData.loaiYeuCau,
    tieuDe: formData.tieuDe,
    noiDung: formData.noiDung,
  };

  if (formData.ngayNhapNgu) dataPayload.ngayNhapNgu = formData.ngayNhapNgu;
  if (formData.donViCongTac) dataPayload.donViCongTac = formData.donViCongTac;
  if (formData.ngayHenMongMuon) dataPayload.ngayHenMongMuon = formData.ngayHenMongMuon;
  if (formData.gioHenMongMuon) dataPayload.gioHenMongMuon = formData.gioHenMongMuon;
  if (formData.hinhThucTiep) dataPayload.hinhThucTiep = formData.hinhThucTiep;
  if (formData.isGuiHo !== undefined) dataPayload.isGuiHo = formData.isGuiHo;
  if (formData.guiHo_hoTen) dataPayload.guiHo_hoTen = formData.guiHo_hoTen;
  if (formData.guiHo_soDienThoai) dataPayload.guiHo_soDienThoai = formData.guiHo_soDienThoai;
  if (formData.guiHo_soCCCD) dataPayload.guiHo_soCCCD = formData.guiHo_soCCCD;
  if (formData.guiHo_diaChi) dataPayload.guiHo_diaChi = formData.guiHo_diaChi;
  if (formData.guiHo_quanHe) dataPayload.guiHo_quanHe = formData.guiHo_quanHe;
  if (formData.soCCCD) dataPayload.soCCCD = formData.soCCCD;
  if (formData.soHieuSiQuan) dataPayload.soHieuSiQuan = formData.soHieuSiQuan;

  // Nếu có file đính kèm → gửi FormData (multipart)
  if (files.length > 0) {
    const fd = new FormData();
    fd.append('data', JSON.stringify(dataPayload));
    files.forEach((file) => {
      fd.append('files.taiLieuDinhKem', file, file.name);
    });

    const response = await fetch(`${STRAPI_URL}/api/tncdtts`, {
      method: 'POST',
      body: fd,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error?.message || `Lỗi server: ${response.status}`;
      throw new Error(message);
    }

    const result: StrapiResponse<TncdttEntry> = await response.json();
    return result.data;
  }

  // Không có file → gửi JSON thuần
  const response = await fetch(`${STRAPI_URL}/api/tncdtts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: dataPayload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `Lỗi server: ${response.status}`;
    throw new Error(message);
  }

  const result: StrapiResponse<TncdttEntry> = await response.json();
  return result.data;
}

/**
 * Tra cứu đơn theo mã tra cứu (Hỗ trợ cả QD- cũ và QK2- mới)
 */
export async function lookupByTrackCode(maTraCuu: string): Promise<TncdttEntry | null> {
  try {
    const searchCode = maTraCuu.trim().toUpperCase();
    let filterQuery = `filters[maTraCuu][$eq]=${encodeURIComponent(searchCode)}`;
    
    // Hỗ trợ tra cứu các đơn cũ lưu mã QD-
    if (searchCode.startsWith('QD-')) {
      const qk2Code = searchCode.replace('QD-', 'QK2-');
      filterQuery = `filters[$or][0][maTraCuu][$eq]=${encodeURIComponent(searchCode)}&filters[$or][1][maTraCuu][$eq]=${encodeURIComponent(qk2Code)}`;
    }

    const response = await fetch(
      `${STRAPI_URL}/api/tncdtts?${filterQuery}&populate=taiLieuDinhKem`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result: StrapiResponse<TncdttEntry[]> = await response.json();

    if (!result.data || result.data.length === 0) {
      return null;
    }

    return result.data[0];
  } catch (error) {
    console.warn(`[API] Kết nối máy chủ tra cứu mã ${maTraCuu} tạm gián đoạn`);
    return null;
  }
}

/**
 * Lấy tất cả đơn tiếp công dân (dùng cho trang quản trị / xuất Excel)
 */
export async function fetchAllSubmissions(): Promise<TncdttEntry[]> {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/tncdtts?sort=createdAt:desc&pagination[pageSize]=1000&populate=taiLieuDinhKem`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const result: StrapiResponse<TncdttEntry[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('[API] Kết nối máy chủ danh sách đơn tạm gián đoạn');
    return [];
  }
}

/**
 * Lấy chi tiết đơn tiếp công dân theo documentId
 */
export async function fetchSubmissionById(documentId: string): Promise<TncdttEntry> {
  const response = await fetch(`${STRAPI_URL}/api/tncdtts/${documentId}?populate=taiLieuDinhKem`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi tải chi tiết đơn: ${response.status}`);
  }

  const result: StrapiResponse<TncdttEntry> = await response.json();
  return result.data;
}

/**
 * Cập nhật trạng thái và phản hồi cho đơn tiếp công dân
 */
export async function updateSubmissionStatusAndReply(
  documentId: string,
  trangThai: 'moi' | 'dang_xu_ly' | 'da_giai_quyet' | 'tu_choi',
  phanHoi: string,
  zoomLink?: string
): Promise<TncdttEntry> {
  const response = await fetch(`${STRAPI_URL}/api/tncdtts/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        trangThai,
        phanHoi,
        zoomLink: zoomLink || null,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `Lỗi cập nhật: ${response.status}`;
    throw new Error(message);
  }

  const result: StrapiResponse<TncdttEntry> = await response.json();
  return result.data;
}

export interface VanBanPhapQuyEntry {
  id: number;
  documentId: string;
  tieuDe: string;
  trichYeu: string;
  ngayBanHanh: string | null;
  hieuLuc: string;
  loaiVanBan: 'phap_ly' | 'huong_dan';
  tepVanBan: StrapiMediaItem;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * Lấy tất cả văn bản pháp quy từ backend
 */
export async function fetchVanBanPhapQuy(): Promise<VanBanPhapQuyEntry[]> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/van-ban-phap-quys?populate=tepVanBan&sort=createdAt:desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const result: StrapiResponse<VanBanPhapQuyEntry[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('[API] Kết nối máy chủ tải văn bản pháp quy tạm gián đoạn');
    return [];
  }
}

/**
 * Tải file lên Media Library của Strapi (Bước 1 của 2-step upload)
 */
export async function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `Lỗi tải file lên Media Library: ${response.status}`;
    throw new Error(message);
  }

  const result = await response.json();
  if (Array.isArray(result) && result.length > 0) {
    return result[0].id;
  }
  throw new Error("Không nhận được thông tin file sau khi upload.");
}

/**
 * Đăng tải thông tin văn bản pháp quy mới (Bước 2 của 2-step upload)
 */
export interface CreateVanBanPayload {
  tieuDe: string;
  trichYeu: string;
  loaiVanBan: 'phap_ly' | 'huong_dan';
  ngayBanHanh: string | null;
  hieuLuc: string;
  tepVanBan: number; // ID của file đã upload
}

export async function createVanBanPhapQuy(payload: CreateVanBanPayload): Promise<VanBanPhapQuyEntry> {
  const response = await fetch(`${STRAPI_URL}/api/van-ban-phap-quys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `Lỗi đăng tải văn bản: ${response.status}`;
    throw new Error(message);
  }

  const result: StrapiResponse<VanBanPhapQuyEntry> = await response.json();
  return result.data;
}

/**
 * Xóa văn bản pháp quy theo documentId
 */
export async function deleteVanBanPhapQuy(documentId: string): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/van-ban-phap-quys/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Lỗi xóa văn bản: ${response.status}`);
  }
}

export interface TinNoiBatEntry {
  id: number;
  documentId: string;
  tieuDe: string;
  moTa: string;
  ngayDang: string | null;
  hinhAnh: StrapiMediaItem;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * Lấy tất cả tin tức nổi bật từ backend
 */
export async function fetchTinNoiBat(): Promise<TinNoiBatEntry[]> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/tin-noi-bats?populate=hinhAnh&sort=createdAt:desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const result: StrapiResponse<TinNoiBatEntry[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('[API] Kết nối máy chủ tải tin nổi bật tạm gián đoạn');
    return [];
  }
}

/**
 * Đăng tải tin tức nổi bật mới
 */
export interface CreateTinNoiBatPayload {
  tieuDe: string;
  moTa: string;
  ngayDang: string | null;
  hinhAnh: number; // ID của hình ảnh đã upload
}

export async function createTinNoiBat(payload: CreateTinNoiBatPayload): Promise<TinNoiBatEntry> {
  const response = await fetch(`${STRAPI_URL}/api/tin-noi-bats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `Lỗi đăng tin nổi bật: ${response.status}`;
    throw new Error(message);
  }

  const result: StrapiResponse<TinNoiBatEntry> = await response.json();
  return result.data;
}

/**
 * Xóa tin nổi bật theo documentId
 */
export async function deleteTinNoiBat(documentId: string): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/tin-noi-bats/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Lỗi xóa tin nổi bật: ${response.status}`);
  }
}


