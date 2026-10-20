# -*- coding: utf-8 -*-
"""
MOVECON - Apresentacao Institucional (representantes e parceiros)
Deck 16:9 - 1440 x 810 - 11 paginas.

Referencia de estrutura: "Clientes - ADECON CONSORCIOS.pdf" (deck 16:9).
Identidade: Manual da Marca MOVECON v1.0.
Compliance: Posicionamento & Credibilidade.md - MOVECON e PLATAFORMA, a Alpha e a
administradora autorizada pelo Bacen. Nunca inverter.

TERMO "WHITE LABEL": permitido NESTE material por ser peca B2B (representantes e
parceiros) - regra de escopo por audiencia definida em 26/07/2026, em
"05 - Site/docs/01-compliance.md". Sempre com a atribuicao na mesma tela: marca e
venda = MOVECON, administracao dos grupos = Alpha. PROIBIDO no site publico, em
peca ao consumidor final e em qualquer texto legal/disclaimer. NUNCA colar o termo
em "administradora" referida a MOVECON.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "brand"))
from movecon_brand import *  # noqa

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)
PDF = os.path.join(OUT, "MOVECON - Apresentacao Institucional.pdf")

c = new_deck(PDF)
W, H = SLIDE_W, SLIDE_H
M = 96


def dark_ph(cv, x, y, w, h):
    placeholder_bg(cv, x, y, w, h, dark=True)


def light_ph(cv, x, y, w, h):
    placeholder_bg(cv, x, y, w, h, dark=False)


# ============================================================ 01 - CAPA
image_cover(c, "01-capa", 0, 0, W, H, fallback=dark_ph)
scrim(c, 0, 0, W * 0.78, H, GRAFITE, 0.93, 0.0)
scrim(c, 0, 0, W, 150, GRAFITE, 0.75, 0.0, horizontal=False)

logo(c, M, 470, height=168, variant="negativa")

text(c, M, 386, "APRESENTAÇÃO", H1, 52, WHITE)
text(c, M, 326, "INSTITUCIONAL", H1, 52, WHITE)
rect(c, M, 292, 88, 5, TURQ)
text(c, M, 244, "Representantes e Parceiros", BODY, 21, WHITE, alpha=0.82)

text(c, M, 128, "Consórcio com segurança começa aqui.", "Montserrat-Md", 15, TURQ)

rect(c, M, 96, W - M * 2, 1, WHITE, 0.18)
text(c, M, 66, "moveconconsorcio.com  ·  @moveconconsorcio", SMALL, 12.5, WHITE, alpha=0.7)
text(c, W - M, 66, "Edição 2026", SMALL, 12.5, WHITE, "r", 0.7)

c.showPage()

# ============================================================ 02 - QUEM SOMOS
slide_bg(c, "escuro")
y = slide_title(c, "Quem somos", "A MOVECON", "escuro")

txt = ("A MOVECON é uma plataforma de consórcio criada para levar planejamento "
       "financeiro de verdade a mais brasileiros. Nascemos com um propósito claro: "
       "abrir o acesso a imóveis, veículos, máquinas e serviços por um caminho "
       "seguro, transparente e sem juros.")
y2 = paragraph(c, M, y, txt, BODY, 16.5, Color(1, 1, 1, 0.86), 700, 28)

txt2 = ("Operamos em modelo white label: a marca, a rede comercial e o atendimento "
        "são MOVECON; a administração dos grupos é da Alpha Administradora de "
        "Consórcio Ltda., autorizada pelo Banco Central do Brasil. Na prática, o "
        "representante vende com o apoio de uma marca sólida e a segurança de uma "
        "estrutura regulada — e o cliente sabe exatamente quem faz o quê.")
y3 = paragraph(c, M, y2 - 46, txt2, BODY, 16.5, Color(1, 1, 1, 0.86), 700, 28)

stats = [("12,76 mi", "de participantes ativos\nno consórcio brasileiro"),
         ("+R$ 500 bi", "em créditos comercializados\npelo sistema"),
         ("Lei 11.795", "regulamenta o consórcio\nno Brasil desde 2008")]
sx = M
for val, lab in stats:
    text(c, sx, y3 - 96, val, "Montserrat-Xb", 34, TURQ)
    for i, ln in enumerate(lab.split("\n")):
        text(c, sx, y3 - 132 - i * 20, ln, BODY, 12.5, Color(1, 1, 1, 0.6))
    sx += 250

modular_bars(c, W - 400, 250, 300, TURQ, PETRO, WHITE, 0.10)
disclaimer(c, M, 118, "Dados do mercado: ABAC — Associação Brasileira de Administradoras "
                      "de Consórcios, balanço 2025.", 700, "escuro")
slide_footer(c, 2, "escuro")
c.showPage()

# ============================================================ 03 - COMO FUNCIONA
slide_bg(c, "claro")
y = slide_title(c, "Como funciona o consórcio", "O modelo", "claro")
paragraph(c, M, y + 14, "Compra programada, em grupo, sem juros. Um sistema regulado "
                        "por lei e fiscalizado pelo Banco Central.",
          BODY, 16, CINZA, 820, 26)

passos = [
    ("01", "O grupo se forma",
     "Pessoas com o mesmo objetivo se reúnem em um grupo administrado. Cada uma "
     "escolhe o valor do crédito que pretende usar."),
    ("02", "Você paga a parcela",
     "A parcela é composta pelo fundo comum, taxa de administração e fundo de "
     "reserva. Não há juros — é a diferença central para o financiamento."),
    ("03", "Assembleia mensal",
     "Todo mês o grupo se reúne em assembleia. É ali que as contemplações "
     "acontecem, com registro e prestação de contas."),
    ("04", "Contemplação",
     "Por sorteio ou por lance. Contemplado, o consorciado recebe a carta de "
     "crédito e escolhe o bem que quiser dentro do segmento."),
]
cw = (W - M * 2 - 3 * 26) / 4
for i, (n, t, b) in enumerate(passos):
    card(c, M + i * (cw + 26), 258, cw, 266, t, b, n)

disclaimer(c, M, 200, "A contemplação ocorre por sorteio ou lance em assembleia. Não há "
                      "garantia de contemplação em prazo determinado.", 900)
slide_footer(c, 3)
c.showPage()

# ============================================================ 04 - ALPHA / BACEN
image_cover(c, "04-alpha", 0, 0, W, H, fallback=dark_ph)
scrim(c, 0, 0, W * 0.82, H, GRAFITE, 0.94, 0.0)
y = slide_title(c, "Administrado pela Alpha", "Segurança e regulação", "escuro")

paragraph(c, M, y + 10,
          "A MOVECON opera em modelo white label: a marca, a venda e o relacionamento "
          "são nossos; a administração dos grupos é da Alpha Administradora de "
          "Consórcio Ltda., autorizada pelo Banco Central do Brasil a operar consórcios.",
          BODY, 17, Color(1, 1, 1, 0.88), 720, 29)

chevron(c, M, 525, 14, 10, 4.2, TURQ)
_selo = "Modelo white label"
text(c, M + 30, 522, _selo, "Montserrat-Sb", 15, TURQ)
_sw = pdfmetrics.stringWidth(_selo, "Montserrat-Sb", 15)
text(c, M + 30 + _sw + 14, 522, "— a marca é MOVECON; a estrutura regulada é da Alpha.",
     BODY, 14, Color(1, 1, 1, 0.75))

box_y = 300
rect(c, M, box_y, 720, 190, Color(1, 1, 1, 0.07))
rect(c, M, box_y, 5, 190, TURQ)
text(c, M + 36, box_y + 146, "Alpha Administradora de Consórcio Ltda.",
     H2, 20, WHITE)
linhas = [
    ("Autorização", "Banco Central do Brasil — Cert. BCB 03/100/213/88"),
    ("CNPJ", "90.982.679/0001-54"),
    ("Marco legal", "Lei nº 11.795/2008 — Sistema de Consórcios"),
]
ly = box_y + 106
for rot, val in linhas:
    text(c, M + 36, ly, rot.upper(), "Montserrat-Sb", 11, TURQ, tracking=1.6)
    text(c, M + 190, ly, val, BODY, 14, Color(1, 1, 1, 0.86))
    ly -= 32

text(c, M, 236, "O que isso significa na prática", "Montserrat-Sb", 15, TURQ)
paragraph(c, M, 208,
          "White label significa isto: a marca e a venda são MOVECON, a administração "
          "do grupo é da Alpha. Administrar grupo de consórcio exige autorização própria "
          "do Banco Central — trabalhar com quem tem essa autorização é o que separa uma "
          "operação séria de uma promessa vazia.",
          BODY, 13.5, Color(1, 1, 1, 0.72), 760, 21)
slide_footer(c, 4, "escuro")
c.showPage()

# ==================================================== 05 - MODELO WHITE LABEL
slide_bg(c, "claro")
y = slide_title(c, "Quem faz o quê na sua operação", "Modelo white label", "claro")
paragraph(c, M, y + 14,
          "White label é marca própria sobre estrutura regulada: a marca, a rede e o "
          "suporte são MOVECON; a administração dos grupos é da Alpha, autorizada pelo "
          "Banco Central.",
          BODY, 16, CINZA, 860, 26)

papeis = [
    ("A MARCA", "MOVECON",
     "Marca, posicionamento e material de vendas. Rede de representantes, supervisores "
     "e vendedores. Treinamento, suporte comercial e acompanhamento."),
    ("A ESTRUTURA", "Alpha Administradora de Consórcio Ltda.",
     "Constituição e administração dos grupos, assembleias, contemplações, gestão dos "
     "recursos e prestação de contas — com autorização do Banco Central "
     "(Cert. BCB 03/100/213/88)."),
    ("A REDE", "Você, representante",
     "Você monta e conduz seu time — supervisores e vendedores — com marca, material e "
     "estrutura prontos, sem montar operação própria nem depender de estrutura de "
     "administradora."),
]
cw = (W - M * 2 - 2 * 28) / 3
for i, (kicker, t, b) in enumerate(papeis):
    card(c, M + i * (cw + 28), 300, cw, 250, t, b, kicker)

text(c, M, 236, "Por que isso importa para você", "Montserrat-Sb", 15, PETRO)
paragraph(c, M, 208,
          "Administrar grupo de consórcio exige autorização própria do Banco Central. "
          "No modelo white label, essa parte fica com quem já tem a autorização — a "
          "Alpha — e você concentra seu tempo na venda e no relacionamento.",
          BODY, 13.5, CINZA, 900, 21)

slide_footer(c, 5)
c.showPage()

# ============================================================ 06 - SEGMENTOS
slide_bg(c, "claro")
y = slide_title(c, "O que o consorciado pode conquistar", "Segmentos", "claro")

segs = [
    ("05-imovel", "Imóvel",
     "Casa, apartamento, terreno, sala comercial, construção ou reforma."),
    ("05-auto", "Automóvel",
     "Carro novo ou usado, moto, utilitário — nacional ou importado."),
    ("05-pesados", "Pesados",
     "Caminhão, implemento, ônibus, máquina agrícola e equipamento pesado."),
    ("05-servicos", "Serviços",
     "Reforma, saúde, educação, viagem, energia solar e cirurgias eletivas."),
]
cw = (W - M * 2 - 3 * 24) / 4
cy, ch = 200, 360
for i, (slot, t, b) in enumerate(segs):
    x = M + i * (cw + 24)
    image_cover(c, slot, x, cy + 130, cw, ch - 130, fallback=light_ph)
    rect(c, x, cy, cw, 130, WHITE)
    rect(c, x, cy + 125, cw, 5, TURQ)
    text(c, x + 26, cy + 84, t, H2, 20, NAVY)
    paragraph(c, x + 26, cy + 58, b, BODY, 12.5, CINZA, cw - 52, 18)

disclaimer(c, M, 158, "Segmentos e faixas de crédito conforme os grupos disponíveis na "
                      "administradora. Consulte a tabela de vendas vigente.", 900)
slide_footer(c, 6)
c.showPage()

# ============================================================ 07 - SER REPRESENTANTE
rect(c, 0, 0, W, H, OFFWHITE)
image_cover(c, "06-representante", W * 0.56, 110, W * 0.44, H - 110, fallback=dark_ph)

y = slide_title(c, "Por que ser um representante MOVECON", "Oportunidade", "claro",
                max_w=600)

itens = [
    ("Comissionamento claro", "Grade publicada, sem letra miúda: você sabe quanto "
                              "recebe, por parcela e por segmento."),
    ("Estrutura para crescer", "Monte seu time. Representante forma supervisores, "
                               "supervisores formam vendedores."),
    ("Marca e estrutura prontas", "Modelo white label: você vende sob a marca MOVECON, "
                                  "com os grupos administrados por uma administradora "
                                  "autorizada pelo Banco Central."),
    ("Treinamento continuado", "Formação, material de apoio e acompanhamento desde a "
                               "primeira venda."),
]
iy = y - 4
for t, b in itens:
    chevron(c, M, iy + 3, 14, 10, 4.2, TURQ)
    text(c, M + 30, iy, t, H2, 17, NAVY)
    ny = paragraph(c, M + 30, iy - 26, b, BODY, 13.5, CINZA, 540, 20)
    iy = ny - 42

slide_footer(c, 7)
c.showPage()

# ============================================================ 08 - ESTRUTURA
slide_bg(c, "escuro")
y = slide_title(c, "Como a rede se organiza", "Estrutura comercial", "escuro")
paragraph(c, M, y + 12, "Três níveis, papéis definidos e caminho de crescimento visível "
                        "desde o primeiro dia.", BODY, 16, Color(1, 1, 1, 0.8), 820, 26)

niveis = [
    ("Representante", "Topo da rede. Recruta, forma e gerencia supervisores. "
                      "Responde pela expansão da operação na sua praça."),
    ("Supervisor", "Lidera um time de vendedores. Acompanha metas, qualidade do "
                   "cadastro e ritmo de vendas."),
    ("Vendedor", "Ponta da operação. Atende o cliente, simula, apresenta o plano e "
                 "conduz a contratação."),
]
cw = (W - M * 2 - 2 * 28) / 3
for i, (t, b) in enumerate(niveis):
    x = M + i * (cw + 28)
    card(c, x, 288, cw, 214, t, b, f"NÍVEL {i + 1}", "escuro")
    if i < 2:
        chevron(c, x + cw + 6, 380, 16, 12, 5, TURQ, 0.9)

disclaimer(c, M, 210, "A estrutura de níveis e as condições de cada papel constam do "
                      "contrato de representação e da grade de comissionamento vigente.",
           900, "escuro")
slide_footer(c, 8, "escuro")
c.showPage()

# ============================================================ 09 - SUPORTE
slide_bg(c, "claro")
y = slide_title(c, "O que você recebe da MOVECON", "Suporte e ferramentas", "claro")

blocos = [
    ("Treinamento", "Trilha de formação por cargo — do primeiro contato com o produto "
                    "à condução de um time."),
    ("Material de vendas", "Tabelas, simuladores, apresentações e criativos prontos, "
                           "sempre na identidade da marca."),
    ("Suporte comercial", "Apoio direto para dúvidas de produto, cadastro, documentação "
                          "e pós-venda."),
    ("Acompanhamento", "Metas, indicadores e retorno de performance para você saber "
                       "onde ajustar."),
    ("Compliance", "Regras claras de comunicação para vender sem promessa irreal e sem "
                   "risco jurídico."),
    ("Marca", "Uma identidade sólida, material institucional e presença digital para "
              "sustentar sua abordagem."),
]
cw = (W - M * 2 - 2 * 26) / 3
chh = 148
for i, (t, b) in enumerate(blocos):
    col, row = i % 3, i // 3
    x = M + col * (cw + 26)
    yy = 386 - row * (chh + 24)
    rect(c, x, yy, cw, chh, WHITE)
    rect(c, x, yy + chh - 4, cw, 4, TURQ)
    text(c, x + 26, yy + chh - 44, t, H2, 17, NAVY)
    paragraph(c, x + 26, yy + chh - 72, b, BODY, 12.5, CINZA, cw - 52, 18)

slide_footer(c, 9)
c.showPage()

# ============================================================ 10 - CADASTRO
slide_bg(c, "escuro")
y = slide_title(c, "Como se tornar um representante", "Próximo passo", "escuro")

passos = [
    ("Cadastro", "Você preenche o formulário de representante com seus dados e "
                 "sua região de atuação."),
    ("Conversa", "Nosso time entra em contato para alinhar perfil, expectativa e "
                 "modelo de trabalho."),
    ("Documentação", "Envio dos documentos e assinatura do contrato de representação."),
    ("Formação", "Treinamento inicial, acesso ao material e liberação para vender."),
]
cw = (W - M * 2 - 3 * 24) / 4
for i, (t, b) in enumerate(passos):
    x = M + i * (cw + 24)
    card(c, x, 330, cw, 200, t, b, f"0{i + 1}", "escuro")

pw = pill(c, M, 224, "Quero ser representante MOVECON", TURQ, GRAFITE, "Montserrat-Bd",
          14, 26, 44)
text(c, M + pw + 24, 244, "WhatsApp +55 77 9170-8914", BODY, 14, Color(1, 1, 1, 0.88))
text(c, M + pw + 24, 222, "samuel@moveconconsorcio.com", BODY, 14, Color(1, 1, 1, 0.7))
text(c, M + pw + 24, 200, "moveconconsorcio.com/seja-representante  ·  [confirmar link]",
     BODY, 11, Color(1, 1, 1, 0.45))

slide_footer(c, 10, "escuro")
c.showPage()

# ============================================================ 11 - CONTATO
image_cover(c, "10-encerramento", 0, 0, W, H, fallback=dark_ph)
scrim(c, 0, 0, W, H, GRAFITE, 0.9, 0.55)

logo(c, M, 520, height=132, variant="negativa")
text(c, M, 452, "Consórcio com segurança começa aqui.", H1, 34, WHITE)
rect(c, M, 418, 74, 5, TURQ)

contatos = [
    ("Site", "moveconconsorcio.com"),
    ("E-mail", "samuel@moveconconsorcio.com"),
    ("WhatsApp", "+55 77 9170-8914"),
    ("Instagram", "@moveconconsorcio"),
]
cy = 356
for rot, val in contatos:
    text(c, M, cy, rot.upper(), "Montserrat-Sb", 10.5, TURQ, tracking=1.6)
    text(c, M + 130, cy, val, BODY, 14.5, Color(1, 1, 1, 0.9))
    cy -= 30

text(c, M, 208, "MOVECON Intermediações Financeiras Ltda", "Montserrat-Sb", 12.5,
     Color(1, 1, 1, 0.85))
text(c, M, 188, "CNPJ 67.559.635/0001-02", BODY, 12, Color(1, 1, 1, 0.6))
text(c, M, 168, ENDERECO.replace("Vitoria", "Vitória"), BODY, 12, Color(1, 1, 1, 0.6))

rect(c, M, 132, W - M * 2, 1, WHITE, 0.16)
disclaimer(c, M, 108,
           "MOVECON CONSÓRCIOS é plataforma de consórcio. Os grupos são administrados "
           "pela Alpha Administradora de Consórcio Ltda., autorizada pelo Banco Central "
           "do Brasil (Cert. BCB 03/100/213/88 — CNPJ 90.982.679/0001-54). O consórcio é "
           "regido pela Lei nº 11.795/2008. A contemplação ocorre por sorteio ou lance em "
           "assembleia — não há garantia de contemplação em prazo determinado. Material "
           "de caráter informativo; não constitui oferta nem promessa de resultado.",
           W - M * 2, "escuro", 10)
c.showPage()

c.save()
print("PDF gerado:", PDF)

faltando = [s for s in ["01-capa", "04-alpha", "05-imovel", "05-auto", "05-pesados",
                        "05-servicos", "06-representante", "10-encerramento"]
            if not has_img(s)]
if faltando:
    print("Slots de imagem pendentes (usando fundo procedural):")
    for s in faltando:
        print("   -", s)
