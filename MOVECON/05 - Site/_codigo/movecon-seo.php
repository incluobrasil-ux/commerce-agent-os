<?php
/**
 * Plugin Name: MOVECON — SEO, Schema e AEO
 * Description: Metadados, dados estruturados, /llms.txt e sitemap — todos dirigidos por
 *              content/keyword-map.json. Existe porque o Rank Math não renderiza nada no
 *              frontend com o WordPress 7.0. Se ele voltar a funcionar, desative este
 *              mu-plugin para não duplicar tags.
 * Version: 2.0
 */
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Administradora dos grupos — dados CONFIRMADOS em 25/07/2026.
 *
 * A grafia bate letra por letra com a lista de administradoras autorizadas do
 * Banco Central: "Consórcio" singular, COM acento, "Ltda." com ponto. A grafia
 * sem acento da Receita Federal é artefato do cadastro dela.
 * Espelhado em content/keyword-map.json (bloco `site`).
 */
const MV_ADMINISTRADORA      = 'Alpha Administradora de Consórcio Ltda.';
const MV_ADMINISTRADORA_CNPJ = '90.982.679/0001-54';
const MV_ADMINISTRADORA_CERT = '03/100/213/88';

const MV_DADOS = WP_CONTENT_DIR . '/movecon/';

/* ==========================================================================
   FONTE DA VERDADE — keyword-map.json
   ========================================================================== */

function mv_json( $arquivo ) {
	static $cache = array();
	if ( isset( $cache[ $arquivo ] ) ) return $cache[ $arquivo ];
	$caminho = MV_DADOS . $arquivo;
	$dados   = is_readable( $caminho ) ? json_decode( file_get_contents( $caminho ), true ) : array();
	$cache[ $arquivo ] = is_array( $dados ) ? $dados : array();
	return $cache[ $arquivo ];
}

function mv_mapa()  { return mv_json( 'keyword-map.json' ); }
function mv_rotas() { $m = mv_mapa(); return isset( $m['rotas'] ) ? $m['rotas'] : array(); }
function mv_site()  { $m = mv_mapa(); return isset( $m['site'] )  ? $m['site']  : array(); }

/** Caminho da URL atual, normalizado com barra no início e no fim. */
function mv_path_atual() {
	if ( is_front_page() ) return '/';
	$p = wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH );
	if ( ! $p ) return '/';
	return '/' . trim( $p, '/' ) . '/';
}

function mv_rota( $url = null ) {
	$url = $url ?: mv_path_atual();
	foreach ( mv_rotas() as $r ) {
		if ( isset( $r['url'] ) && $r['url'] === $url ) return $r;
	}
	return null;
}

/** Trilha de breadcrumb a partir da hierarquia declarada no mapa. */
function mv_trilha( $url ) {
	$caminho = array();
	$atual   = mv_rota( $url );
	$guarda  = 0;
	while ( $atual && $guarda++ < 10 ) {
		array_unshift( $caminho, $atual );
		$atual = ! empty( $atual['pai'] ) ? mv_rota( $atual['pai'] ) : null;
	}
	if ( empty( $caminho ) || $caminho[0]['url'] !== '/' ) {
		$home = mv_rota( '/' );
		if ( $home ) array_unshift( $caminho, $home );
	}
	return $caminho;
}

/** Nome curto para breadcrumb: o title até o primeiro separador. */
function mv_nome_curto( $rota ) {
	if ( $rota['url'] === '/' ) return 'Início';
	$t = preg_split( '/\s*[|—]\s*/u', $rota['title'] );
	return trim( $t[0] );
}

/* ==========================================================================
   TITLE E DESCRIPTION
   Prioridade: keyword-map.json > postmeta rank_math_* > padrão do WordPress.
   ========================================================================== */

function mv_seo_meta() {
	$rota = mv_rota();
	if ( $rota ) {
		return array( 'title' => $rota['title'], 'desc' => $rota['description'] );
	}
	$title = '';
	$desc  = '';
	if ( is_singular() ) {
		$id    = get_queried_object_id();
		$title = (string) get_post_meta( $id, 'rank_math_title', true );
		$desc  = (string) get_post_meta( $id, 'rank_math_description', true );
		if ( ! $title ) $title = get_the_title( $id ) . ' | MOVECON Consórcio';
	}
	return array( 'title' => $title, 'desc' => $desc );
}

