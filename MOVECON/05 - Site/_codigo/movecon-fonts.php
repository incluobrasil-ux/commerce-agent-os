<?php
/**
 * Plugin Name: MOVECON — Fontes da Marca (autohospedadas)
 * Description: Serve Montserrat e Inter do próprio domínio. Antes carregavam de
 *              fonts.googleapis.com, o que entregava o IP de cada visitante ao
 *              Google — transferência internacional de dados que precisava ser
 *              declarada na política. Autohospedando, o problema deixa de existir.
 *              Ganho colateral: menos DNS lookup e menos conexão externa no
 *              caminho crítico de render.
 * Version: 2.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * ⚠️ NÃO reintroduzir link para fonts.googleapis.com nem para fonts.gstatic.com.
 * A política de privacidade afirma que este site não carrega recurso de terceiro.
 * Voltar a carregar fonte externa torna a afirmação falsa.
 *
 * Arquivos em wp-content/movecon/fonts/ (14 woff2, subsets latin e latin-ext).
 * CSS em wp-content/movecon/fonts/movecon-fontes.css.
 */
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'movecon-fontes',
		content_url( '/movecon/fonts/movecon-fontes.css' ),
		array(),
		'2.0'
	);
}, 5 );

/**
 * Preload das duas fontes do caminho crítico: o peso do corpo (Inter 400) e o
 * do H1 (Montserrat 700). Sem preload, o navegador só descobre o @font-face
 * depois de baixar o CSS, e o texto pisca.
 */
add_action( 'wp_head', function () {
	$base = content_url( '/movecon/fonts/' );
	foreach ( array( 'inter-400-latin.woff2', 'montserrat-700-latin.woff2' ) as $f ) {
		printf(
			'<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>' . "\n",
			esc_url( $base . $f )
		);
	}
}, 1 );
