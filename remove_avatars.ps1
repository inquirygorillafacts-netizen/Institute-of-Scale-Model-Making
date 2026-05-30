$html = Get-Content src/index.html -Raw
$matches = [regex]::Matches($html, '(?s)<div class="text-xs d-flex gap-2 align-items-center mt-4 mb-8">\s*<img src="\./assets/images/avatar/avatar-\d\.jpg" alt="" class="avatar avatar-xs rounded-circle">\s*<span>.*?</span>\s*</div>')
Write-Host "Found $($matches.Count) matches"
$newHtml = $html -replace '(?s)<div class="text-xs d-flex gap-2 align-items-center mt-4 mb-8">\s*<img src="\./assets/images/avatar/avatar-\d\.jpg" alt="" class="avatar avatar-xs rounded-circle">\s*<span>.*?</span>\s*</div>', ''
Set-Content src/index.html -Value $newHtml
Write-Host "Replaced and saved"
