$html = Get-Content src/index.html -Raw
$html = $html -replace 'https://wa.me/918302806913" target="_blank" class="btn btn-primary">Join Community', 'https://chat.whatsapp.com/Iz0bhig5W5iBkJfZUzKD1J" target="_blank" class="btn btn-primary">Join Community'
$html = $html -replace 'https://wa.me/918302806913" target="_blank"\r?\n              class="btn btn-success', 'https://chat.whatsapp.com/Iz0bhig5W5iBkJfZUzKD1J" target="_blank"' + "`r`n              class=""btn btn-success"
Set-Content src/index.html -Value $html
Write-Host "WhatsApp group link updated!"
