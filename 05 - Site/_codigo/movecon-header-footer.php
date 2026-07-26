<?php
/**
 * Plugin Name: MOVECON — Header e Rodapé da Marca
 * Description: Substitui o header e o rodapé padrão do Astra pelos da identidade MOVECON.
 * Version: 1.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

const MV_PORTAL = 'https://portal.alphaconsorcio.com/portal';

function mv_logo_url() {
	$id = get_theme_mod( 'custom_logo' );
	$u  = $id ? wp_get_attachment_image_url( $id, 'full' ) : '';
	return $u ?: content_url( '/uploads/2026/07/movecon-logo.png' );
}

/* ── Esconde header/rodapé do tema ─────────────────────────────── */
add_action( 'wp_head', function () {
	echo '<style>.site-header,#masthead,.ast-above-header,.ast-below-header,'
	   . '.site-footer,#colophon,.ast-scroll-top{display:none!important}'
	   . '#page,.site-content{padding-top:0!important;margin-top:0!important}</style>' . "\n";
}, 99 );

/* ── HEADER ────────────────────────────────────────────────────── */
add_action( 'wp_body_open', function () {
	$logo = esc_url( mv_logo_url() );
	$home = esc_url( home_url( '/' ) );
	?>
<header class="mv-topo">
  <div class="mv-topo__in">
    <a class="mv-marca" href="<?php echo $home; ?>" aria-label="MOVECON Consórcios — página inicial">
      <img src="<?php echo $logo; ?>" alt="MOVECON Consórcios" width="120" height="90" decoding="async">
    </a>

    <nav class="mv-nav" aria-label="Navegação principal">
      <a href="<?php echo $home; ?>">Início</a>
      <a href="<?php echo esc_url( home_url( '/administrado-pela-alpha/' ) ); ?>">Quem administra</a>
      <a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a>
    </nav>

    <div class="mv-acoes">
      <div class="mv-portais">
        <a class="mv-btn mv-btn--portal" href="<?php echo MV_PORTAL; ?>" target="_blank" rel="noopener">
          Área do Consorciado
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
        </a>
        <a class="mv-btn mv-btn--portal" href="<?php echo MV_PORTAL; ?>" target="_blank" rel="noopener">
          Área do Representante
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
        </a>
      </div>
      <a class="mv-btn mv-btn--out" href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Falar com consultor</a>
    </div>

    <button class="mv-burger" aria-label="Abrir menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
	<?php
} );

/* ── RODAPÉ ────────────────────────────────────────────────────── */
add_action( 'wp_footer', function () {
	$logo = esc_url( mv_logo_url() );
	$ano  = date_i18n( 'Y' );
	?>
<footer class="mv-rodape">
  <div class="mv-rodape__in">

    <div class="mv-rodape__topo">
      <div>
        <img class="mv-rodape__logo" src="<?php echo $logo; ?>" alt="MOVECON Consórcios" width="110" height="82" decoding="async">
        <p class="mv-rodape__end">
          <strong>MOVECON CONSORCIOS</strong><br>
          MOVECON Intermediações Financeiras Ltda<br>
          CNPJ 67.559.635/0001-02<br>
          Av. Rosa Cruz, 926 — Candeias<br>
          Vitória da Conquista/BA — CEP 45.028-045
        </p>
      </div>

      <div>
        <h3>Consórcios</h3>
        <ul>
          <?php
          $mv_hubs = array(
            'consorcio-veiculos'            => 'Veículos',
            'consorcio-imoveis'             => 'Imóveis',
            'consorcio-caminhao'            => 'Caminhão e frota',
            'consorcio-maquinas-agricolas'  => 'Máquinas agrícolas',
            'consorcio-servicos'            => 'Serviços',
            'consorcio-empresa'             => 'Para empresas',
            'consorcio-embarcacoes'         => 'Embarcações',
            'consorcio-contemplado'         => 'Consórcio contemplado',
          );
          foreach ( $mv_hubs as $slug => $nome ) {
            printf( '<li><a href="%s">%s</a></li>',
              esc_url( home_url( '/' . $slug . '/' ) ), esc_html( $nome ) );
          }
          ?>
        </ul>
      </div>

      <div>
        <h3>Institucional</h3>
        <ul>
          <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a></li>
          <li><a href="<?php echo esc_url( home_url( '/administrado-pela-alpha/' ) ); ?>">Quem administra os grupos</a></li>
          <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
        </ul>
      </div>

      <div>
        <h3>Acesso</h3>
        <ul>
          <li><a href="<?php echo MV_PORTAL; ?>" target="_blank" rel="noopener">Área do Consorciado</a></li>
          <li><a href="<?php echo MV_PORTAL; ?>" target="_blank" rel="noopener">Área do Representante</a></li>
          <li><a href="<?php echo MV_PORTAL; ?>" target="_blank" rel="noopener">2ª via de boleto</a></li>
        </ul>
        <p class="mv-rodape__nota">Portal operado pela Alpha Administradora de Consórcio Ltda. — o perfil é definido no login.</p>
      </div>
    </div>

    <div class="mv-rodape__legal">
      <p>
        MOVECON — plataforma de consórcio. Os grupos são administrados pela <strong>Alpha Administradora de Consórcio Ltda.</strong>, autorizada pelo
        Banco Central (Cert. BCB 03/100/213/88 · CNPJ 90.982.679/0001-54). Consórcio é modalidade de compra
        programada, não é investimento e não gera rendimento. Não há juros; há taxa de administração e,
        quando previsto, fundo de reserva. A contemplação ocorre por sorteio ou lance, sem data garantida.
        Leia o contrato antes de aderir.
      </p>
      <p class="mv-rodape__copy">© <?php echo $ano; ?> MOVECON Consórcios. Todos os direitos reservados.</p>
    </div>

  </div>
</footer>

<script>
(function(){
  var b=document.querySelector('.mv-burger'), t=document.querySelector('.mv-topo');
  if(b&&t){b.addEventListener('click',function(){
    var o=t.classList.toggle('is-open'); b.setAttribute('aria-expanded',o?'true':'false');
  });}
  var s=function(){ if(t) t.classList.toggle('is-scrolled', window.scrollY>10); };
  window.addEventListener('scroll',s,{passive:true}); s();
})();
</script>
	<?php
}, 5 );
