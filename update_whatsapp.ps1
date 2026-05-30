$html = Get-Content src/index.html -Raw

$html = $html -replace '<a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Get Started</a>', '<a href="https://wa.me/918302806913" target="_blank" class="btn btn-primary">Get Started</a>'
$html = $html -replace '<a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#enrollModal">', '<a href="https://wa.me/918302806913" target="_blank" class="btn btn-primary">'
$html = $html -replace '<a href="#!" class="btn btn-primary">Join Community</a>', '<a href="https://wa.me/918302806913" target="_blank" class="btn btn-primary">Join Community</a>'

Set-Content src/index.html -Value $html
Write-Host "Updated WhatsApp Links!"
