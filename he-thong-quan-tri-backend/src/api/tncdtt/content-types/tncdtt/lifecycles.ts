import { encrypt, decrypt } from './helpers/crypto';

const SENSITIVE_FIELDS = ['soDienThoai', 'soCCCD', 'guiHo_soDienThoai', 'guiHo_soCCCD'];

function encryptFields(data: any) {
  if (!data) return;
  for (const field of SENSITIVE_FIELDS) {
    if (data[field]) {
      const encryptedValue = encrypt(data[field]);
      if (encryptedValue) {
        data[field] = encryptedValue;
      }
    }
  }
}

function decryptFields(result: any) {
  if (!result) return;
  for (const field of SENSITIVE_FIELDS) {
    if (result[field]) {
      const decryptedValue = decrypt(result[field]);
      if (decryptedValue) {
        result[field] = decryptedValue;
      }
    }
  }
}

export default {
  beforeCreate(event: any) {
    encryptFields(event.params.data);
  },
  beforeUpdate(event: any) {
    encryptFields(event.params.data);
  },
  afterFindOne(event: any) {
    decryptFields(event.result);
  },
  afterFindMany(event: any) {
    const { result } = event;
    if (Array.isArray(result)) {
      result.forEach(decryptFields);
    }
  }
};
