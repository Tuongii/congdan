# Upload code lên VPS
# Chạy script này trong PowerShell trên máy local

$VPS_IP = "180.93.42.245"
$VPS_USER = "root"
$PROJECT_DIR = "c:\Users\tuong\Downloads\TCDTT"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD CODE LEN VPS $VPS_IP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Bước 1: Tạo thư mục trên VPS
Write-Host "`n[1/4] Tao thu muc tren VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "mkdir -p /var/www/phongtiepdantructruyen/backend /var/www/phongtiepdantructruyen/frontend"

# Bước 2: Upload backend (loại trừ node_modules, dist, .tmp, .strapi)
Write-Host "`n[2/4] Upload backend..." -ForegroundColor Yellow
$backendSource = "$PROJECT_DIR\he-thong-quan-tri-backend"

Push-Location $backendSource
tar -czf "$PROJECT_DIR\backend.tar.gz" --exclude="node_modules" --exclude="dist" --exclude=".tmp" --exclude=".strapi" --exclude=".cache" -C "$backendSource" .
Pop-Location

scp "$PROJECT_DIR\backend.tar.gz" "${VPS_USER}@${VPS_IP}:/var/www/phongtiepdantructruyen/"
ssh ${VPS_USER}@${VPS_IP} "cd /var/www/phongtiepdantructruyen/backend && tar -xzf ../backend.tar.gz && rm ../backend.tar.gz"
Remove-Item "$PROJECT_DIR\backend.tar.gz" -ErrorAction SilentlyContinue

Write-Host "  Backend uploaded!" -ForegroundColor Green

# Bước 3: Upload frontend (loại trừ node_modules, .next)
Write-Host "`n[3/4] Upload frontend..." -ForegroundColor Yellow
$frontendSource = "$PROJECT_DIR\cong-cong-dan-frontend"

Push-Location $frontendSource
tar -czf "$PROJECT_DIR\frontend.tar.gz" --exclude="node_modules" --exclude=".next" -C "$frontendSource" .
Pop-Location

scp "$PROJECT_DIR\frontend.tar.gz" "${VPS_USER}@${VPS_IP}:/var/www/phongtiepdantructruyen/"
ssh ${VPS_USER}@${VPS_IP} "cd /var/www/phongtiepdantructruyen/frontend && tar -xzf ../frontend.tar.gz && rm ../frontend.tar.gz"
Remove-Item "$PROJECT_DIR\frontend.tar.gz" -ErrorAction SilentlyContinue

Write-Host "  Frontend uploaded!" -ForegroundColor Green

# Bước 4: Upload database (nếu có)
$dbFile = "$backendSource\.tmp\data.db"
if (Test-Path $dbFile) {
    Write-Host "`n[4/4] Upload database..." -ForegroundColor Yellow
    ssh ${VPS_USER}@${VPS_IP} "mkdir -p /var/www/phongtiepdantructruyen/backend/.tmp"
    scp "$dbFile" "${VPS_USER}@${VPS_IP}:/var/www/phongtiepdantructruyen/backend/.tmp/data.db"
    Write-Host "  Database uploaded!" -ForegroundColor Green
} else {
    Write-Host "`n[4/4] Khong tim thay database, bo qua..." -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD HOAN TAT!" -ForegroundColor Green
Write-Host "  Tiep theo: SSH vao VPS va chay setup_vps.sh" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
