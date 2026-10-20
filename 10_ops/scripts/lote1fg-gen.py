"""Gera new bodies para FAQ, TOS, Privacy com correções T2-002/T4-001."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FAQ = """<h2>Perguntas Frequentes (FAQ)</h2>

<p><strong>1. Qual o prazo de entrega?</strong><br>O prazo total de entrega é de <strong>10 a 21 dias úteis</strong> após a postagem do produto. Temos um prazo de processamento de até 3 dias úteis antes do envio. Trabalhamos com importação direta e cada pedido passa por curadoria de qualidade antes da postagem.</p>

<p><strong>2. O frete é grátis?</strong><br>Sim! A Incluo oferece frete gratuito para todo o Brasil em todos os pedidos realizados no site, sem valor mínimo de compra.</p>

<p><strong>3. Como acompanho meu pedido?</strong><br>Você receberá o código de rastreamento por e-mail em até 3 dias úteis após o envio. Utilize em nossa página de <a href="https://incluobrasil.com/apps/321track">Rastrear Pedido</a> ou no site dos Correios.</p>

<p><strong>4. Vou pagar alguma taxa alfandegária?</strong><br>Não. Conforme o programa Remessa Conforme da Receita Federal, eventuais taxas de importação (20% sobre até US$50) são de responsabilidade da Incluo. Caso você seja cobrado, envie o comprovante e reembolsamos em até 5 dias úteis via PIX ou cartão.</p>

<p><strong>5. E se meu pedido atrasar?</strong><br>Caso o pedido ultrapasse 45 dias corridos sem chegar (sem motivo atribuível ao cliente, como endereço incorreto), oferecemos reembolso integral ou reenvio do produto, à sua escolha.</p>

<p><strong>6. Posso trocar ou devolver um produto?</strong><br>Sim. Você tem até <strong>7 dias após o recebimento</strong> para solicitar devolução por arrependimento, desde que o produto esteja lacrado e sem uso. Para defeitos, o prazo é de <strong>30 dias para produtos não duráveis e 90 dias para duráveis</strong>, conforme o Código de Defesa do Consumidor. A logística reversa fica por nossa conta.</p>

<p><strong>7. Quais as formas de pagamento?</strong><br>Aceitamos Cartão de Crédito (Visa, Mastercard, Elo, American Express) com parcelamento via Appmax e PIX à vista. O checkout é operado pela plataforma Yampi (incluo.pay.yampi.com.br) e o processamento de cartões é feito pelo gateway seguro Appmax.</p>

<p><strong>8. O site é seguro?</strong><br>Totalmente. Utilizamos segurança SSL e processamos pagamentos pela Appmax, garantindo que seus dados financeiros nunca fiquem salvos em nosso sistema.</p>

<p><strong>9. Os produtos são seguros para crianças?</strong><br>Sim. Todos os mordedores, brinquedos sensoriais e itens infantis seguem padrões internacionais de segurança (silicone BPA Free grau alimentício, materiais atóxicos). Supervisione o uso por crianças menores de 3 anos.</p>

<p><strong>10. Os produtos têm uso médico ou terapêutico?</strong><br>Não. Os produtos da Incluo são brinquedos e recursos educativos para uso recreativo e lúdico no dia a dia — indicados para toda a família. Não são dispositivos médicos. Para qualquer necessidade de saúde, consulte um profissional habilitado.</p>

<p><strong>11. De onde vêm os produtos?</strong><br>De fornecedores internacionais selecionados e curados pela Incluo. Todos os produtos passam por avaliação de qualidade e segurança de materiais antes de serem disponibilizados para venda. As importações seguem o programa <strong>Remessa Conforme</strong> da Receita Federal.</p>

<p><strong>Ainda tem dúvidas?</strong><br>Fale conosco pelo WhatsApp: <strong>+55 (77) 99820-5841</strong> ou e-mail: <strong>contato@incluobrasil.com</strong>. Horário: Segunda a sexta, das 9h às 18h.</p>"""

TOS_NEW_CL6 = """<li>
<p>Pagamento Aceitamos: Visa, Mastercard, American Express, Elo e PIX. Pagamentos processados em moeda brasileira (BRL). O checkout é operado pela plataforma <strong>Yampi</strong> (subdomínio incluo.pay.yampi.com.br) e o processamento de cartões é realizado pelo <strong>gateway seguro Appmax</strong> com criptografia SSL. Nenhum dado de cartão é armazenado em nossos servidores.</p>
</li>"""

TOS_OLD_CL6 = """<li>
<p>Pagamento Aceitamos: Visa, Mastercard, American Express, Elo e PIX. Pagamentos processados em moeda brasileira (BRL). Processamento de cartões realizado por gateway seguro (Appmax) com criptografia SSL.</p>
</li>"""

PRIVACY_NEW_5 = """<h3>5. Compartilhamento de Dados</h3>
<p>Seus dados poderão ser compartilhados com:</p>
<ul>
<li>
<strong>Yampi</strong> (plataforma de checkout) — operação do ambiente seguro onde você finaliza a compra (subdomínio incluo.pay.yampi.com.br).</li>
<li>
<strong>Appmax</strong> (gateway de pagamento) — processamento seguro de pagamentos.</li>
<li>
<strong>Shopify Inc.</strong> (plataforma da loja) — operação do e-commerce. Dados podem ser processados em servidores nos EUA com medidas adequadas de segurança.</li>
<li>
<strong>Google LLC</strong> (Google Analytics e Google Ads) — análise de tráfego e publicidade. Política Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a>.</li>
<li>
<strong>Correios e transportadoras</strong> — entrega dos pedidos.</li>
<li>
<strong>Autoridades competentes</strong> — quando exigido por lei ou ordem judicial.</li>
</ul>"""

PRIVACY_OLD_5 = """<h3>5. Compartilhamento de Dados</h3>
<p>Seus dados poderão ser compartilhados com:</p>
<ul>
<li>
<strong>Appmax</strong> (gateway de pagamento) — processamento seguro de pagamentos.</li>
<li>
<strong>Shopify Inc.</strong> (plataforma da loja) — operação do e-commerce. Dados podem ser processados em servidores nos EUA com medidas adequadas de segurança.</li>
<li>
<strong>Google LLC</strong> (Google Analytics e Google Ads) — análise de tráfego e publicidade. Política Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a>.</li>
<li>
<strong>Correios e transportadoras</strong> — entrega dos pedidos.</li>
<li>
<strong>Autoridades competentes</strong> — quando exigido por lei ou ordem judicial.</li>
</ul>"""

# Salvar FAQ direto
out = r'C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix'
open(f'{out}/faq-new-body.html','w',encoding='utf-8').write(FAQ)
open(f'{out}/tos-old-cl6.txt','w',encoding='utf-8').write(TOS_OLD_CL6)
open(f'{out}/tos-new-cl6.txt','w',encoding='utf-8').write(TOS_NEW_CL6)
open(f'{out}/privacy-old-sec5.txt','w',encoding='utf-8').write(PRIVACY_OLD_5)
open(f'{out}/privacy-new-sec5.txt','w',encoding='utf-8').write(PRIVACY_NEW_5)
print('saved')
