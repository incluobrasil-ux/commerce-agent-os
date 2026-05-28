# sync.ps1 — commita e pusha tudo para o GitHub
# Uso: .\sync.ps1 "mensagem do commit"
param([string]$msg = "chore(vault): retroalimentacao automatica $(Get-Date -Format 'yyyy-MM-dd HH:mm')")

Set-Location "c:\projetos-incluo\commerce-agent-os"

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nada para commitar." -ForegroundColor Yellow
    exit 0
}

git commit -m $msg
git push origin main
Write-Host "Sincronizado com GitHub." -ForegroundColor Green
