# -*- coding: utf-8 -*-
"""Gera docs/02-mapeamento-blueprint.md a partir do keyword-map.

O manual de prompts pedia um `02-arquitetura.json` como fonte de URLs. Isso
criaria uma SEGUNDA fonte da verdade ao lado do keyword-map - e duas fontes
significam que nenhuma e a verdade. Por decisao do cliente em 26/07/2026, o
documento e DERIVADO: ele le o keyword-map e escreve uma tabela legivel.

Consequencia pratica: este arquivo nunca desatualiza sozinho, e ninguem cria
rota editando ele. Rota nova continua nascendo em scripts/portar_mapa.py.

Uso: python scripts/gerar_docs_mapeamento.py
"""
import io
import json
import os
import sys
from collections import OrderedDict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Padroes do relatorio de concorrentes -> onde eles se aplicam no site real.
# A chave e o padrao observado; o valor e a rota EXISTENTE que o recebe.
# Nenhuma URL nova. Onde o relatorio sugere algo sem rota correspondente, o
# item vai para 06-pendencias.md como PROPOSTA, nunca criado aqui.
BLUEPRINT = OrderedDict([
    ('Pilar por modalidade de bem (todos os 6 concorrentes)', [
        '/consorcio-imoveis/', '/consorcio-veiculos/', '/consorcio-moto/',
        '/consorcio-caminhao/', '/consorcio-servicos/',
    ]),
    ('Pilares de nicho — gap do setor (Evoy e HS estendem; os outros não)', [
        '/consorcio-maquinas-agricolas/', '/consorcio-embarcacoes/',
        '/consorcio-empresa/',
    ]),
    ('Cluster "contemplados" — dominado por corretoras, pouco defendido', [
        '/consorcio-contemplado/',
    ]),
    ('Simulador como hub de conversão (Embracon ~6 CTAs por página)', [
        '/simulador/',
    ]),
    ('Fundo de funil / decisão — maior oportunidade segundo o relatório', [
        '/guia/consorcio-vale-a-pena/', '/guia/consorcio-ou-financiamento/',
        '/guia/consorcio-ou-emprestimo/', '/guia/consorcio-ou-poupar/',
    ]),
    ('Mecânica do consórcio (cluster forte da Embracon)', [
        '/guia/como-funciona-o-consorcio/', '/guia/carta-de-credito/',
        '/guia/lance-no-consorcio/', '/guia/lance-embutido-na-pratica/',
        '/guia/depois-da-contemplacao/',
    ]),
    ('Custos e contrato', [
        '/guia/taxa-de-administracao/', '/guia/fundo-de-reserva/',
        '/guia/reajuste-da-parcela/', '/guia/atraso-e-desistencia/',
        '/guia/direitos-do-consorciado/',
    ]),
    ('Branded SERP — "[marca] é confiável" (gap: ninguém defende)', [
        '/administrado-pela-alpha/', '/seguranca/', '/avaliacoes/',
        '/quem-somos/', '/guia/consorcio-e-confiavel/',
    ]),
    ('AEO — FAQ com resposta direta e URL própria (só Evoy e CAIXA)', [
        '/perguntas/', '/glossario/', '/dados/',
    ]),
    ('llms.txt — nenhum dos 6 concorrentes tem', [
        '/llms.txt',
    ]),
    ('Blog de fundo de funil (Embracon domina; menores ausentes)', [
        '/blog/', '/blog/melhores-parceiras-alpha-consorcios/',
        '/blog/melhores-empresas-consorcio-2026/',
    ]),
])


