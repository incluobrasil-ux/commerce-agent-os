# Run Summary — Fase 14-15: CDN Images Remediation Completa (36 produtos, 152+ imagens)

**Data:** 2026-06-01  
**Tipo:** Re-upload de imagens via Shopify API  
**Resultado:** ZERO filenames clínicos em qualquer produto ativo  

---

## Contexto

O GMC verifica os filenames das imagens no CDN do Shopify. Filenames como `estimulo-proprioceptivo-1.webp`, `oral-motor-2.webp`, `reflexologia-3.webp` são detectados como linguagem clínica mesmo que o texto do produto esteja limpo. Solução: re-upload de todas as imagens com filenames neutros via API.

---

## Técnica de Re-upload (comprovada)

```
1. stagedUploadsCreate mutation → presigned GCS URLs
2. PowerShell: System.Text.StringBuilder + [System.IO.File]::WriteAllText(..., ASCII)
   CRÍTICO: usar \n literal (dois chars) no parâmetro -w do curl
   `n no PowerShell = newline real = quebra o bat file
3. cmd.exe /c upload_bN.bat → curl.exe multipart POST para GCS
   (PowerShell HttpClient NÃO funciona com GCS — usar curl.exe nativo)
4. productCreateMedia com as resourceUrls
5. productDeleteMedia para deletar imagens antigas
```

Arquivos de trabalho: `C:\Users\Jenif\Downloads\remediation-batch\`

---

## Fase 14 — 10 produtos (2026-06-01 manhã)

Usando bat files existentes (upload_b1.bat, upload_b2.bat parcial) gerados em sessão anterior:

| Produto | Imagens | Filename antigo removido |
|---|---|---|
| Colete Sensorial | 7 | estimulo-proprioceptivo |
| Saco Sensorial | 8 | compressao-proprioceptiva |
| Tapete Tátil Pedras | 6 | reflexologia |
| Tapete Tátil Pontos | 5 | acupressao |
| Blocos Equilíbrio Espuma PVC | 5 | estimulo-proprioceptivo |
| Kit Ferramentas Bucais Lúdicas | 4 | oral-motor |
| Kit Canudos Sopro | 4 | oral-motor |
| Colar Pingente Lágrima | 5 | estimulo-oral |
| Colar Mordedor Aranha | 7 | estimulo-oral |
| Mordedor em T (imgs 1-5) | 5 | filenames antigos |

---

## Fase 15 — 26 produtos restantes (2026-06-01 tarde)

Processados em 6 batches via stagedUploadsCreate + curl.exe + productCreateMedia + productDeleteMedia:

### Batch 2 (25 imagens — bat existente):
- Mordedor em T imgs 6-7, Colar Mastigável BPA Free 1-4, Ampulheta Sensorial 1-5, Busy Book Fazenda 1-4, Varinha LED 1-4, Foguete LED 1-4, Livro Sensorial Pano 1-2

### Batch 3 (33 imagens):
- Livro Sensorial Pano 3-6, Pirâmide Fidget 3D 1-6, Fidget Hexágono 1-6, Tapetes Feltro 1-6, Livro Feltro Montessori 1-7, Brinquedo Matemática Feltro 1-4

### Batch 4 (34 imagens):
- Tapete Água Inflável 1-4, Kit Pulseiras Fidget 5 1-4, Cobra Articulada Fidget 1-4, Pulseiras Fidget Kit 6 1-3, Pulseiras Alpaca TPR 1-3, Mordedor ABS Infantil 1-4, Jogo Tátil Montessori 1-6, Labirinto Magnético 1-6

### Batch 5 (30 imagens):
- Sino Musical Madeira 1-7, Bola Montessori Silicone 1-7, Painel Sensorial Cordas 1-7, Conjunto Tenda 3em1 1-9

### Batch 6 (30 imagens):
- Tubo Mastigável Silicone 1-10, Mordedor Oral Silicone 1-20

**Nota:** Mordedor Oral Silicone tinha 21 imagens antigas (não 20 como estimado) — todas 21 deletadas, 20 novas adicionadas.

---

## Outros itens concluídos em 2026-06-01

- Menu label "Recursos de Organização e Conforto Sensorial" → "Recursos de Conforto e Bem-Estar Sensorial" (via menuUpdate GraphQL)
- Feed duplicado removido: Shopify App API (292 produtos) deletado do GMC — apenas Simprosys ativo
- Shipping GMC corrigido: 7–14 dias trânsito
- Returns GMC: 7 dias / Gratuito / Verificado

---

## Resultado Final

- **ZERO imagens** com filenames clínicos no CDN de qualquer produto ativo
- Feed Simprosys: 444 produtos / Submitted 444 / Ineligible 0 / Excluded 0
- GMC Diagnostics: único problema = suspensão de conta — zero erros individuais
- **Toda a remediação técnica concluída**
