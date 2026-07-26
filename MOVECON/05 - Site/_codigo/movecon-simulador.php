<?php
/**
 * Plugin Name: MOVECON — Simulador
 * Description: JavaScript do simulador de consórcio. Carrega só nas páginas que têm
 *              o bloco #mvSim. Os parâmetros de cálculo vêm dos data-attributes,
 *              que o gerador preenche a partir de content/simuladores.json — nunca
 *              hardcoded aqui.
 * Version: 1.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_footer', function () {
	// Só injeta onde o bloco existe.
	if ( ! is_singular() ) return;
	$post = get_post();
	if ( ! $post || strpos( (string) $post->post_content, 'id="mvSim"' ) === false ) return;
	?>
<script>
(function () {
  var el = document.getElementById('mvSim');
  if (!el) return;

  var d      = el.dataset;
  var kFirst = parseFloat(d.kfirst);
  var tot    = parseFloat(d.tot);
  var nome   = d.nome;
  var wa     = d.wa;

  var $ = function (id) { return document.getElementById(id); };
  var valR = $('mvVal'), valT = $('mvValTxt'), prazoR = $('mvPrazo');

  var brl = function (n) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  var num = function (n) { return n.toLocaleString('pt-BR'); };

  // GA4 — nomes fixos, alimentam as audiencias de remarketing. Nao inventar variacao.
  var ga = function (evento, extra) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', evento, Object.assign({ categoria: d.cat }, extra || {}));
  };

  var iniciado = false, timer = null;

  function calcular() {
    var val   = parseInt(valR.value, 10);
    var prazo = parseInt(prazoR.value, 10);

    var first   = val * kFirst;
    var parcela = val * tot / prazo;
    var total   = first + parcela * prazo;

    valT.value = num(val);
    $('mvPrazoNum').textContent = prazo + ' meses';
    $('mvFirst').textContent    = brl(first);
    $('mvParcela').textContent  = prazo + 'x de ' + brl(parcela);
    $('mvTotal').textContent    = brl(total);

    var msg = 'Ola! Fiz uma simulacao no site da MOVECON:\n\n'
            + 'Objetivo: ' + nome + '\n'
            + 'Carta de credito: ' + brl(val) + '\n'
            + '1a parcela: ' + brl(first) + '\n'
            + 'Demais parcelas: ' + prazo + 'x de ' + brl(parcela) + '\n\n'
            + 'Quero falar com um consultor.';
    $('mvWa').href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);

    if (!iniciado) { iniciado = true; ga('sim_start'); }

    // sim_result so depois que a pessoa para de mexer — evita um evento por pixel do slider
    clearTimeout(timer);
    timer = setTimeout(function () {
      ga('sim_result', { valor_carta: val, prazo: prazo, parcela: Math.round(parcela) });
    }, 700);
  }

  valR.addEventListener('input', calcular);
  prazoR.addEventListener('input', calcular);

  valT.addEventListener('input', function () {
    var n = parseInt(this.value.replace(/\D/g, ''), 10);
    if (isNaN(n)) return;
    var min = parseInt(d.vmin, 10), max = parseInt(d.vmax, 10);
    if (n < min) n = min;
    if (n > max) n = max;
    valR.value = n;
    calcular();
  });

  $('mvWa').addEventListener('click', function () {
    ga('lead_whatsapp', { valor_carta: parseInt(valR.value, 10),
                          prazo: parseInt(prazoR.value, 10) });
  });

  $('mvValMin').textContent = brl(parseInt(d.vmin, 10));
  $('mvValMax').textContent = brl(parseInt(d.vmax, 10));
  calcular();
  iniciado = false;   // o calculo inicial nao conta como interacao do usuario
})();
</script>
	<?php
}, 20 );
