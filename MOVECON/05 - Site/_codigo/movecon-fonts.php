<?php
/**
 * Plugin Name: MOVECON — Fontes da Marca
 * Description: Carrega Montserrat (títulos) e Inter (corpo) conforme o Manual da Marca v1.0.
 * Version: 1.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_head', function () {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'movecon-fonts',
		'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap',
		array(),
		null
	);
}, 5 );
