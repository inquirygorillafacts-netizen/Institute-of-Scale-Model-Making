$html = Get-Content src/index.html -Raw
$matches = [regex]::Matches($html, '(?s)<div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">.*?</a>\s*</div>')
Write-Host "Found $($matches.Count) matches"
$newHtml = $html -replace '(?s)<div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">.*?</a>\s*</div>', ''
Set-Content src/index.html -Value $newHtml
Write-Host "Replaced and saved"
