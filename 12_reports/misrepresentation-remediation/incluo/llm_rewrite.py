"""
LLM-based natural rewrite of Incluo Shopify products for GMC Misrepresentation remediation.

Reads 143 products from 15 GraphQL dump files, sends each to Claude (sonnet-4-6) with a
cached system prompt of remediation rules, and writes a JSONL of rewritten fields.

Resumable: re-running skips IDs already in the output file.
"""
import os
import json
import time
import sys
from pathlib import Path

try:
    from anthropic import Anthropic
except ImportError:
    print("ERROR: anthropic SDK not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(2)


# ---------- env loader ----------
def load_env(path):
    env = {}
    p = Path(path)
    if not p.exists():
        return env
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV_PATH = r"c:\projetos-incluo\commerce-agent-os\.env.local"
env = load_env(ENV_PATH)
API_KEY = env.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")
if not API_KEY:
    print(f"ERROR: ANTHROPIC_API_KEY missing in {ENV_PATH} and environment", file=sys.stderr)
    sys.exit(2)

client = Anthropic(api_key=API_KEY)


# ---------- load products ----------
INPUT_DIR = Path(
    r"C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os"
    r"\6af05995-e7d8-445f-a781-5fffe4c84057\tool-results"
)
files = sorted(INPUT_DIR.glob("*graphql_query*"))
products = []
for f in files:
    data = json.loads(f.read_text(encoding="utf-8"))
    products.extend(data["data"]["products"]["nodes"])
print(f"Loaded {len(products)} products from {len(files)} files")


# ---------- system prompt (cached) ----------
SYSTEM_PROMPT = """Voce e um especialista em compliance editorial para e-commerce brasileiro. Sua tarefa: reescrever fichas de produtos da loja Incluo (brinquedos sensoriais/fidgets) removendo TODA linguagem clinica/terapeutica, de forma a sair do bloqueio de Misrepresentation do Google Merchant Center.

# REGRAS GERAIS

Remover/substituir TODA linguagem que possa ser interpretada como:
1. Claim terapeutico
2. Claim clinico
3. Diagnostico/sintoma medico
4. Promessa de tratamento, cura, alivio ou regulacao
5. Termos clinicos

Sempre prefira linguagem funcional neutra, recreativa, tatil, descritiva, NAO clinica. O texto final deve fluir em portugues natural, NAO ser find/replace mecanico.

# TERMOS PROIBIDOS

Diagnostico clinico (REMOVER + reescrever frase): TDAH, TEA, ADHD, OCD, autismo, autista, asperger, neurodivergente, neurodivergencia
Sintoma clinico (REMOVER + reescrever): ansiedade, depressao, anti-depressao, estresse cronico, sobrecarga sensorial, hipersensibilidade
Verbos terapeuticos (REMOVER): trata, cura, alivia, alivio (de/do/da), reduz sintoma, combate, melhora condicao
Conceitos clinicos (SUBSTITUIR): autorregulacao, autorregulacao sensorial, gerenciamento de sobrecarga, integracao sensorial, processamento sensorial, regulacao emocional, organizacao emocional
Anti-* / Antistress (SUBSTITUIR): anti-estresse, antiestresse, antistress, anti-ansiedade
Outros (SUBSTITUIR): terapeutico, conforto sensorial, brinquedo terapeutico, suporte a autorregulacao

# SUBSTITUICOES SUGERIDAS (use bom senso, adapte ao contexto)

- "Ferramenta de autorregulacao" -> "Brinquedo manipulativo" / "Objeto de conforto tatil"
- "Alivio do estresse" / "Anti-estresse" -> "Para momentos de pausa" / "Conforto durante o dia"
- "Para pessoas com TDAH, TEA ou ansiedade" -> "Para quem aprecia estimulo tatil" / "Para pausas no trabalho ou estudos"
- "Auxilia na concentracao" -> "Util durante atividades de foco"
- "Gerenciamento de sobrecarga sensorial" -> "Conforto em ambientes movimentados"
- "Apoia a autorregulacao" -> "Apoia momentos de pausa"
- "Brinquedo terapeutico" -> "Brinquedo sensorial" / "Brinquedo manipulativo"
- "Suporte a autorregulacao" -> "Suporte ao foco"
- "Conforto sensorial" -> "Conforto tatil"

# FRASES A DELETAR INTEIRAS

- "Alivia a ansiedade", "Trata o estresse"
- "Para autistas", "Para pessoas com autismo"
- "Organizacao emocional"
- Qualquer claim associando produto a condicao clinica/diagnostico/sintoma/efeito terapeutico

# TITULOS (<=70 chars idealmente)

Limpar termos proibidos mantendo descritor funcional.
- "Bola Giroscopio 3D Universal - Anti-Ansiedade com Rotacao por Gravidade" -> "Bola Giroscopio 3D Universal - Rotacao por Gravidade"
- "Cubo Fidget 12 Lados - Foco, Conforto Sensorial e Autorregulacao" -> "Cubo Fidget 12 Lados - Foco e Conforto Tatil"

# HANDLE (URL slug)

Aplicar mesma limpeza. So [a-z0-9-], sem acento, sem espaco, sem hifen duplicado/trailing.
- chaveiro-sensorial-abacate-massageador-anti-estresse -> chaveiro-sensorial-abacate-massageador
- bola-giroscopio-3d-universal-anti-ansiedade-rotacao-gravidade -> bola-giroscopio-3d-universal-rotacao-gravidade

# SEO TITLE (<=70 chars) e SEO DESCRIPTION (<=160 chars)

Limpar termos. Manter chamada comercial neutra (frete gratis, etc.).

# DESCRIPTIONHTML

Reescrever em portugues natural FLUENTE, preservando:
- Tags HTML (h2, h3, p, ul, li, strong, em, img, hr)
- TODOS os atributos de tags (especialmente src, alt, href). NUNCA modifique conteudo dentro de src/href/data-*. So altere alt= se contiver termo proibido.
- Estrutura geral (titulo, paragrafos, listas de beneficios, especificacoes, indicacoes)
- Especificacoes tecnicas literais (material, tamanho, idade, etc.) - nao inventar

Remover secoes "Indicado Para" que listem condicoes clinicas; substituir por publicos neutros (criancas, adolescentes, adultos, profissionais, estudantes, etc.).

Ao final da descriptionHtml, append (se ja nao tiver):
<hr><p><em>Aviso: Este produto e um brinquedo recreativo. Nao e dispositivo medico, nao trata, cura ou alivia condicoes de saude, e nao substitui acompanhamento profissional. Em caso de necessidade clinica, consulte um profissional de saude qualificado.</em></p>

# OUTPUT

Retorne SOMENTE JSON valido (sem markdown, sem prefixo, sem comentarios), com esta estrutura exata:

{
  "title_new": "...",
  "handle_new": "...",
  "description_html_new": "...",
  "seo_title_new": "...",
  "seo_description_new": "...",
  "changes_made": ["title: removed 'anti-estresse'", "handle: shortened", "description: replaced 'autorregulacao' with 'conforto tatil'"],
  "manual_review_needed": false,
  "notes": ""
}

Se o produto INTEIRO for vendido como anti-estresse e remover tornaria value prop nonsense, setar manual_review_needed=true e explicar em notes. Mas ainda assim entregue o melhor rewrite possivel."""


# ---------- output paths ----------
OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

# Resume
done_ids = set()
if OUT_JSONL.exists():
    for line in OUT_JSONL.read_text(encoding="utf-8").splitlines():
        if line.strip():
            try:
                done_ids.add(json.loads(line)["id_gid"])
            except Exception:
                pass
    print(f"Resuming: {len(done_ids)} already done")


# ---------- usage accumulators ----------
total_input = 0
total_output = 0
total_cache_read = 0
total_cache_write = 0
t0 = time.time()


def strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        # remove first fence line
        text = text.split("\n", 1)[1] if "\n" in text else text
        # remove trailing fence
        if text.rstrip().endswith("```"):
            text = text.rstrip()[:-3]
    return text.strip()


with OUT_JSONL.open("a", encoding="utf-8") as out:
    for i, p in enumerate(products):
        if p["id"] in done_ids:
            continue
        user_msg = (
            "Reescreva este produto. Retorne SOMENTE JSON valido conforme schema "
            "(sem markdown, sem prefixo).\n\nProduto atual:\n"
            + json.dumps(p, ensure_ascii=False, indent=2)
        )
        success = False
        for attempt in range(3):
            try:
                resp = client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=8000,
                    system=[{
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }],
                    messages=[{"role": "user", "content": user_msg}],
                )
                text = strip_fences(resp.content[0].text)
                result = json.loads(text)
                # Attach old + ids
                result["id_gid"] = p["id"]
                result["id_numeric"] = p["id"].split("/")[-1]
                result["title_old"] = p.get("title")
                result["handle_old"] = p.get("handle")
                result["description_html_old"] = p.get("descriptionHtml")
                seo = p.get("seo") or {}
                result["seo_title_old"] = seo.get("title")
                result["seo_description_old"] = seo.get("description")
                out.write(json.dumps(result, ensure_ascii=False) + "\n")
                out.flush()

                u = resp.usage
                cr = getattr(u, "cache_read_input_tokens", 0) or 0
                cw = getattr(u, "cache_creation_input_tokens", 0) or 0
                total_input += u.input_tokens
                total_output += u.output_tokens
                total_cache_read += cr
                total_cache_write += cw
                print(
                    f"[{i+1}/{len(products)}] OK {result['id_numeric']} "
                    f"| in={u.input_tokens} out={u.output_tokens} "
                    f"cache_read={cr} cache_write={cw}"
                )
                success = True
                break
            except Exception as e:
                print(f"[{i+1}/{len(products)}] attempt {attempt+1} FAIL: {e}", file=sys.stderr)
                time.sleep(2 ** attempt)
        if not success:
            print(f"[{i+1}/{len(products)}] GIVE UP", file=sys.stderr)

elapsed = time.time() - t0
print("\n=== USAGE ===")
print(f"input_tokens         = {total_input}")
print(f"output_tokens        = {total_output}")
print(f"cache_read_tokens    = {total_cache_read}")
print(f"cache_write_tokens   = {total_cache_write}")
print(f"elapsed_seconds      = {elapsed:.1f}")

# Sonnet 4.6 pricing (per 1M tokens): input $3, output $15, cache_write $3.75, cache_read $0.30
cost = (
    total_input * 3.0
    + total_output * 15.0
    + total_cache_write * 3.75
    + total_cache_read * 0.30
) / 1_000_000
print(f"estimated_cost_usd   = ${cost:.4f}")
print("DONE")
