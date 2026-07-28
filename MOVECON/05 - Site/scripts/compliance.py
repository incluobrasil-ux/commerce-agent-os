# -*- coding: utf-8 -*-
"""Bloco de compliance no corpo — fonte unica dos geradores.

Estava declarado dentro do gerador de hubs. Ao estender para filhas e guias,
copiar o texto criaria tres versoes do mesmo paragrafo juridico: na primeira
revisao, duas delas passariam a mentir. Compliance com copia divergente e
pior que compliance ausente, porque parece resolvido.
"""

# Bloco de compliance NO CORPO. O rodape global ja traz a atribuicao, mas
# rodape de site e descartado por quem extrai trecho - motor generativo
# recorta o conteudo da pagina. Sem isto, a pagina pode ser citada sem a
# informacao de quem administra os grupos.
COMPLIANCE = """
<section class="sec sec--alt">
  <div class="wrap stack prosa">
    <div class="nota">
      <p><strong>Quem administra os grupos.</strong> Os grupos de consórcio
      apresentados pela MOVECON são administrados pela Alpha Administradora de
      Consórcio Ltda., CNPJ 90.982.679/0001-54, administradora autorizada a
      funcionar pelo Banco Central do Brasil sob o certificado nº 03/100/213/88.
      A MOVECON é a plataforma que apresenta os grupos e acompanha o cliente.
      A contemplação ocorre por sorteio ou lance em assembleia: nenhuma data
      pode ser prometida.</p>
    </div>
  </div>
</section>"""


# Secoes de prosa da engorda. Entram entre a tabela/passos e a FAQ.
#
# Slot generico de proposito: a engorda de cada hub acrescenta blocos
# diferentes, e criar um slot nomeado por bloco ("custos", "modalidades",
# "quando-nao-serve") amarraria o gerador ao conteudo de imoveis. O que e
# comum a todos os hubs e a FORMA - titulo, paragrafos, lista opcional.
SECAO = """
<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">%(eyebrow)s</p>
      <h2>%(titulo)s</h2>
%(paragrafos)s
    </div>
%(lista)s
  </div>
</section>"""

SECAO_ITEM = ('      <div class="card card--acento">' + chr(10) +
              '        <h3>%s</h3>' + chr(10) +
              '        <p>%s</p>' + chr(10) +
              '      </div>')


def montar_secoes(seg):
    """Blocos de prosa da engorda, ou string vazia se o hub nao tiver."""
    out = []
    for sec in seg.get('secoes', []):
        paras = chr(10).join('      <p>%s</p>' % t for t in sec['paragrafos'])
        lista = ''
        if sec.get('itens'):
            cartoes = chr(10).join(SECAO_ITEM % (t, d) for t, d in sec['itens'])
            lista = ('    <div class="cards cards--3">' + chr(10) + cartoes +
                     chr(10) + '    </div>')
        out.append(SECAO % dict(eyebrow=sec.get('eyebrow', 'Em detalhe'),
                                titulo=sec['titulo'], paragrafos=paras,
                                lista=lista))
    return chr(10).join(out)
