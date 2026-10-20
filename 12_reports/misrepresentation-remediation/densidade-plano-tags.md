# Plano de Redução de Densidade de Tags — Termos Genéricos Empilhados

**Loja:** incluobrasil.com (Shopify) · **Modo:** somente leitura, nenhuma mutation aplicada
**Data:** 2026-06-03 · **Total de produtos analisados:** 143 (paginação completa)

Termos genéricos rastreados (por radical, sem acento): `sensori`, `tatil`, `estimul`, `cognitiv`, `desenvolv`.
Exclusão de falso-positivo: `tatil` dentro de **portátil** não conta.

**Regra-meta:** no máximo **2 tags de categoria genérica por produto**; nenhuma tag pode sozinha conter 2+ genéricos.

---

## A) Tag-famílias PROBLEMÁTICAS (tag sozinha com 2+ genéricos)

| Tag | nº produtos | nº genéricos | Ação proposta | Justificativa |
|---|---|---|---|---|
| `estimulo-sensorial-tatil` | 1 | 3 (estímulo+sensorial+tátil) | **RENOMEAR → `sensorial`** | 3 genéricos amontoados num único slug; nenhum produto-específico. Reduzir a 1 termo-categoria. |
| `estímulo tátil` | 1 | 2 (estímulo+tátil) | **REMOVER** | Redundante: o produto já carrega `bola-tatil` e `Bolas Sensoriais e Stress Balls`. Tag duplica o eixo tátil/sensorial. |

> Apenas **2 tags** no catálogo inteiro violam a regra "2+ genéricos na mesma tag". O problema dominante é **empilhamento de várias tags de 1 genérico** no mesmo produto (próxima seção).

## A.1) Tags genéricas mais empilháveis (1 genérico, alto volume) — contexto

Estas são OK isoladamente, mas viram empilhamento quando 3+ aparecem juntas. Inventário das de maior alcance:

| Tag | nº produtos | genérico |
|---|---|---|
| `sensorial` | 30 | sensori |
| `fidget-sensorial` | 24 | sensori |
| `Cognitivo e Lógico` | 13 | cognitiv |
| `estímulo` | 11 | estimul |
| `bola-tatil` | 10 | tatil |
| `Bolas Sensoriais e Stress Balls` | 10 | sensori |
| `bola-sensorial` | 8 | sensori |
| `caixa-sensorial` | 8 | sensori |
| `conjunto-atividades-sensoriais` | 8 | sensori |
| `Kits Sensoriais Educacionais` | 8 | sensori |
| `tátil` | 8 | tatil |
| `ampulheta-sensorial` | 7 | sensori |
| `Brinquedos Visuais Sensoriais` | 7 | sensori |
| `estimulo-visual` | 7 | estimul |
| `presentes-Sensoriais` | 7 | sensori |
| `tubo-sensorial-visual` | 7 | sensori |
| `Brinquedos Sensoriais` | 6 | sensori |
| `Conforto Sensorial` | 6 | sensori |
| `Conforto Tátil` | 6 | tatil |
| `Habilidade Cognitiva` | 6 | cognitiv |
| `Livro Sensorial Feltro` | 6 | sensori |
| `Colar Sensorial` | 5 | sensori |

_Inventário completo: 71 tags contêm algum radical genérico (2 multi-genéricas, 69 de 1 genérico)._

### Famílias de slugs redundantes recomendadas para CONSOLIDAR

Clusters onde 3-4 slugs sensoriais/táteis viajam sempre juntos no mesmo produto. Recomendação: manter 1 bucket-coleção + no máx. 1 descritor; remover os demais slugs duplicados.

| Cluster (viajam juntos) | Bucket a MANTER | Slugs a REMOVER (redundantes) |
|---|---|---|
| Bolas: `bola-sensorial` + `bola-tatil` + `bola-texturizada`* + `Bolas Sensoriais e Stress Balls` | `Bolas Sensoriais e Stress Balls` | `bola-sensorial`, `bola-tatil` |
| Kits/tapetes: `caixa-sensorial` + `conjunto-atividades-sensoriais` + `presentes-Sensoriais` + `Kits Sensoriais Educacionais` | `Kits Sensoriais Educacionais` | `caixa-sensorial`, `conjunto-atividades-sensoriais`, `presentes-Sensoriais` |
| Visuais: `ampulheta-sensorial` + `estimulo-visual` + `tubo-sensorial-visual` + `Brinquedos Visuais Sensoriais` | `Brinquedos Visuais Sensoriais` | `ampulheta-sensorial`, `tubo-sensorial-visual` (manter `estimulo-visual` se houver espaço) |
| Mordedores: `mordedor sensorial` + `mordedor sensorial de silicone` + `Mordedor Sensorial …` + `Colar Sensorial` | `Colar Sensorial` (ou nome do bucket) | `mordedor sensorial de silicone`, slug longo full-title |

