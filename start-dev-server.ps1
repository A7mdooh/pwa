# تشغيل خادم محلي لاختبار PWA
# PowerShell Script for Local Development

Write-Host "🚀 بدء خادم محلي لاختبار PWA..." -ForegroundColor Green

# التحقق من وجود Python
$pythonExists = Get-Command python -ErrorAction SilentlyContinue
$python3Exists = Get-Command python3 -ErrorAction SilentlyContinue

if ($pythonExists -or $python3Exists) {
    $pythonCmd = if ($python3Exists) { "python3" } else { "python" }
    
    Write-Host "✅ تم العثور على Python" -ForegroundColor Green
    Write-Host "🌐 بدء الخادم على المنفذ 8000..." -ForegroundColor Yellow
    Write-Host "📱 يمكنك الآن الوصول للتطبيق عبر:" -ForegroundColor Cyan
    Write-Host "   http://localhost:8000" -ForegroundColor White
    Write-Host "   أو" -ForegroundColor Gray
    Write-Host "   http://127.0.0.1:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 لاختبار PWA بشكل كامل، استخدم:" -ForegroundColor Yellow
    Write-Host "   https://localhost:8000 (مطلوب HTTPS للـ PWA)" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Red
    Write-Host "=" * 50
    
    & $pythonCmd -m http.server 8000
} else {
    Write-Host "❌ Python غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 يرجى تثبيت Python من:" -ForegroundColor Yellow
    Write-Host "   https://www.python.org/downloads/" -ForegroundColor White
    Write-Host ""
    Write-Host "أو استخدم أي خادم ويب آخر مثل:" -ForegroundColor Cyan
    Write-Host "- Live Server (VS Code Extension)" -ForegroundColor White
    Write-Host "- http-server (npm install -g http-server)" -ForegroundColor White
    Write-Host "- serve (npm install -g serve)" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 نصائح لاختبار PWA:" -ForegroundColor Green
Write-Host "1. افتح Chrome DevTools (F12)" -ForegroundColor White
Write-Host "2. انتقل إلى تبويب Application" -ForegroundColor White
Write-Host "3. تحقق من Service Workers و Manifest" -ForegroundColor White
Write-Host "4. اختبر العمل أوفلاين من تبويب Network" -ForegroundColor White
