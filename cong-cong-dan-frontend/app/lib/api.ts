const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ===== Types =====

export interface CitizenFormData {
  hoTen: string;
  soDienThoai: string;
  ngaySinh: string;       // YYYY-MM-DD
  tinhThanh: string;       // Tên tỉnh/thành
  xaPhuong: string;        // Tên xã/phường
  ngayNhapNgu?: string;    // YYYY-MM-DD (không bắt buộc)
  donViCongTac?: string;   // Đơn vị từng công tác (không bắt buộc)
  noiDung: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
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
  noiDung: string;
  maTraCuu: string;
  trangThai: 'moi' | 'dang_xu_ly' | 'da_giai_quyet' | 'tu_choi';
  phanHoi?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ===== API Functions =====

/**
 * Gửi đơn tiếp công dân lên Strapi backend
 * Mã tra cứu (maTraCuu) sẽ được backend tự động sinh
 */
export async function submitCitizenForm(formData: CitizenFormData): Promise<TncdttEntry> {
  const response = await fetch(`${STRAPI_URL}/api/tncdtts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: formData }),
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
 * Tra cứu đơn theo mã tra cứu
 */
export async function lookupByTrackCode(maTraCuu: string): Promise<TncdttEntry | null> {
  const response = await fetch(
    `${STRAPI_URL}/api/tncdtts?filters[maTraCuu][$eq]=${encodeURIComponent(maTraCuu)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Lỗi tra cứu: ${response.status}`);
  }

  const result: StrapiResponse<TncdttEntry[]> = await response.json();

  if (result.data.length === 0) {
    return null;
  }

  return result.data[0];
}

/**
 * Lấy tất cả đơn tiếp công dân (dùng cho trang quản trị / xuất Excel)
 */
export async function fetchAllSubmissions(): Promise<TncdttEntry[]> {
  const response = await fetch(
    `${STRAPI_URL}/api/tncdtts?sort=createdAt:desc&pagination[pageSize]=1000`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
  }

  const result: StrapiResponse<TncdttEntry[]> = await response.json();
  return result.data;
}

/**
 * Lấy chi tiết đơn tiếp công dân theo documentId
 */
export async function fetchSubmissionById(documentId: string): Promise<TncdttEntry> {
  const response = await fetch(`${STRAPI_URL}/api/tncdtts/${documentId}`, {
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
  phanHoi: string
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

