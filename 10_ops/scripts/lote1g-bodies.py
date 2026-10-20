"""Lê body atual + aplica replace + salva new body completo."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# bodies obtidos da query 2026-06-14 — colados como strings raw
TOS_BODY = """<h2>Termos de Serviço — Incluo</h2>
<p>Este site é operado pela Incluo, sob a razão social 65.393.441 ROBERTO DOS SANTOS MEDRADO (CNPJ: 65.393.441/0001-46), com sede na Av. Serrinha, 3262, Ibirapuera, Vitória da Conquista — BA, CEP 45.075-220. Ao visitar nosso site e/ou comprar algo de nós, você concorda em ficar vinculado aos seguintes termos.</p>
<ol>
<li>
<p>Aceitação dos Termos Ao acessar este site, você confirma que é maior de idade (18 anos completos) em seu estado de residência, ou que possui consentimento de responsável legal para realizar compras. Menores de idade só podem utilizar o site sob supervisão de seus pais ou responsáveis.</p>
</li>
<li>
<p>Condições Gerais de Uso Reservamo-nos o direito de recusar serviço a qualquer pessoa, por qualquer motivo, a qualquer momento. Você concorda em não reproduzir, duplicar, copiar, vender, revender ou explorar qualquer parte do Serviço sem permissão expressa por escrito.</p>
</li>
<li>
<p>Precisão das Informações Embora nos esforcemos para fornecer informações precisas, não somos responsáveis caso as informações deste site não sejam precisas, completas ou atualizadas.</p>
</li>
<li>
<p>Modificações ao Serviço e Preços Os preços dos produtos estão sujeitos a alterações sem aviso prévio. Reservamo-nos o direito de modificar ou descontinuar o Serviço sem aviso a qualquer momento.</p>
</li>
<li>
<p>Produtos e Serviços Fizemos todos os esforços para exibir com precisão as cores e imagens dos produtos, mas não garantimos que a exibição no seu monitor será exata.</p>
</li>
<li>
<p>Pagamento Aceitamos: Visa, Mastercard, American Express, Elo e PIX. Pagamentos processados em moeda brasileira (BRL). Processamento de cartões realizado por gateway seguro (Appmax) com criptografia SSL.</p>
</li>
<li>
<p>Política de Envio Consulte nossa Política de Envios disponível no rodapé do site para informações detalhadas sobre prazos, frete e taxas alfandegárias.</p>
</li>
<li>
<p>Política de Reembolso Em conformidade com o Código de Defesa do Consumidor (Lei 8.078/90), você tem direito a 7 dias corridos após o recebimento para solicitar devolução por arrependimento. Para produtos com defeito: 30 dias para não duráveis e 90 dias para duráveis.</p>
</li>
<li>
<p>Garantia Legal Todos os produtos possuem garantia legal de 30 dias para não duráveis e 90 dias para duráveis, conforme CDC (Art. 26).</p>
</li>
<li>
<p>Natureza dos Produtos Os produtos comercializados são brinquedos e itens de lazer, recreação e bem-estar. Não possuem finalidade médica ou terapêutica e não se destinam a diagnosticar, tratar ou curar qualquer condição.</p>
</li>
<li>
<p>Conteúdo do Usuário Ao enviar avaliações, comentários ou fotos, você concede à Incluo direitos não exclusivos, livres de royalties, perpétuos e mundiais para usá-los. Conteúdo não deve violar direitos de terceiros, conter material difamatório, obsceno, ameaçador ou ilegal.</p>
</li>
<li>
<p>LGPD O envio de informações pessoais é regido por nossa Política de Privacidade, em conformidade com a LGPD (Lei 13.709/18).</p>
</li>
<li>
<p>Atividades Proibidas É vedado usar o site para: (a) finalidades ilegais; (b) violar leis; (c) infringir propriedade intelectual; (d) assediar, abusar, insultar, difamar; (e) enviar informações falsas; (f) fazer upload de vírus.</p>
</li>
<li>
<p>Limitação de Responsabilidade A Incluo não garante que o uso do serviço será ininterrupto ou livre de erros. A responsabilidade da Incluo fica limitada ao valor efetivamente pago pelo produto adquirido.</p>
</li>
<li>
<p>Modificações aos Termos Reservamo-nos o direito de atualizar estes Termos a qualquer momento, publicando atualizações no site.</p>
</li>
<li>
<p>Lei Aplicável e Foro Estes Termos serão regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Vitória da Conquista/BA para dirimir quaisquer controvérsias, com renúncia expressa a qualquer outro.</p>
</li>
<li>
<p>Contato SAC: <a href="mailto:contato@incluobrasil.com" rel="noopener noreferrer" target="_blank">contato@incluobrasil.com</a> WhatsApp: +55 (77) 99820-5841 Horário: Segunda a sexta, das 9h às 18h Endereço: Av. Serrinha, 3262, Ibirapuera, Vitória da Conquista — BA, CEP 45.075-220 CNPJ: 65.393.441/0001-46</p>
</li>
</ol>"""

TOS_NEW = TOS_BODY.replace(
    "<p>Pagamento Aceitamos: Visa, Mastercard, American Express, Elo e PIX. Pagamentos processados em moeda brasileira (BRL). Processamento de cartões realizado por gateway seguro (Appmax) com criptografia SSL.</p>",
    '<p>Pagamento Aceitamos: Visa, Mastercard, American Express, Elo e PIX. Pagamentos processados em moeda brasileira (BRL). O checkout é operado pela plataforma <strong>Yampi</strong> (subdomínio incluo.pay.yampi.com.br) e o processamento de cartões é realizado pelo <strong>gateway seguro Appmax</strong> com criptografia SSL. Nenhum dado de cartão é armazenado em nossos servidores.</p>'
)

assert 'Yampi' in TOS_NEW, "Yampi not added in TOS!"
print('TOS subs ok, new len:', len(TOS_NEW))

out=r'C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix'
open(f'{out}/tos-new-body.html','w',encoding='utf-8').write(TOS_NEW)
print('saved tos')
