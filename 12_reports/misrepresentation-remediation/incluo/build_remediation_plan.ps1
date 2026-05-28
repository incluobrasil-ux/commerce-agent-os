# build_remediation_plan.ps1
# Lê flagged-current.json, aplica correções de mojibake + claims terapêuticos,
# salva remediation-plan.json com {id, title_new, descriptionHtml_new, handle_new?}

$base = "c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo"
$flagged = Get-Content "$base\flagged-current.json" -Raw -Encoding utf8 | ConvertFrom-Json

function Fix-Mojibake($s) {
    if (-not $s) { return $s }
    $map = [ordered]@{
        'Ã¡'='á';'Ã©'='é';'Ã­'='í';'Ã³'='ó';'Ãº'='ú';'Ã£'='ã';'Ãµ'='õ'
        'Ã§'='ç';'Ã¢'='â';'Ã´'='ô';'Ã‰'='É';'Ã€'='À';'Ã‡'='Ç';'Ãš'='Ú'
        'ÃŠ'='Ê';'Ãˆ'='È';'Ã‚'='Â';'ÃŸ'='ß';'Ã±'='ñ';'ÃŒ'='Ì';'Ã‹'='Ë'
        'Ã'='Ã'
        'â€"'='—';'â€™'="'";'â€œ'='"';'â€'='"';'Â·'='·';'â€¦'='…'
        'Â»'='»';'Â«'='«';'Â°'='°';'Â²'='²';'Â³'='³'
    }
    foreach ($k in $map.Keys) { $s = $s.Replace($k, $map[$k]) }
    return $s
}

function Fix-Claims($s) {
    if (-not $s) { return $s }

    # --- Seções e cabeçalhos (mais específico primeiro) ---
    $s = $s -replace '(?i)Ferramenta de Autorregulação e Apoio à Rotina','Ferramenta de Organização e Apoio à Rotina'
    $s = $s -replace '(?i)Ferramenta de Autorregulação','Ferramenta de Organização'

    # --- Autorregulação (frases compostas antes do termo simples) ---
    $s = $s -replace '(?i)autorregulação sensorial','conforto sensorial'
    $s = $s -replace '(?i)autorregulação oral','desenvolvimento oral'
    $s = $s -replace '(?i)suporte à autorregulação','apoio ao foco'
    $s = $s -replace '(?i)suporte a autorregulação','apoio ao foco'
    $s = $s -replace '(?i)ferramenta de autorregulação','ferramenta de foco'
    $s = $s -replace '(?i)auxílio à autorregulação','auxílio ao foco'
    $s = $s -replace '(?i)autorregulação','organização pessoal'

    # --- Sobrecarga ---
    $s = $s -replace '(?i)gerenciamento da sobrecarga sensorial','organização sensorial'
    $s = $s -replace '(?i)sobrecarga sensorial','excesso de estímulos'
    $s = $s -replace '(?i)sobrecarga cognitiva','cansaço mental'

    # --- Anti-estresse / ansiedade ---
    $s = $s -replace '(?i)Alívio de estresse e ansiedade:','Experiência tátil satisfatória:'
    $s = $s -replace '(?i)alívio da ansiedade','relaxamento'
    $s = $s -replace '(?i)alívio de ansiedade','relaxamento'
    $s = $s -replace '(?i)alívio do estresse','relaxamento'
    $s = $s -replace '(?i)Anti-Estresse Premium','Conforto e Foco Premium'
    $s = $s -replace '(?i)Anti-Estresse','Relaxamento'
    $s = $s -replace '(?i)anti-estresse','relaxamento'
    $s = $s -replace '(?i)antiestresse','relaxamento'
    $s = $s -replace '(?i)anti ansiedade','relaxamento'
    $s = $s -replace '(?i)anti-ansiedade','relaxamento'
    $s = $s -replace 'ansiedade','agitação'
    $s = $s -replace 'Ansiedade','Agitação'

    # --- TDAH / TEA / autismo ---
    $s = $s -replace '(?i),\s*autismo \(TEA\)',''
    $s = $s -replace '(?i)autismo \(TEA\)','desenvolvimento'
    $s = $s -replace '(?i)com TDAH,','com alto nível de energia,'
    $s = $s -replace '(?i)com TDAH','com alto nível de energia'
    $s = $s -replace 'TDAH','alta energia'
    $s = $s -replace 'autismo','desenvolvimento'
    $s = $s -replace 'Autismo','Desenvolvimento'
    $s = $s -replace '(?i)pessoas neurodivergentes','pessoas que valorizam'

    # --- Terapêutico ---
    $s = $s -replace '(?i)terapêuticas','práticas'
    $s = $s -replace '(?i)terapêuticos','práticos'
    $s = $s -replace '(?i)terapêutica','prática'
    $s = $s -replace '(?i)terapêutico','prático'

    # --- OCD ---
    $s = $s -replace '\bOCD\b','foco'
    $s = $s -replace '\bocd\b','foco'

    return $s
}

function Fix-Handle($h) {
    $h = $h -replace 'anti-estresse','relaxamento'
    $h = $h -replace 'antiestresse','relaxamento'
    $h = $h -replace 'anti-ansiedade','foco'
    $h = $h -replace 'autorregulacao','organizacao'
    $h = $h -replace '-tdah-','-'
    $h = $h -replace '-ocd-','-'
    $h = $h -replace '-autismo-','-'
    # Limpar duplos hifens
    $h = $h -replace '--+','-'
    $h = $h.Trim('-')
    return $h
}

$plan = @()
$skipped = 0
foreach ($p in $flagged) {
    # Fix mojibake no título e na descrição
    $titleFixed = Fix-Mojibake $p.title
    $descFixed  = Fix-Mojibake $p.descriptionHtml

    # Fix claims
    $titleClean = Fix-Claims $titleFixed
    $descClean  = Fix-Claims $descFixed

    # Fix handle se tiver claims críticos
    $handleNew = $null
    if ($p.critical) {
        $handleNew = Fix-Handle $p.handle
        if ($handleNew -eq $p.handle) { $handleNew = $null }
    }

    $plan += [PSCustomObject]@{
        id               = $p.id
        handle           = $p.handle
        handle_new       = $handleNew
        title_old        = $p.title
        title_new        = $titleClean
        desc_changed     = ($descClean -ne $p.descriptionHtml)
        title_changed    = ($titleClean -ne $p.title)
        handle_changed   = ($null -ne $handleNew)
        descriptionHtml_new = $descClean
    }
}

$plan | ConvertTo-Json -Depth 5 | Set-Content "$base\remediation-plan.json" -Encoding utf8

$descChanges   = ($plan | Where-Object { $_.desc_changed }).Count
$titleChanges  = ($plan | Where-Object { $_.title_changed }).Count
$handleChanges = ($plan | Where-Object { $_.handle_changed }).Count

Write-Host "Plano salvo: $($plan.Count) produtos"
Write-Host "  Descrições alteradas : $descChanges"
Write-Host "  Títulos alterados    : $titleChanges"
Write-Host "  Handles alterados    : $handleChanges"
