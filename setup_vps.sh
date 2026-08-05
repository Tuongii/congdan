#!/bin/bash
# Script setup VPS - Chạy script này SAU KHI đã upload code
# SSH vào VPS rồi chạy: bash /var/www/phongtiepdantructruyen/setup_vps.sh

set -e

echo "========================================"
echo "  SETUP VPS - Cong Cong Dan"
echo "========================================"

PROJECT_DIR="/var/www/phongtiepdantructruyen"
DOMAIN="phongtiepdantructruyen-qk2.top"

# ====== BƯỚC 1: Cài đặt Backend (Strapi) ======
echo ""
echo "[1/5] Cai dat Backend (Strapi)..."
cd $PROJECT_DIR/backend
cp .env.production .env
npm install
NODE_ENV=production npm run build
echo "  Backend OK!"

# ====== BƯỚC 2: Cài đặt Frontend (Next.js) ======
echo ""
echo "[2/5] Cai dat Frontend (Next.js)..."
cd $PROJECT_DIR/frontend
cp .env.production .env.local
npm install
NEXT_PUBLIC_STRAPI_URL=https://api.phongtiepdantructruyen-qk2.top NEXT_PUBLIC_ADMIN_USERNAME=admin NEXT_PUBLIC_ADMIN_PASSWORD=admin@qk2 npm run build
echo "  Frontend OK!"

# ====== BƯỚC 3: Khởi động với PM2 ======
echo ""
echo "[3/5] Khoi dong ung dung voi PM2..."

# Dừng processes cũ nếu có
pm2 delete all 2>/dev/null || true

# Khởi động Strapi (port 1337)
cd $PROJECT_DIR/backend
pm2 start npm --name "strapi-backend" -- run start

# Khởi động Next.js (port 3000)
cd $PROJECT_DIR/frontend
pm2 start npm --name "nextjs-frontend" -- run start

# Lưu PM2 config
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "  PM2 OK!"

# ====== BƯỚC 4: Cấu hình Nginx ======
echo ""
echo "[4/5] Cau hinh Nginx..."

cat > /etc/nginx/sites-available/phongtiepdantructruyen << 'NGINX_CONF'
# Frontend - phongtiepdantructruyen-qk2.top
server {
    listen 80;
    server_name phongtiepdantructruyen-qk2.top www.phongtiepdantructruyen-qk2.top;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.phongtiepdantructruyen-qk2.top
server {
    listen 80;
    server_name api.phongtiepdantructruyen-qk2.top;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONF

# Kích hoạt cấu hình
ln -sf /etc/nginx/sites-available/phongtiepdantructruyen /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Kiểm tra và reload nginx
nginx -t
systemctl reload nginx

echo "  Nginx OK!"

# ====== BƯỚC 5: Kiểm tra ======
echo ""
echo "[5/5] Kiem tra trang thai..."
echo ""
pm2 status
echo ""
echo "========================================"
echo "  SETUP HOAN TAT!"
echo "========================================"
echo ""
echo "Website: http://$DOMAIN"
echo "API:     http://api.$DOMAIN"
echo "Admin:   http://api.$DOMAIN/admin"
echo ""
echo "Buoc tiep theo:"
echo "  1. Cap nhat DNS tro ve IP 180.93.42.245"
echo "  2. Doi DNS cap nhat (5-30 phut)"
echo "  3. Cai SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN"
echo ""
