"""
Sistema de design MOVECON para materiais em PDF.

Fonte canonica: Manual da Marca v1.0 (Edicao 2026) -> `01 - Empresa/Identidade & Marca.md`.
Regra de compliance: `01 - Empresa/Posicionamento & Credibilidade.md`.

Uso:
    from movecon_brand import *
    c = new_deck("saida.pdf")      # slide 16:9  (1440 x 810)
    c = new_a4("saida.pdf")        # A4 retrato  (595 x 842)
"""

import os
from reportlab.pdfgen import canvas as _canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(BASE, "assets", "fonts")
LOGOS = os.path.join(BASE, "assets", "logo")
IMGS = os.path.join(BASE, "assets", "img")

# ---------------------------------------------------------------- paleta
NAVY = HexColor("#1A3A66")     # Azul MOVECON - institucional
TURQ = HexColor("#2FC4B2")     # Turquesa - acento de movimento
PETRO = HexColor("#2C7A8C")    # Petroleo - secundaria
GRAFITE = HexColor("#0F2444")  # Azul Grafite - fundos escuros
OFFWHITE = HexColor("#F7F8F9")
WHITE = HexColor("#FFFFFF")
CINZA = HexColor("#5A6675")    # texto de apoio (derivado do navy)
CINZA_CLARO = HexColor("#E3E7EC")

# Turquesa REPROVA contraste sobre branco (2,2:1) - nunca como texto em fundo claro.
# Botao/CTA = fundo turquesa + texto GRAFITE (7,1:1).

# ---------------------------------------------------------------- medidas
SLIDE_W, SLIDE_H = 1440, 810
A4_W, A4_H = 595.28, 841.89

# ---------------------------------------------------------------- fontes
_REG = {
    "Montserrat": "Montserrat-Regular.ttf",
    "Montserrat-Md": "Montserrat-Medium.ttf",
    "Montserrat-Sb": "Montserrat-SemiBold.ttf",
    "Montserrat-Bd": "Montserrat-Bold.ttf",
    "Montserrat-Xb": "Montserrat-ExtraBold.ttf",
    "Inter": "Inter-Regular.ttf",
    "Inter-Md": "Inter-Medium.ttf",
    "Inter-Sb": "Inter-SemiBold.ttf",
    "Inter-Bd": "Inter-Bold.ttf",
}


def register_fonts():
    for name, fn in _REG.items():
        path = os.path.join(FONTS, fn)
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name, path))


register_fonts()

H1, H2, BODY, SMALL = "Montserrat-Bd", "Montserrat-Sb", "Inter", "Inter-Md"


# ---------------------------------------------------------------- canvas
def new_deck(path):
    c = _canvas.Canvas(path, pagesize=(SLIDE_W, SLIDE_H))
    c.setTitle(os.path.splitext(os.path.basename(path))[0])
    c.setAuthor("MOVECON Consorcios")
    return c


def new_a4(path):
    c = _canvas.Canvas(path, pagesize=(A4_W, A4_H))
    c.setTitle(os.path.splitext(os.path.basename(path))[0])
    c.setAuthor("MOVECON Consorcios")
    return c


# ---------------------------------------------------------------- helpers
def vgrad(c, x, y, w, h, cor_base, cor_topo):
    """Degrade vertical liso (shading nativo do PDF - sem bandas)."""
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.linearGradient(x, y, x, y + h, [cor_base, cor_topo], extend=True)
    c.restoreState()


def _alpha(c, a):
    # ATENCAO: sempre chamar DEPOIS de setFillColor - setFillColor reseta o alpha.
    c.setFillAlpha(a)
    c.setStrokeAlpha(a)


def _a_of(color, alpha):
    """Combina o alpha do proprio Color com o alpha pedido."""
    return alpha * getattr(color, "alpha", 1.0)


def rect(c, x, y, w, h, color, alpha=1.0):
    c.saveState()
    c.setFillColor(color)
    _alpha(c, _a_of(color, alpha))
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()


def text(c, x, y, s, font=BODY, size=14, color=NAVY, align="l", alpha=1.0, tracking=0):
    c.saveState()
    c.setFillColor(color)
    alpha = _a_of(color, alpha)
    _alpha(c, alpha)
    c.setFont(font, size)
    if tracking:
        w = pdfmetrics.stringWidth(s, font, size) + tracking * max(len(s) - 1, 0)
        tx = x - w / 2 if align == "c" else (x - w if align == "r" else x)
        to = c.beginText(tx, y)
        to.setFont(font, size)
        to.setFillColor(color)
        c.setFillAlpha(alpha)
        to.setCharSpace(tracking)
        to.textOut(s)
        c.drawText(to)
    elif align == "c":
        c.drawCentredString(x, y, s)
    elif align == "r":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)
    c.restoreState()


