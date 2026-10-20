"""Catch the cp1252-special mojibake (where second byte was 0x80-0x9F)."""
from pathlib import Path

JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")

# When UTF-8 codepoint c3 XY (where XY is 0x80-0x9F) is misread as cp1252 byte-by-byte:
# c3 -> "Ã" (c3 83 in UTF-8 after re-encode)
# XY (0x80-0x9F) -> some special char in cp1252 -> its UTF-8 multibyte form
# Mapping table for c3 XY -> resulting cp1252 char -> UTF-8 bytes
CP1252_8X = {
    0x80: "e282ac",  # €
    0x82: "e2809a",  # ‚
    0x83: "c692",    # ƒ
    0x84: "e2809e",  # „
    0x85: "e280a6",  # …
    0x86: "e280a0",  # †
    0x87: "e280a1",  # ‡
    0x88: "cb86",    # ˆ
    0x89: "e280b0",  # ‰
    0x8A: "c5a0",    # Š
    0x8B: "e280b9",  # ‹
    0x8C: "c592",    # Œ
    0x8E: "c5bd",    # Ž
    0x91: "e28098",  # '
    0x92: "e28099",  # '
    0x93: "e2809c",  # "
    0x94: "e2809d",  # "
    0x95: "e280a2",  # •
    0x96: "e28093",  # –
    0x97: "e28094",  # —
    0x98: "cb9c",    # ˜
    0x99: "e284a2",  # ™
    0x9A: "c5a1",    # š
    0x9B: "e280ba",  # ›
    0x9C: "c593",    # œ
    0x9E: "c5be",    # ž
    0x9F: "c5b8",    # Ÿ
}

PAIRS = []
for byte, special_utf8 in CP1252_8X.items():
    # mojibake = "Ã" (c3 83) + special UTF-8; correct = c3 + byte
    bad = "c383" + special_utf8
    good = f"c3{byte:02x}"
    PAIRS.append((bad, good))

# Plus the leftover Â (c2 + 0x80-0x9F)
for byte, special_utf8 in CP1252_8X.items():
    bad = "c282" + special_utf8
    good = f"c2{byte:02x}"
    PAIRS.append((bad, good))

# Also bare cp1252 specials sometimes leak alone (no Ã prefix)
# Skip those — they may be legit Unicode

b = JSONL.read_bytes()
total = 0
for bad_h, good_h in PAIRS:
    bb = bytes.fromhex(bad_h)
    gg = bytes.fromhex(good_h)
    cnt = b.count(bb)
    if cnt > 0:
        b = b.replace(bb, gg)
        total += cnt
        print(f"  {bad_h} -> {good_h}: {cnt}")

JSONL.write_bytes(b)
print(f"Total: {total}")
