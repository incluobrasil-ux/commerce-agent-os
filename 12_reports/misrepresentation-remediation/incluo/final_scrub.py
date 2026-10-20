"""Final scrub: handle the 15 'alivia' residuals + 2 URL breaks.

- 'alivia X' / 'alivia a X' / 'alivia o X' → 'oferece conforto X' / 'oferece conforto em X'
- URL breaks: revert description_html_new to old + apply only minimal cleanup if rewrite lost URLs
"""
import json, re
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

entries = []
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        entries.append(json.loads(line))

ALIVIA_RE = re.compile(r"\balivia\b", re.IGNORECASE)
fixed_alivia = 0
fixed_urls = 0
url_lost_remaining = []

for e in entries:
    # alivia fix (only in text outside <hr><p><em>disclaimer)
    desc = e["description_html_new"]
    if ALIVIA_RE.search(desc):
        # Split disclaimer off, scrub, reattach
        m = re.search(r"<hr>\s*<p><em>[^<]*brinquedo recreativo[^<]*</em></p>\s*$", desc, flags=re.IGNORECASE | re.DOTALL)
        disclaimer = m.group(0) if m else ""
        body = desc[: m.start()] if m else desc
        # Scrub alivia in body — outside HTML tags
        parts = re.split(r"(<[^>]+>)", body)
        for i, seg in enumerate(parts):
            if not seg.startswith("<"):
                # 'alivia X' → 'oferece conforto X', case-preserving
                seg = re.sub(r"\bAlivia\b", "Oferece conforto", seg)
                seg = re.sub(r"\balivia\b", "oferece conforto", seg)
                parts[i] = seg
        body = "".join(parts)
        e["description_html_new"] = body + ("\n" + disclaimer if disclaimer else "")
        # Also scrub seo
        for k in ("seo_title_new", "seo_description_new"):
            if e.get(k) and ALIVIA_RE.search(e[k]):
                e[k] = re.sub(r"\bAlivia\b", "Oferece conforto", e[k])
                e[k] = re.sub(r"\balivia\b", "oferece conforto", e[k])
        if "alivia → oferece conforto" not in (e.get("changes_made") or []):
            e["changes_made"] = (e.get("changes_made") or []) + ["alivia → oferece conforto (final scrub)"]
        fixed_alivia += 1

    # URL break detection
    old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e["description_html_old"]))
    new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e["description_html_new"]))
    lost = old_urls - new_urls
    if lost:
        # Strategy: append a paragraph with the lost images at end of body (before disclaimer)
        imgs_html = "".join(f'<p><img src="{u}" alt="" loading="lazy"></p>' for u in sorted(lost))
        desc = e["description_html_new"]
        m = re.search(r"<hr>\s*<p><em>[^<]*brinquedo recreativo[^<]*</em></p>\s*$", desc, flags=re.IGNORECASE | re.DOTALL)
        if m:
            e["description_html_new"] = desc[: m.start()] + imgs_html + desc[m.start():]
        else:
            e["description_html_new"] = desc + imgs_html
        # Verify
        new_urls2 = set(re.findall(r'(?:src|href)="([^"]+)"', e["description_html_new"]))
        still_lost = old_urls - new_urls2
        if still_lost:
            url_lost_remaining.append((e["id_numeric"], sorted(still_lost)))
        else:
            fixed_urls += 1
        if "URL restoration" not in (e.get("changes_made") or []):
            e["changes_made"] = (e.get("changes_made") or []) + ["URL restoration: re-appended images lost during rewrite"]

# Rewrite JSONL
JSONL.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in entries) + "\n", encoding="utf-8")
print(f"Fixed alivia: {fixed_alivia}")
print(f"Fixed URL breaks: {fixed_urls}")
print(f"URL lost remaining: {len(url_lost_remaining)}")
for i, u in url_lost_remaining:
    print(f"  {i}: {u}")