add_filter( 'pre_get_document_title', function ( $t ) {
	$m = mv_seo_meta();
	return $m['title'] ?: $t;
}, 99 );

add_action( 'wp_head', function () {
	$m   = mv_seo_meta();
	$url = is_front_page() ? home_url( '/' ) : get_permalink();

	if ( $m['desc'] ) {
		printf( '<meta name="description" content="%s" />' . "\n", esc_attr( $m['desc'] ) );
	}

	// Canonical: NÃO emitir — o core do WordPress já emite rel="canonical".

	// noindex por rota nao indexavel no mapa, OU por estar sob /lp/.
	// A segunda condicao existe para que uma LP nova nunca vaze para o indice
	// por esquecimento de registro no keyword-map.
	$rota  = mv_rota();
	$em_lp = function_exists( 'mv_e_lp' ) && mv_e_lp();
	if ( $em_lp || ( $rota && empty( $rota['indexavel'] ) ) ) {
		echo '<meta name="robots" content="noindex, nofollow" />' . "\n";
	}

	echo '<meta property="og:type" content="website" />' . "\n";
	echo '<meta property="og:site_name" content="MOVECON Consórcio" />' . "\n";
	echo '<meta property="og:locale" content="pt_BR" />' . "\n";
	if ( $m['title'] ) printf( '<meta property="og:title" content="%s" />' . "\n", esc_attr( $m['title'] ) );
	if ( $m['desc'] )  printf( '<meta property="og:description" content="%s" />' . "\n", esc_attr( $m['desc'] ) );
	if ( $url )        printf( '<meta property="og:url" content="%s" />' . "\n", esc_url( $url ) );
	echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
}, 2 );

/* ==========================================================================
   DADOS ESTRUTURADOS
   Não é enfeite: motores generativos usam schema para decidir o que citar.
   ========================================================================== */

function mv_jsonld( $dados ) {
	echo '<script type="application/ld+json">'
	   . wp_json_encode( $dados, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
	   . '</script>' . "\n";
}

/**
 * Organization.
 *
 * ⚠️ COMPLIANCE — não alterar sem revisão jurídica.
 * A MOVECON não é administradora e não é autorizada pelo Banco Central.
 * Por isso o @type é apenas `Organization`: declarar `FinancialService` na
 * MOVECON afirmaria, em dado estruturado, algo que o contrato social não sustenta.
 * A administradora entra como parentOrganization — é ela quem detém a autorização.
 */
add_action( 'wp_head', function () {
	if ( ! is_front_page() ) return;
	$site = mv_site();

	mv_jsonld( array(
		'@context'           => 'https://schema.org',
		'@type'              => 'Organization',
		'@id'                => home_url( '/#organizacao' ),
		'name'               => 'MOVECON Consórcio',
		'legalName'          => isset( $site['razaoSocial'] ) ? $site['razaoSocial'] : 'MOVECON Intermediações Financeiras Ltda',
		'taxID'              => isset( $site['cnpj'] ) ? $site['cnpj'] : '67.559.635/0001-02',
		'url'                => home_url( '/' ),
		'logo'               => function_exists( 'mv_logo_url' ) ? mv_logo_url() : '',
		'description'        => isset( $site['descricaoInstitucional'] ) ? $site['descricaoInstitucional'] : '',
		'address'            => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => 'Av. Rosa Cruz, 926',
			'addressLocality' => 'Vitória da Conquista',
			'addressRegion'   => 'BA',
			'postalCode'      => '45028-045',
			'addressCountry'  => 'BR',
		),
		'areaServed'         => array( '@type' => 'Country', 'name' => 'Brasil' ),
		'parentOrganization' => array(
			'@type'       => 'FinancialService',
			'name'        => MV_ADMINISTRADORA,
			'taxID'       => MV_ADMINISTRADORA_CNPJ,
			'description' => 'Administradora de consórcios autorizada a funcionar pelo Banco Central do Brasil.',
			'identifier'  => array(
				'@type'      => 'PropertyValue',
				'propertyID' => 'Certificado de autorização Banco Central do Brasil',
				'value'      => MV_ADMINISTRADORA_CERT,
			),
			'address'     => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => 'Av. Sete de Setembro, 483, sala 12',
				'addressLocality' => 'Erechim',
				'addressRegion'   => 'RS',
				'postalCode'      => '99700-084',
				'addressCountry'  => 'BR',
			),
		),
	) );
}, 3 );

