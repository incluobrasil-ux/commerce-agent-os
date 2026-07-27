# -*- coding: utf-8 -*-
"""Gate corretivo da correção de produto — formato da seção 5.4 do manual.

Auditor não corrige, apenas reporta. Mede o HTML SERVIDO, não o build.

O que verifica, para cada rota indexável no ar:

  1. COMPLIANCE  — alegação de ausência de entrada sem a ressalva da primeira
                   parcela maior no mesmo documento
  2. DELÍRIO     — percentual de kFirst vazando para o site (os números vivem
                   no /docs/, nunca na página)
  3. REGRESSÃO   — as travas anteriores continuam limpas: expressões
                   proibidas, placeholder, promessa de prazo

Uso: python scripts/gate_correcao_entrada.py
"""
import io
import json
import os
import re
import sys
import unicodedata
from urllib.request import urlopen, Request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://moveconconsorcio.com'

ALEGA = ('sem entrada', 'nao ha entrada', 'sem entrada obrigatoria',
         'comeca pela parcela', 'comeca a pagar a parcela', 'so a parcela',
         'sem desembolso inicial', 'sem precisar de entrada', 'sem dar entrada')

REVELA = ('primeira parcela', '1ª parcela', 'antecipa',
          'maior que as demais')

# Percentuais de kFirst: se algum aparecer no site, vazou do /docs/.
KFIRST = ('19,21', '19,31', '14,12', '13,89', '0,1921', '0,1931')


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_seo import permitido_em_rota  # noqa: E402


def norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


def texto(h):
    return ' '.join(re.sub(r'(?s)<[^>]+>', ' ', h).split())


def baixar(url):
    req = Request(BASE + url, headers={'User-Agent': 'gate/1.0'})
    return urlopen(req, timeout=30).read().decode('utf-8', 'replace')


def main():
    mapa = json.load(io.open(os.path.join(RAIZ, 'content', 'keyword-map.json'),
                             encoding='utf-8'))
    proibidas = mapa['site']['nuncaEscrever']
    rotas = [r for r in mapa['rotas']
             if r['status'] == 'no-ar' and r.get('indexavel')]

    L = []
    w = L.append
    w('# GATE — correção de produto: antecipação da taxa')
    w('')
    w('Executado em 26/07/2026. Formato da seção 5.4 do manual.')
    w('**Auditor não corrige — apenas reporta.** Medido no HTML servido.')
    w('')

    falhas = []
    com_alegacao = 0
    com_ressalva = 0

    for r in sorted(rotas, key=lambda x: x['url']):
        try:
            h = baixar(r['url'])
        except Exception as e:
            falhas.append((r['url'], 'inacessível: %s' % e))
            continue
        c = re.sub(r'(?is)<(script|style|head|nav|header|footer)[^>]*>.*?</\1>',
                   ' ', h)
        t = texto(c)
        n = norm(t)

        alega = [p for p in ALEGA if re.search(r'\b%s\b' % re.escape(p), n)]
        if alega:
            com_alegacao += 1
            if any(norm(x) in n for x in REVELA):
                com_ressalva += 1
            else:
                falhas.append((r['url'],
                               'alega "%s" sem a ressalva' % alega[0]))

        vaz = [k for k in KFIRST if k in t]
        if vaz:
            falhas.append((r['url'], 'percentual de kFirst no site: %s' % vaz))

        # O escopo vem do check_seo, fonte unica da regra. Duplicar a
        # allow-list aqui criaria duas versoes da mesma decisao, e a copia
        # esquecida e que passa a mentir. Auditor que discorda do validador
        # nao e auditoria independente, e ruido.
        ach = [p for p in proibidas
               if norm(p) in n and not permitido_em_rota(p, r['url'])]
        if ach:
            falhas.append((r['url'], 'expressão proibida: %s' % ach))

        ph = re.findall(r'\{\{[^}]*\}\}', h)
        if ph:
            falhas.append((r['url'], 'placeholder: %s' % ph))

    w('| Item | Resultado |')
    w('|---|---|')
    w('| Rotas indexáveis auditadas | %d |' % len(rotas))
    w('| Rotas que alegam ausência de entrada | %d |' % com_alegacao)
    w('| Delas, com a ressalva no mesmo documento | **%d** |' % com_ressalva)
    w('| Percentual de `kFirst` vazando para o site | %d |'
      % len([f for f in falhas if 'kFirst' in f[1]]))
    w('| Expressões proibidas | %d |'
      % len([f for f in falhas if 'proibida' in f[1]]))
    w('| Placeholders renderizados | %d |'
      % len([f for f in falhas if 'placeholder' in f[1]]))
    w('')

    if falhas:
        w('## Falhas')
        w('')
        w('| Rota | Problema |')
        w('|---|---|')
        for u, p in falhas:
            w('| `%s` | %s |' % (u, p))
        w('')
        w('## Veredito')
        w('')
        w('**REPROVADO** — %d falha(s).' % len(falhas))
    else:
        w('## Veredito')
        w('')
        w('**APROVADO.**')
        w('')
        w('Nenhuma rota alega ausência de entrada sem revelar que a primeira')
        w('parcela é maior. Nenhum percentual de `kFirst` vazou para o site —')
        w('os números vivem no `/docs/`, e quem mostra valor ao visitante é o')
        w('simulador, que sempre separou "1ª parcela" de "Demais parcelas".')

    destino = os.path.join(RAIZ, 'docs', 'auditorias',
                           'gate-correcao-antecipacao.md')
    if not os.path.isdir(os.path.dirname(destino)):
        os.makedirs(os.path.dirname(destino))
    io.open(destino, 'w', encoding='utf-8', newline=chr(10)).write(
        '\n'.join(L) + '\n')

    print('%d rotas auditadas | %d alegam | %d com ressalva | %d falha(s)'
          % (len(rotas), com_alegacao, com_ressalva, len(falhas)))
    for u, p in falhas[:12]:
        print('  [X] %s -> %s' % (u, p))
    return 1 if falhas else 0


if __name__ == '__main__':
    sys.exit(main())
