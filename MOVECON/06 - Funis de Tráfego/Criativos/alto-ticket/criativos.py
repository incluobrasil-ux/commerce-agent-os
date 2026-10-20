"""Gera os 6 criativos das campanhas de alto ticket (BMW e máquinas) na identidade MOVECON.

Uso:
  python criativos.py            # gera todos
  python criativos.py bmw-v1     # só os que começam com esse id

Mídias em midia/<slot>/ (bancos de uso comercial livre; origem em midia/CREDITOS.md).
Cada vídeo tem 4 cenas, uma por bloco de texto: foto (com zoom/deslocamento) ou trecho de clipe.
Se um arquivo de mídia faltar, a cena vira placeholder.
Saída: out/<id>.png (imagem 4:5) ou out/<id>.mp4 (vídeo 9:16, 15 s)
"""
import shutil, subprocess, sys
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from playwright.sync_api import sync_playwright

AQUI = Path(__file__).resolve().parent
RECURSOS = AQUI / "assets"                  # fontes e logo copiadas para cá: a pasta roda sozinha
FONTES, LOGO = RECURSOS / "fonts", RECURSOS / "logo" / "movecon-negativa.png"
MIDIA, OUT, TMP = AQUI / "midia", AQUI / "out", AQUI / "_tmp"
W, H, FPS, DUR = 1080, 1920, 30, 15.0
TEMPOS = [0.0, 3.6, 7.8, 11.8, DUR]     # hook · número · condições · tela final
XF = 0.3                                # duração do fade entre cenas

PLANOS = {
    902: dict(curto="R$ 902 mil", credito="R$ 902.782,97", carta="R$ 1.289.689,97",
              parcela="R$ 9.990,72", prazo="79x", primeira="R$ 49.031,20",
              bolso="R$ 322.422,49", livre="R$ 354.664,74"),
    696: dict(curto="R$ 696 mil", credito="R$ 696.214,00", carta="R$ 994.591,43",
              parcela="R$ 7.704,86", prazo="79x", primeira="R$ 37.812,18",
              bolso="R$ 248.647,85", livre="R$ 273.512,64"),
    306: dict(curto="R$ 306 mil", credito="R$ 306.028,13", carta="R$ 437.183,05",
              parcela="R$ 3.478,40", prazo="120x", primeira="R$ 16.620,70",
              bolso=None, livre="R$ 120.225,34", alt="ou 60x de R$ 6.956,80"),
}
# lance livre = lance do bolso + 10% (decisão de 15/10/2026); no plano 306, que não tem lance do bolso,
# a base é 25% da carta → 27,5%.

AVISO = ("Imagens ilustrativas. Crédito sujeito a contemplação por sorteio ou lance, sem data garantida. "
         "Sem juros, com taxa de administração. Valores de out/2026, sujeitos a alteração. "
         "A MOVECON é plataforma de consórcio; os grupos são administrados pela "
         "Alpha Administradora de Consórcio Ltda.")
AVISO_BMW = AVISO + " BMW é marca de seu titular, sem vínculo com a MOVECON."


def foto(arq, z=(1.0, 1.08), c0=(0.5, 0.5), c1=None):
    """Cena de foto: zoom z0→z1 sobre o recorte 9:16 máximo, centro c0→c1 (frações da imagem)."""
    return dict(tipo="foto", arq=arq, z=z, c0=c0, c1=c1 or c0)


def clipe(arq, ini=0.0, fx=(0.5, 0.5)):
    """Cena de vídeo: trecho a partir de `ini` s, recorte 9:16 com centro horizontal fx0→fx1."""
    return dict(tipo="clipe", arq=arq, ini=ini, fx=fx)