def main():
    mapa = json.load(io.open(os.path.join(RAIZ, 'content', 'keyword-map.json'),
                             encoding='utf-8'))
    rotas = {r['url']: r for r in mapa['rotas']}

    L = []
    w = L.append
    w('# 02 — Mapeamento do blueprint para as rotas existentes')
    w('')
    w('> **Gerado** por `scripts/gerar_docs_mapeamento.py` a partir de')
    w('> `content/keyword-map.json`. Não editar à mão: a próxima geração sobrescreve.')
    w('>')
    w('> Substitui o `02-arquitetura.json` previsto no manual de prompts. Aquele')
    w('> arquivo seria uma **segunda fonte da verdade** de URLs ao lado do')
    w('> keyword-map, e duas fontes significam que nenhuma é a verdade. Aqui a')
    w('> tabela é derivada; rota nova continua nascendo em `portar_mapa.py`.')
    w('')
    w('**Zero URLs novas.** Cada padrão do relatório de concorrentes é ligado a uma')
    w('rota que já existe. Onde o relatório sugere algo sem rota correspondente, o')
    w('item está em `06-pendencias.md` como proposta aguardando aprovação.')
    w('')

    # inventario
    w('## Inventário atual')
    w('')
    camadas = {}
    for r in mapa['rotas']:
        k = camadas.setdefault(r['camada'], [0, 0])
        k[0 if r['status'] == 'no-ar' else 1] += 1
    w('| Camada | No ar | Planejada |')
    w('|---|---|---|')
    for c in sorted(camadas):
        w('| %s | %d | %d |' % (c, camadas[c][0], camadas[c][1]))
    tot = [sum(v[i] for v in camadas.values()) for i in (0, 1)]
    w('| **Total** | **%d** | **%d** |' % tuple(tot))
    w('')

    w('## Padrão do relatório → rota real')
    w('')
    faltando = []
    for padrao, urls in BLUEPRINT.items():
        w('### %s' % padrao)
        w('')
        w('| Rota | Keyword do mapa | Status |')
        w('|---|---|---|')
        for u in urls:
            r = rotas.get(u)
            if not r:
                w('| `%s` | — | **fora do keyword-map** |' % u)
                if not u.endswith('.txt'):
                    faltando.append(u)
                continue
            w('| `%s` | %s | %s |' % (u, r.get('keyword', '—'), r['status']))
        w('')

    w('## Anti-padrões observados nos concorrentes')
    w('')
    w('Do relatório, coisas a **não** repetir:')
    w('')
    w('- **Embracon:** slugs quase duplicados para a mesma modalidade —')
    w('  `embracon.com.br/consorcio-de-carro`, `.../consorcio-de-veiculos` e')
    w('  `.../consorcio-de-automoveis`.')
    w('  É canibalização auto-infligida. O `check_seo.py` do projeto bloqueia isso')
    w('  no pre-commit.')
    # Slug de concorrente SEMPRE com o dominio dentro do mesmo trecho de
    # codigo. Sem isso o gate 0.2 acusa - com razao - uma URL fora do
    # keyword-map: caminho iniciado por / neste documento tem que ser rota
    # nossa, sempre.
    w('- **CAIXA:** taxonomia inconsistente —')
    w('  `caixaconsorcio.com.br/consorcio-de-veiculos-leves/` com barra final ao')
    w('  lado de `caixaconsorcio.com.br/consorcio-imobiliario` sem barra.')
    w('- **Âncora:** dois padrões de slug convivendo —')
    w('  `ancoraconsorcios.com.br/imoveis` no rodapé e')
    w('  `.../consorcio/consorcio-de-servicos` no corpo.')
    w('')
    w('A MOVECON usa um padrão só: `/consorcio-<bem>/` com barra final, filhas em')
    w('`/consorcio-<bem>/<caso>/`, guias em `/guia/<assunto>/`.')

    destino = os.path.join(RAIZ, 'docs', '02-mapeamento-blueprint.md')
    io.open(destino, 'w', encoding='utf-8', newline=chr(10)).write('\n'.join(L) + '\n')

    total = sum(len(v) for v in BLUEPRINT.values())
    print('docs/02-mapeamento-blueprint.md: %d padroes, %d rotas mapeadas'
          % (len(BLUEPRINT), total))
    if faltando:
        print('[!] rotas citadas e ausentes do keyword-map:')
        for f in faltando:
            print('    %s' % f)
    return 0


if __name__ == '__main__':
    sys.exit(main())