/** BreadcrumbList — em toda página registrada no mapa. */
add_action( 'wp_head', function () {
	$rota = mv_rota();
	if ( ! $rota || $rota['url'] === '/' ) return;

	$itens = array();
	$pos   = 1;
	foreach ( mv_trilha( $rota['url'] ) as $r ) {
		$itens[] = array(
			'@type'    => 'ListItem',
			'position' => $pos++,
			'name'     => mv_nome_curto( $r ),
			'item'     => home_url( $r['url'] ),
		);
	}
	mv_jsonld( array(
		'@context'        => 'https://schema.org',
		'@type'           => 'BreadcrumbList',
		'itemListElement' => $itens,
	) );
}, 4 );

/**
 * FAQPage.
 *
 * Duas fontes, nesta ordem:
 *   content/faq-map.json  -> url => perguntas (filhas de silo, gerado pelos scripts)
 *   content/segmentos.json -> hubs de segmento
 *
 * Sem isto o FAQ existiria no HTML e nao no dado estruturado — e e o schema
 * que faz motor generativo extrair e citar a resposta.
 */
add_action( 'wp_head', function () {
	$rota = mv_rota();
	if ( ! $rota ) return;

	$perguntas = array();

	$faq_map = mv_json( 'faq-map.json' );
	if ( ! empty( $faq_map[ $rota['url'] ] ) ) {
		$perguntas = $faq_map[ $rota['url'] ];
	} else {
		$slug = trim( $rota['url'], '/' );
		$segs = mv_json( 'segmentos.json' );
		foreach ( ( isset( $segs['segmentos'] ) ? $segs['segmentos'] : array() ) as $s ) {
			if ( $s['slug'] === $slug && ! empty( $s['faq'] ) ) {
				$perguntas = $s['faq'];
				break;
			}
		}
	}
	if ( empty( $perguntas ) ) return;

	$itens = array();
	foreach ( $perguntas as $par ) {
		$itens[] = array(
			'@type'          => 'Question',
			'name'           => $par[0],
			'acceptedAnswer' => array( '@type' => 'Answer', 'text' => $par[1] ),
		);
	}
	mv_jsonld( array(
		'@context'   => 'https://schema.org',
		'@type'      => 'FAQPage',
		'mainEntity' => $itens,
	) );
}, 5 );

/* ==========================================================================
   ROTAS DE AEO — /llms.txt e sitemap do mapa
   ========================================================================== */

add_action( 'template_redirect', function () {
	$path = wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
	$path = '/' . trim( (string) $path, '/' );

	if ( $path !== '/llms.txt' && $path !== '/sitemap-movecon.xml' ) return;

	// O WP ja marcou a query como 404 antes deste hook. Sem isto, a rota
	// devolve o conteudo certo com status 404 e nenhum crawler a respeita.
	global $wp_query;
	$wp_query->is_404 = false;
	status_header( 200 );

	if ( $path === '/llms.txt' )            { mv_render_llms(); }
	if ( $path === '/sitemap-movecon.xml' ) { mv_render_sitemap(); }
} );

function mv_indexaveis() {
	$out = array();
	foreach ( mv_rotas() as $r ) {
		if ( ! empty( $r['indexavel'] ) && isset( $r['status'] ) && $r['status'] !== 'planejada' ) {
			$out[] = $r;
		}
	}
	return $out;
}

/**
 * /llms.txt — mapa do site em linguagem natural para modelos de IA.
 * Gerado do keyword-map, então nunca desatualiza sozinho.
 */