CRIATIVOS = [
    # ---------- Campanha 1: BMW ----------
    dict(id="bmw-v1-902", tipo="video", plano=902, kicker="CARTA DE CRÉDITO · BMW",
         hook="Tem R$ 322 mil parados?", sub="Veja como planejar uma BMW X6 sem financiamento.",
         bem="para sua BMW X6", aviso=AVISO_BMW, musica="musica/bmw-x6_brazilian-phonk.mp3", cenas=[
             foto("bmw-x6/foto-bmw-x6-073-unsplash-limpa.jpg", z=(1.0, 1.1), c0=(0.5, 0.52), c1=(0.52, 0.55)),
             foto("bmw-x6/foto-bmw-x6-003-pexels.jpg", z=(1.0, 1.0), c0=(0.30, 0.5), c1=(0.60, 0.5)),
             foto("bmw-x6/foto-bmw-x6-010-pexels.jpg", z=(1.0, 1.12), c0=(0.62, 0.5)),
             foto("bmw-x6/foto-bmw-x6-004-pexels.jpg", z=(1.12, 1.0), c0=(0.55, 0.5))]),
    dict(id="bmw-v2-696", tipo="video", plano=696, kicker="CARTA DE CRÉDITO · BMW",
         hook="Quem financia uma BMW paga juros.", sub="Quem planeja, não.",
         bem="para sua BMW X3", aviso=AVISO_BMW, musica="musica/bmw-x3_luxury-trap.mp3", cenas=[
             foto("bmw-x3/foto-bmw-x3-074-unsplash.jpg", z=(1.4, 1.52), c0=(0.5, 0.70), c1=(0.5, 0.71)),
             foto("bmw-x3/foto-bmw-x3-037-unsplash-limpa.jpg", z=(1.6, 1.45), c0=(0.5, 0.74)),
             foto("bmw-x3/foto-bmw-x3-003-pexels.jpg", z=(1.0, 1.08), c0=(0.55, 0.52)),
             foto("bmw-x3/foto-bmw-x3-036-unsplash.jpg", z=(1.06, 1.0), c0=(0.45, 0.5))]),
    dict(id="bmw-i1-306", tipo="imagem", plano=306, kicker="CARTA DE CRÉDITO · BMW",
         hook="Sua BMW Série 3 começa com um plano.", aviso=AVISO_BMW,
         foto="bmw-serie3/foto-bmw-serie3-003-pexels.jpg", pos="45% 47%"),
    # ---------- Campanha 2: Máquinas ----------
    dict(id="maq-v1-902", tipo="video", plano=902, kicker="CARTA DE CRÉDITO · MÁQUINAS",
         hook="Ainda alugando retroescavadeira?", sub="Com uma carta de crédito você monta a sua frota.",
         bem="para 2 retroescavadeiras 0 km", aviso=AVISO, musica="musica/retro_country-southern-rock.mp3", cenas=[
             clipe("retro-frota/retro-frota-064-pexels.mp4", ini=0.5, fx=(0.40, 0.46)),
             clipe("retro-frota/retro-frota-034-pexels.mp4", ini=4.0, fx=(0.58, 0.55)),
             clipe("retro-frota/retro-frota-032-pexels.mp4", ini=8.0, fx=(0.52, 0.58)),
             clipe("retro-frota/retro-frota-003-pexels.mp4", ini=2.0, fx=(0.36, 0.40))]),
    dict(id="maq-v2-696", tipo="video", plano=696, kicker="CARTA DE CRÉDITO · AGRO",
         hook="Trator de 200 cv sem juros de banco.", sub="Planeje a renovação da sua frota.",
         bem="para seu trator de 200 cv", aviso=AVISO, musica="musica/trator_country-rock.mp3", cenas=[
             clipe("trator-200cv/trator-200cv-004-pexels.mp4", ini=3.0),
             clipe("trator-200cv/trator-200cv-056-pixabay.mp4", ini=7.0, fx=(0.50, 0.60)),
             clipe("trator-200cv/trator-200cv-047-pexels.mp4", ini=0.3, fx=(0.55, 0.52)),
             clipe("trator-200cv/trator-200cv-051-pexels.mp4", ini=0.2)]),
    dict(id="maq-i1-306", tipo="imagem", plano=306, kicker="CARTA DE CRÉDITO · AGRO",
         hook="Trator 4x4 novo com parcela que cabe na safra.", aviso=AVISO,
         foto="trator-90cv/foto-trator-047-pexels.jpg", pos="60% 55%"),
]

