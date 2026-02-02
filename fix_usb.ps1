$adb = "C:\Users\baba\AppData\Local\Android\Sdk\platform-tools\adb.exe"

Write-Host "🔄 Redémarrage du serveur ADB..." -ForegroundColor Cyan
& $adb kill-server
& $adb start-server

Write-Host "⏳ En attente de votre appareil..." -ForegroundColor Yellow
Write-Host "   1. Débranchez et rebranchez le câble USB" -ForegroundColor Gray
Write-Host "   2. Vérifiez l'écran du téléphone pour autoriser le débogage" -ForegroundColor Gray

& $adb wait-for-device

Write-Host "📱 Appareil connecté !" -ForegroundColor Green
Write-Host "🔗 Configuration des ports (8000, 8081)..." -ForegroundColor Cyan
& $adb reverse tcp:8081 tcp:8081
& $adb reverse tcp:8000 tcp:8000

Write-Host "✅ TOUT EST PRÊT !" -ForegroundColor Green
Write-Host "👉 Vous pouvez maintenant lancer : npx expo start --clear" -ForegroundColor White
Start-Sleep -Seconds 3
