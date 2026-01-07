# Script para resetear la base de datos del sistema hospitalario (Windows 10+)

Write-Host "[Hospital System] - Database Reset" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Ruta de la base de datos en Windows
$dbDir = "$env:USERPROFILE\.local\share\hospital-system"
$dbFile = "$dbDir\hospital.db"

# Verificar si el directorio existe
Write-Host "[*] Verificando directorio de base de datos..." -ForegroundColor Yellow

if (-not (Test-Path $dbDir)) {
    Write-Host "    [INFO] Directorio no existe, se creara al reiniciar" -ForegroundColor Gray
}
else {
    Write-Host "    [OK] Directorio encontrado" -ForegroundColor Green
}

# Eliminar la base de datos si existe
Write-Host ""
if (Test-Path $dbFile) {
    Write-Host "[*] Eliminando base de datos existente..." -ForegroundColor Yellow
    try {
        Remove-Item $dbFile -Force
        Write-Host "    [OK] Base de datos eliminada correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "    [ERROR] Error al eliminar: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "    [INFO] No se encontro base de datos existente" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[OK] Base de datos lista para reinicializar" -ForegroundColor Green
Write-Host ""
Write-Host "[NEXT] Proximo paso:" -ForegroundColor Cyan
Write-Host "      npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "El sistema creara automaticamente una nueva base de datos con el seed data actualizado." -ForegroundColor Gray