# ----------------------------------------------------------------------------- HTML
def css():
    f = lambda nome: (FONTES / nome).as_uri()
    return f"""
@font-face{{font-family:M;src:url('{f("Montserrat-ExtraBold.ttf")}');font-weight:800}}
@font-face{{font-family:M;src:url('{f("Montserrat-Bold.ttf")}');font-weight:700}}
@font-face{{font-family:M;src:url('{f("Montserrat-SemiBold.ttf")}');font-weight:600}}
@font-face{{font-family:I;src:url('{f("Inter-Regular.ttf")}');font-weight:400}}
@font-face{{font-family:I;src:url('{f("Inter-SemiBold.ttf")}');font-weight:600}}
:root{{--azul:#1A3A66;--grafite:#0F2444;--turq:#2FC4B2;--petroleo:#2C7A8C}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:transparent;color:#fff;font-family:I,sans-serif}}
.abs{{position:absolute;left:72px;right:72px}}
.pill{{display:inline-block;font:700 30px M;letter-spacing:3px;color:var(--grafite);
      background:var(--turq);padding:12px 26px;border-radius:999px}}
.h1{{font:800 92px/1.04 M;letter-spacing:-1px;text-shadow:0 4px 30px rgba(0,0,0,.55)}}
.sub{{font:600 46px/1.25 I;margin-top:26px;text-shadow:0 3px 20px rgba(0,0,0,.6)}}
.card{{background:rgba(15,36,68,.86);border:2px solid rgba(47,196,178,.55);border-radius:36px;padding:44px 56px}}
.rot{{font:600 38px I;opacity:.85}}
.num{{font:800 150px/1 M;color:var(--turq);letter-spacing:-3px;margin:14px 0 10px}}
.bem{{font:700 48px M}}
.li{{font:600 38px/1.3 I;margin-top:18px;padding-left:52px;position:relative}}
.li:before{{content:'';position:absolute;left:0;top:14px;width:26px;height:26px;border-right:9px solid var(--turq);
          border-top:9px solid var(--turq);transform:rotate(45deg)}}
.parc{{font:800 96px/1 M}} .parc small{{font:700 48px M;opacity:.9}}
.cta{{display:inline-block;font:800 46px M;color:var(--grafite);background:var(--turq);padding:30px 54px;border-radius:999px}}
.aviso{{font:400 22px/1.4 I;opacity:.8}}
.chev{{position:absolute;width:120px;height:120px;border-right:22px solid var(--turq);border-top:22px solid var(--turq);
       transform:rotate(45deg);opacity:.9}}
"""


def pagina(corpo, w, h):
    return f"<!doctype html><meta charset=utf-8><style>{css()}</style><body style='width:{w}px;height:{h}px;position:relative;overflow:hidden'>{corpo}</body>"


def logo_tag(largura):
    return f"<img src='{LOGO.as_uri()}' style='width:{largura}px'>"


def camadas_video(c):
    """Cada camada = (png transparente 1080x1920, início, fim).
    Os valores entram já na abertura. Texto na faixa de cima (y 290–960); abaixo de 1250 a UI dos Reels cobre."""
    p = PLANOS[c["plano"]]
    alt = f"<div class=li>{p['alt']}</div>" if p.get("alt") else ""
    t = TEMPOS
    return {
        "hook": (f"<div class=abs style='top:290px'><span class=pill>{c['kicker']}</span>"
                 f"<div class=h1 style='margin-top:30px;font-size:76px'>{c['hook']}</div>"
                 f"<div class=card style='margin-top:34px;padding:34px 48px'><div class=rot>Carta de crédito de</div>"
                 f"<div class=num style='font-size:128px;margin:8px 0 6px'>{p['curto']}</div><div class=bem style='font-size:42px'>{c['bem']}</div>"
                 f"<div style='font:800 50px M;margin-top:16px'>Parcelas de {p['parcela']}</div></div></div>", t[0], t[1]),
        "cond": (f"<div class='abs card' style='top:300px'><div class=rot>Como funciona</div>"
                 f"<div class=parc style='margin-top:12px;font-size:78px;white-space:nowrap'>{p['prazo']} de {p['parcela']}</div>{alt}"
                 f"<div class=li>1ª parcela de {p['primeira']}</div>"
                 f"<div class=li>30% de lance embutido na própria carta</div>"
                 f"<div class=li>Sem juros</div></div>", t[1], t[2]),
        "lance": (f"<div class='abs card' style='top:300px'><div class=rot>Quer antecipar a liberação do crédito?</div>"
                  f"<div class=num style='font-size:112px'>{p['livre']}</div><div class=bem>de lance livre</div>"
                  f"<div class=li>+ 30% de lance embutido na própria carta</div></div>", t[2], t[3]),
        "fim": (f"<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,36,68,.94) 0%,"
                f"rgba(15,36,68,.86) 55%,rgba(15,36,68,.55) 72%,rgba(15,36,68,.9) 100%)'></div>"
                f"<div class=chev style='right:-30px;top:380px'></div><div class=chev style='right:70px;top:380px;opacity:.45'></div>"
                f"<div class=abs style='top:300px'>{logo_tag(380)}"
                f"<div class=h1 style='margin-top:90px;font-size:80px'>Simule sua carta de crédito de {p['curto']}</div>"
                f"<div class=sub style='opacity:.9;font-size:42px'>Um especialista te chama no WhatsApp e agenda uma videochamada.</div>"
                f"<div style='margin-top:48px'><span class=cta>Toque em Saiba mais</span></div></div>", t[3], DUR),
        "tag": ("<div style='position:absolute;right:40px;top:1200px;font:600 22px I;opacity:.8;"
                "text-shadow:0 2px 8px #000'>Imagem ilustrativa</div>", t[0], t[3]),
    }


