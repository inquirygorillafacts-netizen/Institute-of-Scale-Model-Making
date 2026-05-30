$html = Get-Content src/index.html -Raw

$brokenBlock = '        <div class="modal-body p-6 text-center d-none" id="modalSuccessBody">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="mb-4 text-success mt-2 d-flex justify-content-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="18" cy="18" r="3" />
                <line x1="8.7" y1="10.7" x2="15.3" y2="7.3" />
                <line x1="8.7" y1="13.3" x2="15.3" y2="16.7" />
              </svg>
              Share with your friends
            </button>
          </div>
        </div>'

$fixedBlock = '        <div class="modal-body p-6 text-center d-none" id="modalSuccessBody">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="mb-4 text-success mt-2 d-flex justify-content-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-circle-check">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2l4 -4" />
            </svg>
          </div>
          <h2 class="h4 mb-3 fw-bold">Thank You!</h2>
          <p class="text-muted mb-4">Your application has been received successfully. Click below to message us on WhatsApp to stay updated!</p>
          <div class="d-flex flex-column gap-3">
            <a href="https://wa.me/918302806913" target="_blank" class="btn btn-success d-flex align-items-center justify-content-center gap-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-brand-whatsapp">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>'

# replace line endings to match file
$brokenBlock = $brokenBlock -replace "`r`n", "`n"
$html = $html -replace "`r`n", "`n"

$html = $html.Replace($brokenBlock, $fixedBlock)
Set-Content src/index.html -Value $html
Write-Host "Fixed!"