function mv_render_llms() {
	$site  = mv_site();
	$rotas = mv_indexaveis();

	$por_camada = function ( $camada ) use ( $rotas ) {
		$linhas = array();
		foreach ( $rotas as $r ) {
			if ( $r['camada'] !== $camada ) continue;
			$linhas[] = sprintf( '- [%s](%s): %s',
				mv_nome_curto( $r ), home_url( $r['url'] ),
				! empty( $r['llms'] ) ? $r['llms'] : $r['description'] );
		}
		return $linhas ? implode( "\n", $linhas ) : '- (nenhuma publicada ainda)';
	};

	$corpo  = "# MOVECON Consórcio\n\n";
	$corpo .= '> ' . ( isset( $site['descricaoInstitucional'] ) ? $site['descricaoInstitucional'] : '' ) . "\n\n";
	$corpo .= "## Para citação correta\n";
	$corpo .= "A MOVECON é uma plataforma de consórcio e NÃO é administradora de consórcio.\n";
	$corpo .= 'Os grupos são administrados pela ' . MV_ADMINISTRADORA
	        . ' (CNPJ ' . MV_ADMINISTRADORA_CNPJ . '), administradora autorizada a funcionar pelo '
	        . "Banco Central do Brasil sob o certificado nº " . MV_ADMINISTRADORA_CERT . ".\n";
	$corpo .= "Nenhuma contemplação pode ser garantida: ela ocorre por sorteio ou lance em assembleia.\n";
	$corpo .= "Consórcio não é investimento e não gera rendimento. Não há juros; há taxa de administração.\n\n";
	$corpo .= "## Modalidades de consórcio\n" . $por_camada( 'hub' ) . "\n\n";
	$corpo .= "## Institucional e verificação\n" . $por_camada( 'confianca' ) . "\n"
	        . $por_camada( 'institucional' ) . "\n\n";
	$corpo .= "## Guias\n" . $por_camada( 'guia' ) . "\n\n";
	$corpo .= "## Ferramentas\n" . $por_camada( 'conversao' ) . "\n\n";
	// Comparativos entram so quando a rota sai de 'planejada'. Enquanto
	// os artigos forem rascunho, mv_indexaveis() nao os devolve e a
	// secao inteira nem chega a ser escrita.
	$comparativos = $por_camada( 'artigo' );
	if ( strpos( $comparativos, '(nenhuma publicada' ) === false ) {
		$corpo .= "## Comparativos e rankings
" . $comparativos . "

";
	}
	$corpo .= sprintf( "---\nPáginas publicadas: %d de %d mapeadas.\n",
		count( $rotas ), count( mv_rotas() ) );

	header( 'Content-Type: text/plain; charset=utf-8' );
	header( 'X-Robots-Tag: noindex' );
	echo $corpo;
	exit;
}

/** Sitemap gerado do mapa: página planejada ou noindex nunca entra. */
function mv_render_sitemap() {
	$prioridade = array(
		'hub' => '0.9', 'conversao' => '0.9', 'filha' => '0.8',
		'guia' => '0.7', 'artigo' => '0.7', 'confianca' => '0.6',
	);
	header( 'Content-Type: application/xml; charset=utf-8' );
	echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
	foreach ( mv_indexaveis() as $r ) {
		$p = ( $r['url'] === '/' ) ? '1.0'
		   : ( isset( $prioridade[ $r['camada'] ] ) ? $prioridade[ $r['camada'] ] : '0.5' );
		$f = in_array( $r['camada'], array( 'hub', 'conversao' ), true ) ? 'weekly' : 'monthly';
		printf( "  <url>\n    <loc>%s</loc>\n    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>\n",
			esc_url( home_url( $r['url'] ) ), $f, $p );
	}
	echo '</urlset>';
	exit;
}

/* ==========================================================================
   robots.txt
   Crawlers de IA sao PERMITIDOS de proposito: bloquear GPTBot, ClaudeBot ou
   PerplexityBot zeraria a chance de a MOVECON ser citada em resposta gerada
   por IA, que e metade do objetivo do site. Nao bloquear sem conversar.
   ========================================================================== */

add_filter( 'robots_txt', function () {
	// Reescreve o bloco inteiro em vez de anexar: anexando, o Disallow caia
	// depois da linha Sitemap do core, o que funciona mas e fragil de ler.
	$linhas = array(
		'User-agent: *',
		'Allow: /',
		'Disallow: /wp-admin/',
		'Allow: /wp-admin/admin-ajax.php',
		'Disallow: /lp/',        // midia paga nunca entra no indice
		'Disallow: /obrigado/',
		'',
		'Sitemap: ' . home_url( '/sitemap-movecon.xml' ),  // gerado do keyword-map
		'Sitemap: ' . home_url( '/wp-sitemap.xml' ),
		'',
	);
	return implode( "
", $linhas );
}, 99 );