\* `bola-texturizada` não é genérico (não entra na cota), mas reforça a redundância visual da tag-cloud.

---

## B) Produtos que excedem a meta — total: **48** de 143

Critério: 3+ tags de categoria genérica empilhadas **OU** uma tag multi-genérica. Tags NÃO-genéricas (marca, material, faixa etária, BPA-free, etc.) são **preservadas intactas**.

Distribuição de carga genérica:
- 0 tag(s) genérica(s): 46 produtos
- 1 tag(s) genérica(s): 34 produtos
- 2 tag(s) genérica(s): 15 produtos
- 3 tag(s) genérica(s): 21 produtos ← excede
- 4 tag(s) genérica(s): 12 produtos ← excede
- 5 tag(s) genérica(s): 5 produtos ← excede
- 6 tag(s) genérica(s): 6 produtos ← excede
- 7 tag(s) genérica(s): 1 produtos ← excede
- 8 tag(s) genérica(s): 3 produtos ← excede

## C) ANTES / DEPOIS — todos os 48 produtos

### 1. `cubo-fidget-12-lados-foco-conforto-tatil`
- **ANTES** (4 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`
- **DEPOIS** (3 tags): `Fidget Toys Educacionais`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 2. `cubo-infinito-sensorial-fidget`
- **ANTES** (4 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`
- **DEPOIS** (3 tags): `Fidget Toys Educacionais`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 3. `fidget-pad-controlador-sensorial-foco`
- **ANTES** (4 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`
- **DEPOIS** (3 tags): `Fidget Toys Educacionais`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 4. `cubo-fidget-magnetico-botoes-clique`
- **ANTES** (4 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`
- **DEPOIS** (3 tags): `Fidget Toys Educacionais`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 5. `orbita-cubo-sensorial-infinito-conforto-tatil-foco`
- **ANTES** (4 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`
- **DEPOIS** (3 tags): `Fidget Toys Educacionais`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 6. `kit-6-bolas-sensoriais-texturizadas-tpu-mordedor-chocalho-bebes`
- ⚠️ tag multi-genérica: `estímulo tátil`
- **ANTES** (10 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `bolas`, `Bolas Sensoriais e Stress Balls`, `chocalho`, `estímulo tátil`, `sensoriais`, `texturizadas`, `tpu`
- **DEPOIS** (7 tags): `bola-texturizada`, `bolas`, `chocalho`, `texturizadas`, `tpu`, `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas removidas: `bola-tatil`, `estímulo tátil`, `sensoriais`

### 7. `bolas-magneticas-fidget-silicone-4-texturas`
- **ANTES** (9 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais`, `Bolas Sensoriais e Stress Balls`, `Fidget Toy`, `Magnético`, `Silicone Atóxico`, `Texturizado`
- **DEPOIS** (7 tags): `bola-texturizada`, `Fidget Toy`, `Magnético`, `Silicone Atóxico`, `Texturizado`, `Bolas Sensoriais e Stress Balls`, `Bolas Sensoriais`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `Bolas Sensoriais`
- genéricas removidas: `bola-sensorial`, `bola-tatil`

### 8. `squishy-mochi-morango-slow-rising`
- **ANTES** (8 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `Mochi`, `Slow Rising`, `Squeeze`, `Squishy`
- **DEPOIS** (7 tags): `bola-texturizada`, `Mochi`, `Slow Rising`, `Squeeze`, `Squishy`, `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas removidas: `bola-tatil`

### 9. `bola-sensorial-gel-texturizada-squeeze-macio`
- **ANTES** (11 tags): `bola`, `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `conforto`, `gel`, `sensorial`, `squeeze`, `texturizada`, `tátil`
- **DEPOIS** (8 tags): `bola`, `bola-texturizada`, `conforto`, `gel`, `squeeze`, `texturizada`, `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas removidas: `bola-sensorial`, `bola-tatil`, `tátil`

### 10. `bola-apertar-expressoes-faciais-borracha`
- **ANTES** (5 tags): `Bola Sensorial`, `bola-tatil`, `Bolas Sensoriais e Stress Balls`, `Borracha`, `Squeeze`
- **DEPOIS** (4 tags): `Borracha`, `Squeeze`, `Bolas Sensoriais e Stress Balls`, `Bola Sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `Bola Sensorial`
- genéricas removidas: `bola-tatil`

### 11. `bola-massagem-amendoim-texturizada-estimulo-tatil`
- **ANTES** (10 tags): `amendoim`, `bola`, `bola de massagem`, `bola para massagem`, `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `massagem`, `texturizada`
- **DEPOIS** (9 tags): `amendoim`, `bola`, `bola de massagem`, `bola para massagem`, `bola-texturizada`, `massagem`, `texturizada`, `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas removidas: `bola-tatil`

### 12. `fidget-slider-coruja-metal-premium-16-imas`
- **ANTES** (5 tags): `Brinquedos Sensoriais`, `Conforto Tátil`, `Fidget Toys Educacionais`, `fidget-sensorial`, `metal`
- **DEPOIS** (4 tags): `Fidget Toys Educacionais`, `metal`, `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas mantidas: `Brinquedos Sensoriais`, `Conforto Tátil`
- genéricas removidas: `fidget-sensorial`

### 13. `ampulheta-sensorial-visual-temporizador-smile-2-minutos`
- **ANTES** (12 tags): `ampulheta`, `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `cronômetro`, `cronômetro infantil`, `estimulação`, `estimulo-visual`, `infantil`, `sensorial`, `temporizador`, `tubo-sensorial-visual`, `visual`
- **DEPOIS** (8 tags): `ampulheta`, `cronômetro`, `cronômetro infantil`, `infantil`, `temporizador`, `visual`, `Brinquedos Visuais Sensoriais`, `sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `sensorial`
- genéricas removidas: `ampulheta-sensorial`, `estimulação`, `estimulo-visual`, `tubo-sensorial-visual`

### 14. `ampulhetas-coloridas-kit-6-tempos-gestao-visual-do-tempo`
- **ANTES** (4 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `tubo-sensorial-visual`
- **DEPOIS** (2 tags): `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas removidas: `estimulo-visual`, `tubo-sensorial-visual`

### 15. `busy-book-fazenda-feltro-bilingue-motor-fino`
- **ANTES** (15 tags): `bilíngue`, `book`, `busy`, `estímulo`, `fazenda`, `feltro`, `Habilidade Cognitiva`, `livro infantil`, `livro infantil estímulo`, `livro infantil fazenda`, `Livro Sensorial Feltro`, `motor fino`, `Motor Fino Completo`, `Quiet Books e Busy Books Educacionais`, `Tapete Feltro Texturas`
- **DEPOIS** (13 tags): `bilíngue`, `book`, `busy`, `fazenda`, `feltro`, `livro infantil`, `livro infantil fazenda`, `motor fino`, `Motor Fino Completo`, `Quiet Books e Busy Books Educacionais`, `Tapete Feltro Texturas`, `Habilidade Cognitiva`, `Livro Sensorial Feltro`
- genéricas mantidas: `Habilidade Cognitiva`, `Livro Sensorial Feltro`
- genéricas removidas: `estímulo`, `livro infantil estímulo`

### 16. `varinha-led-multicolorida-7-modos-de-luz`
- **ANTES** (10 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `estímulo`, `led`, `modos de luz`, `multicolorida`, `sensorial`, `tubo-sensorial-visual`, `varinha`
- **DEPOIS** (6 tags): `led`, `modos de luz`, `multicolorida`, `varinha`, `Brinquedos Visuais Sensoriais`, `estímulo`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `estímulo`
- genéricas removidas: `ampulheta-sensorial`, `estimulo-visual`, `sensorial`, `tubo-sensorial-visual`

### 17. `foguete-led-com-estilingue-coordenacao-motora-estimulo-visual`
- **ANTES** (4 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `tubo-sensorial-visual`
- **DEPOIS** (2 tags): `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas removidas: `estimulo-visual`, `tubo-sensorial-visual`

### 18. `livro-sensorial-pano-alto-contraste-montessori`
- **ANTES** (15 tags): `alto contraste`, `estímulo`, `Habilidade Cognitiva`, `livro`, `livro de pani`, `livro sensorial`, `Livro Sensorial Feltro`, `livro sensorial infantil de pano`, `Motor Fino Completo`, `pano`, `Quiet Books e Busy Books Educacionais`, `sensorial`, `Tapete Feltro Texturas`, `toque`, `visual`
- **DEPOIS** (11 tags): `alto contraste`, `livro`, `livro de pani`, `Motor Fino Completo`, `pano`, `Quiet Books e Busy Books Educacionais`, `Tapete Feltro Texturas`, `toque`, `visual`, `Habilidade Cognitiva`, `Livro Sensorial Feltro`
- genéricas mantidas: `Habilidade Cognitiva`, `Livro Sensorial Feltro`
- genéricas removidas: `estímulo`, `livro sensorial`, `livro sensorial infantil de pano`, `sensorial`

### 19. `piramide-impossivel-fidget-3d-estimulo-visual-foco`
- **ANTES** (7 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `fidget 3D`, `impossível`, `pirâmide`, `tubo-sensorial-visual`
- **DEPOIS** (5 tags): `fidget 3D`, `impossível`, `pirâmide`, `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas removidas: `estimulo-visual`, `tubo-sensorial-visual`

### 20. `fidget-hexagono-girando-estimulo-visual-tatil`
- **ANTES** (4 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `tubo-sensorial-visual`
- **DEPOIS** (2 tags): `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas removidas: `estimulo-visual`, `tubo-sensorial-visual`

### 21. `tapetes-sensoriais-feltro-estimulo-tatil-cognitivo-8pcs`
- **ANTES** (10 tags): `caixa-sensorial`, `cognitivo`, `conjunto-atividades-sensoriais`, `estímulo`, `feltro`, `Kits Sensoriais Educacionais`, `sensoriais`, `tapetes`, `Tapetes Sensoriais de Feltro`, `tátil`
- **DEPOIS** (4 tags): `feltro`, `tapetes`, `Kits Sensoriais Educacionais`, `Tapetes Sensoriais de Feltro`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `Tapetes Sensoriais de Feltro`
- genéricas removidas: `caixa-sensorial`, `cognitivo`, `conjunto-atividades-sensoriais`, `estímulo`, `sensoriais`, `tátil`

### 22. `cubo-sensorial-silicone-textura-responsiva-conforto-tatil`
- **ANTES** (12 tags): `caixa-sensorial`, `conforto`, `conjunto-atividades-sensoriais`, `cubo`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`, `responsiva`, `sensorial`, `silicone`, `textura`, `tátil`
- **DEPOIS** (8 tags): `conforto`, `cubo`, `kit-Educacionais`, `responsiva`, `silicone`, `textura`, `Kits Sensoriais Educacionais`, `sensorial`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `sensorial`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`, `presentes-Sensoriais`, `tátil`

### 23. `pedras-sensoriais-texturizadas-conforto-tatil-foco`
- **ANTES** (12 tags): `caixa-sensorial`, `conforto tátil`, `conjunto-atividades-sensoriais`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `pedras`, `pedras sensoriais`, `pedras sensoriais texturizadas`, `pedras texturizadas`, `presentes-Sensoriais`, `sensoriais`, `texturizadas`
- **DEPOIS** (6 tags): `kit-Educacionais`, `pedras`, `pedras texturizadas`, `texturizadas`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas removidas: `caixa-sensorial`, `conforto tátil`, `conjunto-atividades-sensoriais`, `pedras sensoriais`, `pedras sensoriais texturizadas`, `sensoriais`

### 24. `tapete-tatil-pedras-texturizadas-removiveis`
- **ANTES** (13 tags): `caixa-sensorial`, `conforto`, `conjunto-atividades-sensoriais`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `pedras`, `pedras removíveis`, `pedras texturizadas`, `presentes-Sensoriais`, `sensorial`, `tapete`, `tapete tátil`, `texturizadas`
- **DEPOIS** (9 tags): `conforto`, `kit-Educacionais`, `pedras`, `pedras removíveis`, `pedras texturizadas`, `tapete`, `texturizadas`, `Kits Sensoriais Educacionais`, `sensorial`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `sensorial`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`, `presentes-Sensoriais`, `tapete tátil`

### 25. `tapete-tatil-pontos-texturizados-travesseiro`
- **ANTES** (11 tags): `caixa-sensorial`, `conforto`, `conjunto-atividades-sensoriais`, `estimulação`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`, `sensorial`, `tapete`, `Tapete de Pontos de Pressão`, `travesseiro`
- **DEPOIS** (7 tags): `conforto`, `kit-Educacionais`, `tapete`, `Tapete de Pontos de Pressão`, `travesseiro`, `Kits Sensoriais Educacionais`, `sensorial`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `sensorial`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`, `estimulação`, `presentes-Sensoriais`

### 26. `mordedor-sensorial-silicone-kit-3-pecas`
- **ANTES** (8 tags): `bpa free`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `Colar Sensorial`, `grau alimentar`, `Mordedor`, `mordedor sensorial de silicone`, `sensorial`, `silicone`
- **DEPOIS** (7 tags): `bpa free`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `grau alimentar`, `Mordedor`, `silicone`, `Colar Sensorial`, `sensorial`
- genéricas mantidas: `Colar Sensorial`, `sensorial`
- genéricas removidas: `mordedor sensorial de silicone`

### 27. `bola-sensorial-3-em-1-mordedor-chocalho-desenvolvimento`
- **ANTES** (14 tags): `bola`, `bola sensorial`, `Bola Sensorial 3 em 1`, `bola sensorial para bebê`, `bola sensorial para crianças`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `chocalho`, `chocalho infantill`, `infantil`, `para bebês`, `preensão manual para bebê`, `sensorial`
- **DEPOIS** (9 tags): `bola`, `bola-texturizada`, `chocalho`, `chocalho infantill`, `infantil`, `para bebês`, `preensão manual para bebê`, `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas removidas: `bola sensorial`, `Bola Sensorial 3 em 1`, `bola sensorial para bebê`, `bola sensorial para crianças`, `bola-tatil`

### 28. `colar-sensorial-silicone-pingente-lagrima-bpa-free`
- **ANTES** (12 tags): `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `Colar Sensorial`, `conforto`, `estímulo`, `lágrima`, `Mordedor`, `oral`, `pingente`, `sensorial`, `silicone`, `silicone grau alimentar`
- **DEPOIS** (11 tags): `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `conforto`, `lágrima`, `Mordedor`, `oral`, `pingente`, `silicone`, `silicone grau alimentar`, `Colar Sensorial`, `estímulo`
- genéricas mantidas: `Colar Sensorial`, `estímulo`
- genéricas removidas: `sensorial`

### 29. `topper-sensorial-lapis-3-pecas-silicone-foco`
- **ANTES** (12 tags): `alimentício`, `coordenação`, `grau`, `lápis`, `montessori`, `motricidade fina`, `sensorial`, `silicone`, `topper`, `topper para lápis`, `topper sensorial`, `Topper Sensorial para Lápis em Silicone Grau Alimentício`
- **DEPOIS** (11 tags): `alimentício`, `coordenação`, `grau`, `lápis`, `montessori`, `motricidade fina`, `silicone`, `topper`, `topper para lápis`, `sensorial`, `Topper Sensorial para Lápis em Silicone Grau Alimentício`
- genéricas mantidas: `sensorial`, `Topper Sensorial para Lápis em Silicone Grau Alimentício`
- genéricas removidas: `topper sensorial`

### 30. `tapete-sensorial-agua-inflavel-bebe`
- **ANTES** (14 tags): `bpa`, `caixa-sensorial`, `conjunto-atividades-sensoriais`, `free`, `inflável`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`, `sensorial`, `tapete`, `tapete sensorial`, `tapete sensorial de água`, `Tapete Sensorial de Água Inflável BPA Free`, `água`
- **DEPOIS** (8 tags): `bpa`, `free`, `inflável`, `kit-Educacionais`, `tapete`, `água`, `Kits Sensoriais Educacionais`, `sensorial`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `sensorial`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`, `presentes-Sensoriais`, `tapete sensorial`, `tapete sensorial de água`, `Tapete Sensorial de Água Inflável BPA Free`

### 31. `colar-mordedor-sensorial-aranha-silicone-infantil`
- **ANTES** (17 tags): `aranha`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `colar mordedor`, `Colar Mordedor Sensorial`, `colar sensorial`, `colar silicone`, `conforto`, `design`, `estímulo`, `mordedor`, `mordedor sensorial`, `mordedor silicone`, `oral`, `sensorial`, `silicone`, `silicone grau alimentar`
- **DEPOIS** (14 tags): `aranha`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `colar mordedor`, `colar silicone`, `conforto`, `design`, `mordedor`, `mordedor silicone`, `oral`, `silicone`, `silicone grau alimentar`, `estímulo`, `sensorial`
- genéricas mantidas: `estímulo`, `sensorial`
- genéricas removidas: `Colar Mordedor Sensorial`, `colar sensorial`, `mordedor sensorial`

### 32. `mordedor-sensorial-formato-t-silicone-infantil`
- **ANTES** (7 tags): `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `conforto`, `estímulo`, `Mordedor Sensorial em T de Silicone`, `oral`, `sensorial`, `silicone`
- **DEPOIS** (6 tags): `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `conforto`, `oral`, `silicone`, `estímulo`, `sensorial`
- genéricas mantidas: `estímulo`, `sensorial`
- genéricas removidas: `Mordedor Sensorial em T de Silicone`

### 33. `abafador-ruido-infantil-unicornio-nrr25db`
- **ANTES** (13 tags): `abafador`, `abafador auricular`, `Abafador de Ruído`, `abafador infantil`, `conforto`, `Conforto Sensorial`, `infantil`, `Isolamento Acústico`, `protetor auditivo`, `protetor sensorial`, `Protetores Auriculares / Abafadores`, `ruído`, `sensorial`
- **DEPOIS** (12 tags): `abafador`, `abafador auricular`, `Abafador de Ruído`, `abafador infantil`, `conforto`, `infantil`, `Isolamento Acústico`, `protetor auditivo`, `Protetores Auriculares / Abafadores`, `ruído`, `Conforto Sensorial`, `sensorial`
- genéricas mantidas: `Conforto Sensorial`, `sensorial`
- genéricas removidas: `protetor sensorial`

### 34. `abafador-ruido-bebe-faixa-conforto-sensorial-23db`
- **ANTES** (18 tags): `3-meses-3-anos`, `abafador`, `Abafador de Ruído`, `abafador-ruido-bebe-faixa`, `bebê`, `conforto`, `Conforto Sensorial`, `conforto-sensorial-infantil`, `dobravel-portatil-bebe`, `espuma-acustica-absorvente`, `faixa macia`, `faixa-macia-ajustavel`, `ferramenta-apoio-sensorial`, `Isolamento Acústico`, `Protetores Auriculares / Abafadores`, `ruído`, `sensorial`, `uso-eventos-viagens-bebe`
- **DEPOIS** (16 tags): `3-meses-3-anos`, `abafador`, `Abafador de Ruído`, `abafador-ruido-bebe-faixa`, `bebê`, `conforto`, `dobravel-portatil-bebe`, `espuma-acustica-absorvente`, `faixa macia`, `faixa-macia-ajustavel`, `Isolamento Acústico`, `Protetores Auriculares / Abafadores`, `ruído`, `uso-eventos-viagens-bebe`, `Conforto Sensorial`, `sensorial`
- genéricas mantidas: `Conforto Sensorial`, `sensorial`
- genéricas removidas: `conforto-sensorial-infantil`, `ferramenta-apoio-sensorial`

### 35. `conjunto-tenda-piscina-bolinhas-tunel-desenvolvimento-motor-3em1`
- ⚠️ tag multi-genérica: `estimulo-sensorial-tatil`
- **ANTES** (13 tags): `brincadeira-ativa-ludica`, `conjunto-tenda-piscina-tunel`, `desenvolvimento-motor-3em1`, `equilíbrio`, `Equilíbrio e Motricidade Grossa`, `estimulo-sensorial-tatil`, `idade-3-6-anos`, `motricidade grossa`, `motricidade-grossa-infantil`, `movimento`, `piscina-bolinhas-sensorial`, `portatil-facil-montar`, `uso-interno-externo`
- **DEPOIS** (12 tags): `brincadeira-ativa-ludica`, `conjunto-tenda-piscina-tunel`, `equilíbrio`, `Equilíbrio e Motricidade Grossa`, `idade-3-6-anos`, `motricidade grossa`, `motricidade-grossa-infantil`, `movimento`, `portatil-facil-montar`, `uso-interno-externo`, `desenvolvimento-motor-3em1`, `piscina-bolinhas-sensorial`
- genéricas mantidas: `desenvolvimento-motor-3em1`, `piscina-bolinhas-sensorial`
- genéricas removidas: `estimulo-sensorial-tatil`

### 36. `colar-sensorial-mastigavel-silicone-bpa-free`
- **ANTES** (11 tags): `alimentar`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `Colar Sensorial`, `conforto sensorial`, `dentição`, `mastigável`, `Mordedor`, `sensorial`, `silicone`, `silicone grau alimentar`
- **DEPOIS** (10 tags): `alimentar`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `colar`, `dentição`, `mastigável`, `Mordedor`, `silicone`, `silicone grau alimentar`, `Colar Sensorial`, `sensorial`
- genéricas mantidas: `Colar Sensorial`, `sensorial`
- genéricas removidas: `conforto sensorial`

### 37. `sino-musical-infantil-madeira-desenvolvimento-sensorial`
- **ANTES** (5 tags): `caixa-sensorial`, `conjunto-atividades-sensoriais`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- **DEPOIS** (3 tags): `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`

### 38. `slime-sensorial-reutilizavel-massa-cristal-foco`
- **ANTES** (12 tags): `conforto`, `coordenação`, `labirinto`, `montessori`, `motricidade fina`, `reutilizável`, `sensorial`, `slime`, `slime infantil`, `slime reutilizável`, `slime sensorial`, `tátil`
- **DEPOIS** (11 tags): `conforto`, `coordenação`, `labirinto`, `montessori`, `motricidade fina`, `reutilizável`, `slime`, `slime infantil`, `slime reutilizável`, `sensorial`, `tátil`
- genéricas mantidas: `sensorial`, `tátil`
- genéricas removidas: `slime sensorial`

### 39. `painel-sensorial-silicone-foco`
- **ANTES** (14 tags): `bpa`, `coordenação`, `cordas`, `estímulo`, `free`, `labirinto`, `magnético`, `montessori`, `motricidade fina`, `painel`, `putty`, `sensorial`, `silicone`, `tátil`
- **DEPOIS** (13 tags): `bpa`, `coordenação`, `cordas`, `free`, `labirinto`, `magnético`, `montessori`, `motricidade fina`, `painel`, `putty`, `silicone`, `estímulo`, `sensorial`
- genéricas mantidas: `estímulo`, `sensorial`
- genéricas removidas: `tátil`

### 40. `mordedor-sensorial-oral-silicone-kit-10-pecas`
- **ANTES** (13 tags): `bpa`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `free`, `kit`, `mordedor`, `mordedor de silicone`, `mordedor sensorial`, `mordedor sensorial de silicone`, `Mordedor Sensorial Oral de Silicone BPA Free`, `oral`, `sensorial`, `silicone`, `silicone grau alimentar`
- **DEPOIS** (11 tags): `bpa`, `Chewelry (Colares e Pulseiras Mastigáveis Fashion)`, `free`, `kit`, `mordedor`, `mordedor de silicone`, `oral`, `silicone`, `silicone grau alimentar`, `sensorial`, `Mordedor Sensorial Oral de Silicone BPA Free`
- genéricas mantidas: `sensorial`, `Mordedor Sensorial Oral de Silicone BPA Free`
- genéricas removidas: `mordedor sensorial`, `mordedor sensorial de silicone`

### 41. `mordedor-sensorial-oral-silicone-grau-alimentar`
- **ANTES** (7 tags): `conforto sensorial`, `estímulo`, `grau alimentar`, `mordedor sensorial`, `oral`, `sensorial`, `silicone`
- **DEPOIS** (5 tags): `grau alimentar`, `oral`, `silicone`, `estímulo`, `sensorial`
- genéricas mantidas: `estímulo`, `sensorial`
- genéricas removidas: `conforto sensorial`, `mordedor sensorial`

### 42. `cobertor-ponderado-pressao-profunda-flanela`
- **ANTES** (10 tags): `cobertor`, `cobertor ponderado sensorial`, `cobertor sensorial`, `Cobertores e Produtos Ponderados de Conforto`, `conforto-tatil`, `flanela`, `Manta de Colo Ponderada`, `microfibra`, `peso-distribuido`, `ponderado`
- **DEPOIS** (9 tags): `cobertor`, `Cobertores e Produtos Ponderados de Conforto`, `flanela`, `Manta de Colo Ponderada`, `microfibra`, `peso-distribuido`, `ponderado`, `cobertor ponderado sensorial`, `cobertor sensorial`
- genéricas mantidas: `cobertor ponderado sensorial`, `cobertor sensorial`
- genéricas removidas: `conforto-tatil`

### 43. `jogo-sensorial-tatil-montessori`
- **ANTES** (5 tags): `caixa-sensorial`, `conjunto-atividades-sensoriais`, `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- **DEPOIS** (3 tags): `kit-Educacionais`, `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas mantidas: `Kits Sensoriais Educacionais`, `presentes-Sensoriais`
- genéricas removidas: `caixa-sensorial`, `conjunto-atividades-sensoriais`

### 44. `kit-bolas-sensoriais-kawaii-squishy-slow-rising`
- **ANTES** (4 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`
- **DEPOIS** (3 tags): `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `bola-sensorial`
- genéricas removidas: `bola-tatil`

### 45. `rolo-sensorial-agua-squeeze-relaxamento-verao-hidratante`
- **ANTES** (9 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `conforto`, `sensorial`, `squeeze`, `tátil`, `visual`
- **DEPOIS** (6 tags): `bola-texturizada`, `conforto`, `squeeze`, `visual`, `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `sensorial`
- genéricas removidas: `bola-sensorial`, `bola-tatil`, `tátil`

### 46. `brinquedo-relaxamento-estrela-mar-articulada-3d-decoracao`
- **ANTES** (7 tags): `apoio-sensorial`, `brinquedo-decorativo`, `estímulo`, `ferramenta-de-foco`, `Fidget Toys Educacionais`, `fidget-bem-estar`, `fidget-sensorial`
- **DEPOIS** (6 tags): `brinquedo-decorativo`, `ferramenta-de-foco`, `Fidget Toys Educacionais`, `fidget-bem-estar`, `estímulo`, `apoio-sensorial`
- genéricas mantidas: `estímulo`, `apoio-sensorial`
- genéricas removidas: `fidget-sensorial`

### 47. `bola-sensorial-engrenagem-3d-fidget-giratoria-foco`
- **ANTES** (8 tags): `bola-sensorial`, `bola-tatil`, `bola-texturizada`, `Bolas Sensoriais e Stress Balls`, `Fidget Toys Educacionais`, `fidget-sensorial`, `tátil`, `visual`
- **DEPOIS** (5 tags): `bola-texturizada`, `Fidget Toys Educacionais`, `visual`, `Bolas Sensoriais e Stress Balls`, `tátil`
- genéricas mantidas: `Bolas Sensoriais e Stress Balls`, `tátil`
- genéricas removidas: `bola-sensorial`, `bola-tatil`, `fidget-sensorial`

### 48. `varinha-sensorial-espiral-madeira-visual-relaxamento-giratorio`
- **ANTES** (4 tags): `ampulheta-sensorial`, `Brinquedos Visuais Sensoriais`, `estimulo-visual`, `tubo-sensorial-visual`
- **DEPOIS** (2 tags): `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas mantidas: `Brinquedos Visuais Sensoriais`, `ampulheta-sensorial`
- genéricas removidas: `estimulo-visual`, `tubo-sensorial-visual`

---

## Nota de método
- Radicais comparados sem acento/maiúscula (NFKD).
- `tatil` ignora ocorrências dentro de `portátil`.
- "Genérica mantida": prioriza o bucket-coleção reconhecido; nunca mantém tag com 2+ genéricos.
- Nenhuma mutation executada. Este é um PLANO para revisão humana.