def wrap(c, s, font, size, max_w):
    """Quebra `s` em linhas que cabem em max_w."""
    out, line = [], ""
    for word in s.split():
        test = (line + " " + word).strip()
        if pdfmetrics.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            if line:
                out.append(line)
            line = word
    if line:
        out.append(line)
    return out


def paragraph(c, x, y, s, font=BODY, size=15, color=CINZA, max_w=600, leading=None,
              align="l", alpha=1.0):
    """Desenha paragrafo com quebra automatica. Retorna o y da ultima linha."""
    leading = leading or size * 1.65
    for i, line in enumerate(wrap(c, s, font, size, max_w)):
        ly = y - i * leading
        text(c, x, ly, line, font, size, color, align, alpha)
    return y - (len(wrap(c, s, font, size, max_w)) - 1) * leading


def paragraph_h(c, s, font, size, max_w, leading=None):
    """Altura que o paragrafo vai ocupar."""
    leading = leading or size * 1.65
    return max(0, (len(wrap(c, s, font, size, max_w)) - 1)) * leading


# ---------------------------------------------------------------- grafismo
def chevron(c, x, y, w, h, t, color, alpha=1.0):
    """Um chevron modular (^) derivado do simbolo do M."""
    c.saveState()
    c.setFillColor(color)
    _alpha(c, alpha)
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x + w / 2, y + h)
    p.lineTo(x + w, y)
    p.lineTo(x + w - t, y)
    p.lineTo(x + w / 2, y + h - t * (2 * h / w))
    p.lineTo(x + t, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()


def chevron_field(c, x, y, w, h, color, cell=34, base_alpha=0.16, direction="tl",
                  clip=True):
    """
    Campo de chevrons modulares com fade - textura institucional da marca.
    `direction` define de onde o padrao e mais denso: tl, tr, bl, br.
    Regra do manual: baixa opacidade, cor unica, nunca sob texto longo.
    """
    c.saveState()
    if clip:
        p = c.beginPath()
        p.rect(x, y, w, h)
        c.clipPath(p, stroke=0, fill=0)
    cols = int(w / cell) + 2
    rows = int(h / cell) + 2
    for i in range(cols):
        for j in range(rows):
            fx = i / max(cols - 1, 1)          # 0 = esquerda, 1 = direita
            fy = j / max(rows - 1, 1)          # 0 = base,     1 = topo
            # distancia ate o canto de origem (0 = no canto, 1 = oposto)
            if direction == "tl":
                d = max(fx, 1 - fy)
            elif direction == "tr":
                d = max(1 - fx, 1 - fy)
            elif direction == "bl":
                d = max(fx, fy)
            else:                               # br
                d = max(1 - fx, fy)
            a = base_alpha * ((1 - min(1.0, d)) ** 1.5)
            if a < 0.006:
                continue
            cw = cell * 0.52
            chevron(c, x + i * cell, y + j * cell, cw, cw * 0.72, cw * 0.30, color, a)
    c.restoreState()


def modular_bars(c, x, y, scale, color_a, color_b, color_c, alpha=1.0):
    """Tres barras ascendentes do simbolo - usado como marca d'agua grafica."""
    c.saveState()
    for i, col in enumerate([color_a, color_b, color_c]):
        c.setFillColor(col)
        _alpha(c, alpha)
        bx = x + i * 0.42 * scale
        by = y + i * 0.30 * scale
        p = c.beginPath()
        p.moveTo(bx, by)
        p.lineTo(bx + 0.62 * scale, by + 0.44 * scale)
        p.lineTo(bx + 0.62 * scale, by + 0.70 * scale)
        p.lineTo(bx, by + 0.26 * scale)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    c.restoreState()


# ---------------------------------------------------------------- logo
def logo(c, x, y, height=None, width=None, variant="principal", anchor="bl"):
    """
    Aplica o ARQUIVO ORIGINAL da logo (nunca redesenhada).
    variant: principal | negativa | mono-navy | simbolo | simbolo-negativa
    anchor:  bl | bc | br | tl | tc | tr | c
    """
    files = {
        "principal": "movecon-principal.png",
        "negativa": "movecon-negativa.png",
        "mono-navy": "movecon-mono-navy.png",
        "simbolo": "simbolo-principal.png",
        "simbolo-negativa": "simbolo-negativa.png",
        "simbolo-mono": "simbolo-mono-navy.png",
    }
    path = os.path.join(LOGOS, files[variant])
    img = ImageReader(path)
    iw, ih = img.getSize()
    if height:
        w, h = height * iw / ih, height
    elif width:
        w, h = width, width * ih / iw
    else:
        raise ValueError("informe height ou width")

    ax, ay = anchor[0], (anchor[1] if len(anchor) > 1 else "l")
    if anchor == "c":
        px, py = x - w / 2, y - h / 2
    else:
        py = y if ax == "b" else (y - h if ax == "t" else y - h / 2)
        px = x if ay == "l" else (x - w if ay == "r" else x - w / 2)
    c.drawImage(img, px, py, w, h, mask="auto")
    return w, h


# ---------------------------------------------------------------- imagens
def has_img(slot):
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        if os.path.exists(os.path.join(IMGS, slot + ext)):
            return os.path.join(IMGS, slot + ext)
    return None


def image_cover(c, slot, x, y, w, h, fallback=None):
    """
    Desenha a imagem do slot recortada em 'cover'. Se o arquivo ainda nao
    existir (imagem do Nano Banana pendente), chama `fallback(c,x,y,w,h)`.
    Retorna True se usou imagem real.
    """
    path = has_img(slot)
    if not path:
        if fallback:
            fallback(c, x, y, w, h)
        return False
    from PIL import Image
    im = Image.open(path).convert("RGB")
    iw, ih = im.size
    target = w / h
    src = iw / ih
    if src > target:                       # imagem mais larga -> corta laterais
        nw = int(ih * target)
        off = (iw - nw) // 2
        im = im.crop((off, 0, off + nw, ih))
    else:                                  # mais alta -> corta topo/base
        nh = int(iw / target)
        off = (ih - nh) // 2
        im = im.crop((0, off, iw, off + nh))
    c.drawImage(ImageReader(im), x, y, w, h, mask=None)
    return True


def scrim(c, x, y, w, h, color=GRAFITE, a0=0.92, a1=0.0, steps=90, horizontal=True):
    """Degrade de escurecimento para garantir contraste do texto sobre foto."""
    c.saveState()
    for i in range(steps):
        f = i / (steps - 1)
        a = a0 + (a1 - a0) * f
        if a <= 0.004:
            continue
        c.setFillColor(color)
        _alpha(c, a)
        if horizontal:
            c.rect(x + w * f, y, w / steps + 1, h, fill=1, stroke=0)
        else:
            c.rect(x, y + h * f, w, h / steps + 1, fill=1, stroke=0)
    c.restoreState()


def placeholder_bg(c, x, y, w, h, dark=True):
    """Fundo procedural usado enquanto a imagem gerada nao chega."""
    if dark:
        vgrad(c, x, y, w, h, NAVY, GRAFITE)
        chevron_field(c, x, y, w, h, TURQ, cell=52, base_alpha=0.09, direction="br")
    else:
        vgrad(c, x, y, w, h, CINZA_CLARO, HexColor("#EDEFF2"))
        chevron_field(c, x, y, w, h, NAVY, cell=30, base_alpha=0.16, direction="br")


# ---------------------------------------------------------------- blocos
def slide_bg(c, tone="claro"):
    if tone == "claro":
        rect(c, 0, 0, SLIDE_W, SLIDE_H, OFFWHITE)
        chevron_field(c, SLIDE_W - 300, SLIDE_H - 250, 300, 250, NAVY,
                      cell=28, base_alpha=0.075, direction="tr")
    else:
        vgrad(c, 0, 0, SLIDE_W, SLIDE_H, HexColor("#16305A"), GRAFITE)
        chevron_field(c, SLIDE_W - 340, SLIDE_H - 300, 340, 300, TURQ, cell=30,
                      base_alpha=0.20, direction="tr")


def slide_title(c, titulo, eyebrow=None, tone="claro", x=96, y=None, max_w=None):
    """Cabecalho padrao de slide. Retorna o y onde o conteudo pode comecar."""
    y = y or SLIDE_H - 118
    tcolor = NAVY if tone == "claro" else WHITE
    ecolor = PETRO if tone == "claro" else TURQ
    if eyebrow:
        text(c, x, y + 46, eyebrow.upper(), "Montserrat-Sb", 12.5, ecolor, tracking=2.4)
    lines = wrap(c, titulo, H1, 40, max_w or (SLIDE_W - x - 380))
    for i, ln in enumerate(lines):
        text(c, x, y - i * 50, ln, H1, 40, tcolor)
    last = y - (len(lines) - 1) * 50
    rect(c, x, last - 30, 74, 5, TURQ)
    return last - 84


def slide_footer(c, num=None, tone="claro"):
    lc = CINZA_CLARO if tone == "claro" else Color(1, 1, 1, 0.16)
    rect(c, 96, 74, SLIDE_W - 192, 1, lc)
    logo(c, 96, 34, height=30, variant="principal" if tone == "claro" else "negativa")
    txt = NAVY if tone == "claro" else WHITE
    a = 1.0 if tone == "claro" else 0.75
    text(c, SLIDE_W - 96, 44, "moveconconsorcio.com", SMALL, 12.5, txt, "r", a)
    if num is not None:
        text(c, SLIDE_W / 2, 44, f"{num:02d}", "Montserrat-Sb", 12, txt, "c",
             0.55 if tone == "claro" else 0.55)


def card(c, x, y, w, h, titulo, corpo, num=None, tone="claro", icon_color=TURQ):
    """Card de conteudo com numero/acento."""
    bg = WHITE if tone == "claro" else Color(1, 1, 1, 0.06)
    rect(c, x, y, w, h, bg)
    rect(c, x, y, 5, h, icon_color)
    tx = x + 34
    ty = y + h - 46
    if num:
        text(c, tx, ty, num, "Montserrat-Xb", 26, icon_color if tone == "escuro" else PETRO)
        ty -= 40
    tcolor = NAVY if tone == "claro" else WHITE
    lines = wrap(c, titulo, H2, 19, w - 68)
    for i, ln in enumerate(lines):
        text(c, tx, ty - i * 26, ln, H2, 19, tcolor)
    ty -= (len(lines) - 1) * 26 + 34
    paragraph(c, tx, ty, corpo, BODY, 13.5,
              CINZA if tone == "claro" else Color(1, 1, 1, 0.78), w - 68, 21)


def pill(c, x, y, s, bg=TURQ, fg=GRAFITE, font="Montserrat-Sb", size=12.5, pad=16, h=32):
    w = pdfmetrics.stringWidth(s, font, size) + pad * 2
    c.saveState()
    c.setFillColor(bg)
    c.roundRect(x, y, w, h, h / 2, fill=1, stroke=0)
    c.restoreState()
    text(c, x + w / 2, y + h / 2 - size * 0.36, s, font, size, fg, "c")
    return w


def bullet(c, x, y, s, max_w, size=14, color=CINZA, dot=TURQ, tone="claro"):
    """Item de lista com marcador chevron. Retorna o y da proxima linha."""
    chevron(c, x, y + 3, 11, 8, 3.4, dot)
    lines = wrap(c, s, BODY, size, max_w - 26)
    for i, ln in enumerate(lines):
        text(c, x + 26, y, ln, BODY, size, color) if i == 0 else \
            text(c, x + 26, y - i * size * 1.5, ln, BODY, size, color)
    return y - (len(lines) - 1) * size * 1.5


def disclaimer(c, x, y, s, w, tone="claro", size=10.5):
    col = CINZA if tone == "claro" else Color(1, 1, 1, 0.6)
    return paragraph(c, x, y, s, BODY, size, col, w, size * 1.6)


# ---------------------------------------------------------------- compliance
COMPLIANCE = (
    "MOVECON CONSORCIOS - MOVECON Intermediacoes Financeiras Ltda - CNPJ 67.559.635/0001-02. "
    "Plataforma de consorcio. Os grupos sao administrados pela Alpha Administradora de "
    "Consorcio Ltda., autorizada pelo Banco Central do Brasil (Cert. BCB 03/100/213/88 - "
    "CNPJ 90.982.679/0001-54). Consorcio e regido pela Lei 11.795/2008. Nao ha garantia de "
    "contemplacao em prazo determinado - a contemplacao ocorre por sorteio ou lance, em "
    "assembleia. Este material tem carater informativo e nao constitui oferta ou promessa "
    "de resultado."
)

ENDERECO = "Av. Rosa Cruz, 926 - Candeias - Vitoria da Conquista/BA - CEP 45.028-045"