def html_imagem(c, fundo, pos):
    """Peça 4:5: foto no bloco de cima (0–820) com o bem inteiro à vista; texto no bloco de baixo."""
    p = PLANOS[c["plano"]]
    extra = f" ({p['alt']})" if p.get("alt") else ""
    return (f"<img src='{fundo.as_uri()}' style='position:absolute;left:0;top:0;width:1080px;height:860px;object-fit:cover;object-position:{pos}'>"
            "<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,36,68,.65) 0%,rgba(15,36,68,0) 16%,"
            "rgba(15,36,68,0) 48%,rgba(15,36,68,.95) 63%,#0F2444 68%,#0F2444 100%)'></div>"
            f"<div class=abs style='top:44px;display:flex;justify-content:space-between;align-items:center'>"
            f"<img src='{LOGO.as_uri()}' style='height:92px'>"
            f"<span class=pill style='font-size:22px'>{c['kicker']}</span></div>"
            "<div style='position:absolute;right:76px;top:132px;font:600 18px I;opacity:.85;text-shadow:0 2px 8px #000'>Imagem ilustrativa</div>"
            f"<div class=abs style='bottom:40px'><div class=h1 style='font-size:58px'>{c['hook']}</div>"
            f"<div style='display:flex;gap:34px;align-items:flex-end;margin-top:22px;white-space:nowrap'>"
            f"<div><div class=rot style='font-size:28px'>Carta de crédito</div><div class=num style='font-size:96px;margin:4px 0 0'>{p['curto']}</div></div>"
            f"<div style='padding-bottom:10px'><div class=rot style='font-size:28px'>Parcelas de</div>"
            f"<div style='font:800 52px M'>{p['parcela']} <span style='font-size:28px'>{p['prazo']}</span></div></div></div>"
            f"<div style='font:600 26px/1.35 I;margin-top:14px;opacity:.92'>1ª parcela de {p['primeira']}{extra} · 30% de lance embutido · Sem juros</div>"
            f"<div style='font:700 28px/1.3 M;margin-top:10px'>Lance livre: <span style='color:var(--turq)'>{p['livre']}</span> para antecipar a liberação do crédito</div>"
            f"<div style='margin-top:26px'><span class=cta style='font-size:34px;padding:20px 40px'>Simule sua carta</span></div>"
            "</div>")

