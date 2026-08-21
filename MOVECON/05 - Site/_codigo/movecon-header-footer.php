<?php
/**
 * Plugin Name: MOVECON — Header e Rodapé da Marca
 * Description: Substitui o header e o rodapé padrão do Astra pelos da identidade MOVECON.
 * Version: 1.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

const MV_PORTAL = 'https://portal.alphaconsorcio.com/portal';

/**
 * Landing page de midia paga?
 *
 * Tudo sob /lp/ e destino de campanha: sem menu, sem rodape de navegacao,
 * um unico CTA. A regra mora aqui e nao em cada LP, entao e impossivel
 * esquecer numa LP nova. O noindex vem junto, no movecon-seo.php.
 */
function mv_e_lp() {
	$p = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH );
	return strpos( '/' . ltrim( (string) $p, '/' ), '/lp/' ) === 0;
}

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

	// LP: marca sem link e sem menu. Identifica sem oferecer saida.
	if ( mv_e_lp() ) {
		printf(
			'<header class="mv-topo mv-topo--lp"><div class="mv-topo__in">'
			. '<span class="mv-marca"><img src="%s" alt="MOVECON Consórcio" width="120" height="90"></span>'
			. '</div></header>',
			$logo
		);
		return;
	}
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

	// LP: so o bloco legal, sem nenhum link de navegacao.
	if ( mv_e_lp() ) {
		printf(
			'<footer class="mv-rodape mv-rodape--lp"><div class="mv-rodape__in"><div class="mv-rodape__legal">'
			. '<p>MOVECON — autorizada pela <strong>%s</strong>, administradora dos grupos, '
			. 'autorizada a funcionar pelo Banco Central do Brasil. Consórcio é modalidade de '
			. 'compra programada, não é investimento e não gera rendimento. Não há juros; há taxa de '
			. 'administração e, quando previsto, fundo de reserva. A contemplação ocorre por sorteio ou lance, '
			. 'sem data garantida. Leia o contrato antes de aderir.</p>'
			. '<p class="mv-rodape__copy">© %s MOVECON Consórcio · CNPJ 67.559.635/0001-02</p>'
			. '</div></div></footer>',
			esc_html( MV_ADMINISTRADORA ), esc_html( $ano )
		);
		return;
	}
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
            'consorcio-moto'                => 'Moto',
            'consorcio-imoveis'             => 'Imóveis',
            'consorcio-caminhao'            => 'Caminhão e frota',
            'consorcio-maquinas-agricolas'  => 'Máquinas agrícolas',
            'consorcio-servicos'            => 'Serviços',
            'consorcio-empresa'             => 'Para empresas',
            'consorcio-embarcacoes'         => 'Embarcações',
            // 'consorcio-contemplado' saiu do rodape em 26/07/2026, por
            // decisao do cliente. O hub e as 3 filhas continuam NO AR e
            // continuam no sitemap - o que mudou foi so a presenca na
            // navegacao do rodape. Para tirar do site inteiro seria preciso
            // despublicar 4 paginas, o que nao foi pedido.
            // 'consorcio-moto' entrou junto: o hub foi publicado em 25/07 e
            // o rodape nunca chegou a listar.
          );
          foreach ( $mv_hubs as $slug => $nome ) {
            printf( '<li><a href="%s">%s</a></li>',
              esc_url( home_url( '/' . $slug . '/' ) ), esc_html( $nome ) );
          }
          ?>
        </ul>
      </div>

      <?php
      /*
       * COLUNAS DE NAVEGACAO DO RODAPE
       *
       * O rodape ficou parado enquanto o site ia de 11 para 99 paginas. Os 21
       * guias, o glossario, as perguntas, o blog e as paginas de confianca
       * estavam no ar e sem NENHUM link sitewide - so o link contextual de
       * dentro dos hubs. Rodape e o unico bloco que aparece nas 99 paginas, e
       * portanto o mecanismo mais barato de distribuir autoridade interna.
       *
       * As 36 filhas de silo NAO entram aqui de proposito: elas sao alcancadas
       * pelo hub pai, que e onde o contexto existe. Rodape com 36 links vira
       * ruido e dilui o peso de cada um.
       *
       * /consorcio-contemplado/ segue fora da coluna Consorcios por decisao do
       * cliente em 26/07/2026. Continua alcancavel pelo menu principal e pelo
       * silo - a remocao foi da navegacao do rodape, nao do site.
       */
      $mv_colunas = array(
        'Aprenda' => array(
          '/guia/'       => 'Guias do consórcio',
          '/glossario/'  => 'Glossário',
          '/perguntas/'  => 'Perguntas frequentes',
          '/dados/'      => 'Dados do mercado',
          '/blog/'       => 'Comparativos',
        ),
        'Institucional' => array(
          '/'                        => 'Início',
          '/quem-somos/'             => 'Quem é a MOVECON',
          '/administrado-pela-alpha/' => 'Quem administra os grupos',
          '/seguranca/'              => 'Segurança e verificação',
          '/avaliacoes/'             => 'Reputação',
          '/contato/'                => 'Contato',
        ),
      );
      foreach ( $mv_colunas as $mv_titulo => $mv_itens ) {
        echo '<div><h3>' . esc_html( $mv_titulo ) . '</h3><ul>';
        foreach ( $mv_itens as $mv_rota => $mv_nome ) {
          printf( '<li><a href="%s">%s</a></li>',
            esc_url( home_url( $mv_rota ) ), esc_html( $mv_nome ) );
        }
        echo '</ul></div>';
      }
      ?>

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
        MOVECON — autorizada pela <strong>Alpha Administradora de Consórcio Ltda.</strong>, que administra os grupos e é autorizada pelo
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
