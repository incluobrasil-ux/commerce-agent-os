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