# ----------------------------------------------------------------------------- mídia
def placeholder(nome, w, h):
    TMP.mkdir(exist_ok=True)
    arq = TMP / f"ph-{Path(nome).stem}-{w}x{h}.png"
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=(int(44 - 20 * t), int(122 - 70 * t), int(140 - 60 * t)))
    fnt = ImageFont.truetype(str(FONTES / "Montserrat-Bold.ttf"), 40)
    d.text((w // 2, h // 2), f"FALTA MÍDIA\n{nome}", font=fnt, fill=(255, 255, 255), anchor="mm", align="center")
    img.save(arq)
    return arq


def ff(*args, **kw):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True, **kw)


def segmento_foto(cena, dur, saida):
    """Renderiza a foto quadro a quadro (recorte com coordenadas fracionárias = movimento suave)."""
    arq = MIDIA / cena["arq"]
    img = Image.open(arq if arq.exists() else placeholder(cena["arq"], W, H)).convert("RGB")
    iw, ih = img.size
    # maior recorte 9:16 que cabe na imagem
    cw, ch = (ih * W / H, ih) if iw / ih > W / H else (iw, iw * H / W)
    n = round(dur * FPS)
    proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                             "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast",
                             "-crf", "16", "-pix_fmt", "yuv420p", str(saida)], stdin=subprocess.PIPE)
    (z0, z1), (x0, y0), (x1, y1) = cena["z"], cena["c0"], cena["c1"]
    for i in range(n):
        k = i / max(n - 1, 1)
        k = k * k * (3 - 2 * k)                        # ease in-out
        z = z0 + (z1 - z0) * k
        w, h = cw / z, ch / z
        cx = min(max((x0 + (x1 - x0) * k) * iw, w / 2), iw - w / 2)
        cy = min(max((y0 + (y1 - y0) * k) * ih, h / 2), ih - h / 2)
        quadro = img.resize((W, H), Image.BICUBIC, box=(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
        proc.stdin.write(quadro.tobytes())
    proc.stdin.close()
    proc.wait()


def segmento_clipe(cena, dur, saida):
    arq = MIDIA / cena["arq"]
    if not arq.exists():
        return segmento_foto(dict(tipo="foto", arq=cena["arq"], z=(1, 1), c0=(.5, .5), c1=(.5, .5)), dur, saida)
    fx0, fx1 = cena["fx"]
    ff("-ss", str(cena["ini"]), "-t", f"{dur:.3f}", "-i", str(arq), "-an", "-vf",
       f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
       f"crop={W}:{H}:x='(iw-{W})*({fx0}+({fx1}-{fx0})*t/{dur:.3f})':y='(ih-{H})/2',"
       "eq=contrast=1.05:saturation=1.08:brightness=-0.01",
       "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", str(saida))


def montar_base(c, pasta):
    """4 cenas, cada uma do tamanho do seu bloco de texto (+XF para o fade), unidas com xfade."""
    segs = []
    for i, cena in enumerate(c["cenas"]):
        dur = TEMPOS[i + 1] - TEMPOS[i] + (XF if i < len(c["cenas"]) - 1 else 0)
        s = pasta / f"cena{i}.mp4"
        (segmento_foto if cena["tipo"] == "foto" else segmento_clipe)(cena, dur, s)
        segs.append((s, dur))
    entradas, fil, atual, acum = [], [], "0:v", segs[0][1]
    for s, _ in segs:
        entradas += ["-i", str(s)]
    for i in range(1, len(segs)):
        off = acum - XF
        fil.append(f"[{atual}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{i}]")
        atual, acum = f"x{i}", acum + segs[i][1] - XF
    base = pasta / "base.mp4"
    ff(*entradas, "-filter_complex", ";".join(fil), "-map", f"[{atual}]", "-t", str(DUR),
       "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", str(base))
    return base


def trecho_musica(arq):
    """Início do trecho de 15 s com mais energia, com bônus para quem começa numa entrada forte (drop)."""
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(arq), "-ac", "1", "-ar", "8000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, dtype=np.float32)
    passo = 2000                                         # 0,25 s
    rms = np.sqrt(np.add.reduceat(x * x, np.arange(0, len(x), passo)) / passo)
    jan, ant = int(DUR / 0.25), 8                        # 15 s · 2 s antes do início
    melhor, ini = -1.0, 0
    for i in range(ant, len(rms) - jan):
        nota = rms[i:i + jan].mean() + 0.6 * max(0.0, rms[i:i + 8].mean() - rms[i - ant:i].mean())
        if nota > melhor:
            melhor, ini = nota, i
    return ini * 0.25


def render_video(c, pg):
    pasta = TMP / c["id"]
    pasta.mkdir(parents=True, exist_ok=True)
    camadas = []
    for nome, (corpo, ini, fim) in camadas_video(c).items():
        html = pasta / f"{nome}.html"
        html.write_text(pagina(corpo, W, H), encoding="utf-8")
        pg.set_viewport_size({"width": W, "height": H})
        pg.goto(html.as_uri())
        pg.wait_for_timeout(300)
        png = pasta / f"{nome}.png"
        pg.screenshot(path=str(png), omit_background=True)
        camadas.append((png, ini, fim))

    base = montar_base(c, pasta)

    # degradê para leitura do texto: forte em cima (onde fica o texto), leve embaixo
    sombra = TMP / "sombra-texto-topo.png"
    if not sombra.exists():
        s = Image.new("RGBA", (W, H))
        d = ImageDraw.Draw(s)
        for y in range(H):
            a = 205 * max(0.0, 1 - max(0, y - 250) / 750) + 170 * max(0.0, (y - 1300) / 620)
            d.line([(0, y), (W, y)], fill=(15, 36, 68, int(min(a, 225))))
        s.save(sombra)

    entradas = ["-i", str(base), "-loop", "1", "-t", str(DUR), "-i", str(sombra)]
    fil = ["[0:v][1:v]overlay=0:0[b0]"]
    atual = "b0"
    for i, (png, ini, fim) in enumerate(camadas, start=2):
        entradas += ["-loop", "1", "-t", str(DUR), "-i", str(png)]
        fo = max(fim - 0.3, ini)
        # o que abre em t=0 já aparece pronto: o 1º quadro vira a capa do vídeo no feed
        entra = f",fade=t=in:st={ini}:d=0.3:alpha=1" if ini > 0 else ""
        fil.append(f"[{i}:v]format=rgba{entra}"
                   + (f",fade=t=out:st={fo}:d=0.3:alpha=1" if fim < DUR else "") + f"[l{i}]")
        sobe = f"'if(lt(t,{ini}+0.4),40*(1-(t-{ini})/0.4),0)'" if ini > 0 else "0"
        fil.append(f"[{atual}][l{i}]overlay=x=0:y={sobe}:enable='between(t,{ini},{fim})'[b{i}]")
        atual = f"b{i}"
    saida = OUT / f"{c['id']}.mp4"
    audio = []
    trilha = MIDIA / c.get("musica", "")
    if c.get("musica") and trilha.exists():
        ini_m = trecho_musica(trilha)
        entradas += ["-ss", f"{ini_m:.2f}", "-t", str(DUR), "-i", str(trilha)]
        fil.append(f"[{len(camadas) + 2}:a]afade=t=in:d=0.05,afade=t=out:st={DUR - 1.2}:d=1.2,"
                   "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aud]")
        audio = ["-map", "[aud]", "-c:a", "aac", "-b:a", "192k"]
    ff(*entradas, "-filter_complex", ";".join(fil), "-map", f"[{atual}]", *audio, "-t", str(DUR), "-r", str(FPS),
       "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(saida))
    faltando = [cn["arq"] for cn in c["cenas"] if not (MIDIA / cn["arq"]).exists()]
    return saida, ("falta: " + ", ".join(faltando)) if faltando else "ok"


def render_imagem(c, pg):
    arq = MIDIA / c["foto"]
    fundo = arq if arq.exists() else placeholder(c["foto"], 1080, 860)
    pasta = TMP / c["id"]
    pasta.mkdir(parents=True, exist_ok=True)
    html = pasta / "peca.html"
    html.write_text(pagina(html_imagem(c, fundo, c.get("pos", "50% 50%")), 1080, 1350), encoding="utf-8")
    pg.set_viewport_size({"width": 1080, "height": 1350})
    pg.goto(html.as_uri())
    pg.wait_for_timeout(400)
    saida = OUT / f"{c['id']}.png"
    pg.screenshot(path=str(saida))
    return saida, "ok" if arq.exists() else f"falta: {c['foto']}"


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""
    for p in (OUT, TMP):
        p.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel="chrome")
        pg = b.new_page()
        for c in CRIATIVOS:
            if not c["id"].startswith(filtro):
                continue
            saida, status = (render_video if c["tipo"] == "video" else render_imagem)(c, pg)
            print(f"{c['id']:<12} {status:<6} -> {saida.name}")
        b.close()


if __name__ == "__main__":
    main()
