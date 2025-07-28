# تحديث جميع ملفات HTML لدعم PWA
# PowerShell Script

$activityFiles = Get-ChildItem -Path ".\activities\*.html" -File
$manifestContent = @'

  <!-- PWA Manifest -->
  <link rel="manifest" href="../manifest.json">
  
  <!-- أيقونات iOS -->
  <link rel="apple-touch-icon" href="../assets/media/images/school-logo.png">
  <link rel="apple-touch-icon" sizes="152x152" href="../assets/icons/icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/icons/icon-192x192.png">
  
  <!-- إعدادات iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="الأنشطة الصفية">
  
  <!-- إعدادات Windows -->
  <meta name="msapplication-TileImage" content="../assets/icons/icon-144x144.png">
  <meta name="msapplication-TileColor" content="#00796B">
  
  <!-- إعدادات PWA إضافية -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="الأنشطة الصفية">
'@

$pwaScript = @'

  <!-- PWA Scripts -->
  <script src="../assets/js/pwa.js"></script>
'@

foreach ($file in $activityFiles) {
    Write-Host "Processing file: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Add PWA manifest after favicon
    if ($content -match '(<link rel="icon"[^>]*>)') {
        $content = $content -replace '(<link rel="icon"[^>]*>)', "`$1$manifestContent"
    }
    
    # Add PWA script before closing body
    if ($content -match '</body>') {
        $content = $content -replace '</body>', "$pwaScript`n</body>"
    }
    
    # Save updated file
    Set-Content $file.FullName -Value $content -Encoding UTF8
    Write-Host "Updated: $($file.Name)"
}

Write-Host "Finished updating all activity files!"
