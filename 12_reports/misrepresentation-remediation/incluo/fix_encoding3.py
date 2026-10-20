"""Byte-level mojibake fix - independent of source-file encoding."""
from pathlib import Path

JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")

# (bad_bytes_hex, good_bytes_hex). Order: longer-first to avoid partial replacement.
PAIRS = [
    # Lowercase accented vowels & ç
    ("c383c2a1", "c3a1"),  # á
    ("c383c2a9", "c3a9"),  # é
    ("c383c2ad", "c3ad"),  # í
    ("c383c2b3", "c3b3"),  # ó
    ("c383c2ba", "c3ba"),  # ú
    ("c383c2a3", "c3a3"),  # ã
    ("c383c2b5", "c3b5"),  # õ
    ("c383c2a7", "c3a7"),  # ç
    ("c383c2a2", "c3a2"),  # â
    ("c383c2aa", "c3aa"),  # ê
    ("c383c2ae", "c3ae"),  # î
    ("c383c2b4", "c3b4"),  # ô
    ("c383c2bb", "c3bb"),  # û
    ("c383c2a0", "c3a0"),  # à
    ("c383c2a8", "c3a8"),  # è
    ("c383c2ac", "c3ac"),  # ì
    ("c383c2b2", "c3b2"),  # ò
    ("c383c2b9", "c3b9"),  # ù
    ("c383c2bc", "c3bc"),  # ü
    ("c383c2b6", "c3b6"),  # ö
    ("c383c2a4", "c3a4"),  # ä
    ("c383c2b1", "c3b1"),  # ñ
    # Uppercase
    ("c383e2809a", "c381"),  # Á (Ã + ‚) - varies
    ("c383c281", "c381"),  # Á
    ("c383e280b0", "c389"),  # É variant
    ("c383c289", "c389"),  # É
    ("c383c28d", "c38d"),  # Í
    ("c383c293", "c393"),  # Ó
    ("c383c29a", "c39a"),  # Ú
    ("c383c282", "c382"),  # Â
    ("c383c28a", "c38a"),  # Ê
    ("c383c28e", "c38e"),  # Î
    ("c383c294", "c394"),  # Ô
    ("c383c29b", "c39b"),  # Û
    ("c383c280", "c380"),  # À
    ("c383c288", "c388"),  # È
    ("c383c283", "c383"),  # Ã (double-encoded Ã -> single)
    ("c383c295", "c395"),  # Õ
    ("c383c287", "c387"),  # Ç
    ("c383c291", "c391"),  # Ñ
    # Smart quotes & em-dashes (cp1252 over UTF-8)
    ("e282ace284a2", "e28099"),  # ’ right single
    ("e282ace2809c", "e28098"),  # ‘ left single
    ("e282ace2809d", "e2809c"),  # “ left double
    # Common single chars
    ("c282c2a0", "c2a0"),  # nbsp double
]


def hexbytes(h):
    return bytes.fromhex(h)


b = JSONL.read_bytes()
total_before = len(b)
replacements = 0
for bad, good in PAIRS:
    bb, gg = hexbytes(bad), hexbytes(good)
    cnt = b.count(bb)
    if cnt > 0:
        b = b.replace(bb, gg)
        replacements += cnt
        print(f"  {bad} -> {good}: {cnt} replacements")

JSONL.write_bytes(b)
print(f"\nTotal replacements: {replacements}")
print(f"Size before: {total_before}; after: {len(b)}")

# Final check
b = JSONL.read_bytes()
for bad_h in ["c383c2a1", "c383c2a9", "c383c2a3", "c383c2a7", "c383c2b3"]:
    print(f"Remaining {bad_h}: {b.count(hexbytes(bad_h))}")
