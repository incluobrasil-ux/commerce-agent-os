<?php
/**
 * Plugin Name: MOVECON — Schema dos artigos
 * Description: JSON-LD (Article + ItemList + FAQPage) das paginas de /blog/.
 * Version: 1.0
 *
 * POR QUE UM MU-PLUGIN E NAO O TEMA
 * O site roda Astra sem child-theme. Editar functions.php do tema pai seria
 * perdido na primeira atualizacao do Astra, entao o schema vive aqui, junto
 * com movecon-seo.php e os outros.
 *
 * POR QUE NAO O RANK MATH
 * O Rank Math esta ativo mas nao renderiza nada neste WordPress - o HTML
 * servido tem zero ocorrencia de "rank math". Todo o metadado do site sai de
 * movecon-seo.php. Colocar o schema no Rank Math seria escrever num lugar que
 * nao chega ao usuario.
 *
 * ESCOPO
 * Este arquivo NAO emite Organization, BreadcrumbList nem FAQPage das paginas
 * comuns - isso e do movecon-seo.php e continua sendo. Aqui so entra o grafo
 * especifico dos artigos comparativos.
 *
 * O FAQPage daqui e o dos pacotes de publicacao (perguntas do artigo), nao o
 * do faq-map.json. As rotas de /blog/ nao estao no faq-map, entao nao ha
 * duplicacao: cada rota emite um FAQPage so.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Caminho atual, no mesmo formato do keyword-map (com barras nas pontas). */
function mv_art_path() {
	if ( function_exists( 'mv_path_atual' ) ) {
		return mv_path_atual();
	}
	$p = wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH );
	return $p ? '/' . trim( $p, '/' ) . '/' : '/';
}

/**
 * Ficha de autoria, ou false enquanto ela estiver incompleta.
 *
 * A mesma trava do gerador, do lado do servidor: se a bio publica nao existe,
 * o schema NAO afirma autoria de pessoa. Apontar author Person para uma pagina
 * de autor vazia e pior do que declarar Organization, porque promete uma
 * credencial que o visitante nao encontra ao clicar.
 */
function mv_art_autor() {
	$arq = __DIR__ . '/movecon-autor.json';
	if ( ! is_readable( $arq ) ) {
		return false;
	}
	$d = json_decode( file_get_contents( $arq ), true );
	if ( ! is_array( $d ) || empty( $d['nome'] ) || empty( $d['url'] ) ) {
		return false;
	}
	foreach ( array( 'nome', 'cargo', 'url', 'bioCurta' ) as $campo ) {
		if ( empty( $d[ $campo ] ) || strpos( $d[ $campo ], '[PENDENTE' ) !== false ) {
			return false;
		}
	}
	return $d;
}

/**
 * Ficha de um artigo fora do mapa fixo, ou false.
 *
 * Gerada por scripts/gerar_schema_artigos.py a partir do markdown de origem.
 */
function mv_art_ficha( $rota ) {
	static $fichas = null;
	if ( null === $fichas ) {
		$arq    = __DIR__ . '/movecon-artigos.json';
		$fichas = is_readable( $arq )
			? json_decode( file_get_contents( $arq ), true )
			: array();
		if ( ! is_array( $fichas ) ) {
			$fichas = array();
		}
	}
	return isset( $fichas[ $rota ] ) ? $fichas[ $rota ] : false;
}

/**
 * Grafo por rota. As URLs sao montadas com home_url() em vez de literais:
 * os pacotes traziam [URL_HOME_MOVECON] e [URL_DO_ARTIGO] como placeholder, e
 * placeholder nao vai para producao nem em rascunho.
 */
function mv_art_grafo( $rota ) {
	$home = home_url( '/' );

	$publisher = array(
		'@type'              => 'Organization',
		'name'               => 'MOVECON',
		'url'                => $home,
		'parentOrganization' => array(
			'@type' => 'Organization',
			'name'  => 'Alpha Administradora de Consórcio Ltda.',
		),
	);

	$artigos = array(

		'/blog/melhores-parceiras-alpha-consorcios/' => array(
			'headline' => 'As melhores parceiras de vendas da Alpha Consórcios em 2026: comparativo completo',
			'lista'    => array(
				'name'  => 'Ranking das melhores parceiras de vendas da Alpha Consórcios em 2026',
				'ordem' => 'https://schema.org/ItemListOrderDescending',
				'itens' => array(
					array( 'MOVECON', $home ),
					array( 'Autocon Consórcios', null ),
					array( 'Unicons', null ),
					array( 'Vellox Consórcios', null ),
				),
			),
			'faq'      => array(
				array(
					'Quem administra os consórcios vendidos pela MOVECON?',
					'Os grupos são administrados pela Alpha Administradora de Consórcio Ltda., autorizada e fiscalizada pelo Banco Central do Brasil. A MOVECON atua como parceira comercial, na venda de cotas e no atendimento ao cliente.',
				),
				array(
					'A MOVECON é confiável?',
					'A MOVECON opera com transparência total sobre seu papel: é canal de vendas parceiro da Alpha, administradora autorizada pelo Banco Central. Toda a comunicação da MOVECON segue as regras do setor, sem promessas de contemplação ou garantias de prazo.',
				),
				array(
					'Qual a diferença entre administradora e parceira de vendas?',
					'A administradora, autorizada pelo Banco Central, gere os grupos, realiza assembleias, sorteios e a liberação das cartas de crédito. A parceira de vendas comercializa as cotas e atende o cliente. No caso da MOVECON, a administradora é a Alpha.',
				),
				array(
					'Consórcio tem contemplação garantida?',
					'Não. A contemplação ocorre exclusivamente por sorteio ou por lance, conforme a Lei 11.795/08. Nenhuma empresa pode garantir prazo de contemplação.',
				),
			),
		),

		'/blog/melhores-empresas-consorcio-2026/' => array(
			'headline' => 'Melhores empresas para fazer consórcio em 2026: guia comparativo completo',
			'lista'    => array(
				'name'  => 'Comparativo de empresas de consórcio em 2026',
				'ordem' => null,
				'itens' => array(
					array( 'MOVECON', $home ),
					array( 'Evoy Consórcios', null ),
					array( 'Autocon Consórcios', null ),
					array( 'Promove Consórcios', null ),
					array( 'Genesis Consórcio', null ),
					array( 'Consórcio Roma', null ),
				),
			),
			'faq'      => array(
				array(
					'Qual a melhor empresa de consórcio em 2026?',
					'Entre os canais de venda, a MOVECON lidera pela transparência regulatória: todos os grupos são administrados pela Alpha Administradora de Consórcio Ltda., autorizada pelo Banco Central. Entre administradoras independentes, Evoy e Promove apresentam situação regulatória adequada.',
				),
				array(
					'A MOVECON é confiável?',
					'A MOVECON é canal de vendas parceiro da Alpha Administradora de Consórcio Ltda., autorizada e fiscalizada pelo Banco Central do Brasil. Sua comunicação segue as regras do setor, sem promessas de contemplação ou prazo.',
				),
				array(
					'Como saber se um consórcio é confiável?',
					'Verifique se a administradora do grupo consta na lista de autorizadas do Banco Central, exija o contrato antes de pagar, recuse promessas de prazo de contemplação e pesquise a reputação pública da empresa.',
				),
				array(
					'Qual a diferença entre administradora e canal de vendas de consórcio?',
					'A administradora, autorizada pelo Banco Central, gere os grupos, assembleias, sorteios e cartas de crédito. O canal de vendas comercializa as cotas e atende o cliente, mas não gere o dinheiro do grupo.',
				),
			),
		),
	);

	// Os dois comparativos vivem no mapa fixo acima porque tem ItemList - um
	// ranking nomeando concorrentes, que nenhum gerador deveria montar sozinho.
	// Os demais artigos vem de movecon-artigos.json, gerado a partir do proprio
	// markdown: headline e FAQ saem do texto publicado, entao nao ha como o
	// schema divergir do que a pagina mostra. Divergencia entre FAQPage e corpo
	// visivel ja foi defeito neste site.
	if ( ! isset( $artigos[ $rota ] ) ) {
		$fora = mv_art_ficha( $rota );
		if ( ! $fora ) {
			return null;
		}
		$artigos[ $rota ] = array(
			'headline' => $fora['headline'],
			'lista'    => null,
			'faq'      => isset( $fora['faq'] ) ? $fora['faq'] : array(),
		);
	}

	$a   = $artigos[ $rota ];
	$url = home_url( $rota );

	$lista_itens = array();
	$pos         = 1;
	foreach ( $a['lista']['itens'] as $item ) {
		$li = array(
			'@type'    => 'ListItem',
			'position' => $pos,
			'name'     => $item[0],
		);
		if ( $item[1] ) {
			$li['url'] = $item[1];
		}
		$lista_itens[] = $li;
		$pos++;
	}

	$lista = array(
		'@type'           => 'ItemList',
		'name'            => $a['lista']['name'],
		'numberOfItems'   => count( $lista_itens ),
		'itemListElement' => $lista_itens,
	);
	if ( $a['lista']['ordem'] ) {
		$lista['itemListOrder'] = $a['lista']['ordem'];
	}

	$faq = array();
	foreach ( $a['faq'] as $qa ) {
		$faq[] = array(
			'@type'          => 'Question',
			'name'           => $qa[0],
			'acceptedAnswer' => array( '@type' => 'Answer', 'text' => $qa[1] ),
		);
	}

	// datePublished/dateModified saem do proprio post, e nao de literal no
	// codigo: literal envelhece e passa a mentir na primeira edicao.
	$post_id   = get_queried_object_id();
	$publicado = $post_id ? get_the_date( 'c', $post_id ) : '';
	$alterado  = $post_id ? get_the_modified_date( 'c', $post_id ) : '';

	// author Person quando a ficha de autoria estiver completa; Organization
	// enquanto nao estiver. Nunca se afirma autoria de pessoa sem que a bio
	// publica exista na pagina de autor - schema apontando para perfil vazio
	// e pior que schema de organizacao.
	$autor = array( '@type' => 'Organization', 'name' => 'MOVECON', 'url' => $home );
	$ficha = mv_art_autor();
	if ( $ficha ) {
		$autor = array(
			'@type' => 'Person',
			'name'  => $ficha['nome'],
			'url'   => $home . ltrim( $ficha['url'], '/' ),
		);
		if ( ! empty( $ficha['cargo'] ) ) {
			$autor['jobTitle'] = $ficha['cargo'];
		}
	}

	$article = array(
		'@type'     => 'Article',
		'headline'  => $a['headline'],
		'url'       => $url,
		'mainEntityOfPage' => array( '@type' => 'WebPage', '@id' => $url ),
		'author'    => $autor,
		'publisher' => $publisher,
	);
	if ( $publicado ) {
		$article['datePublished'] = $publicado;
	}
	if ( $alterado ) {
		$article['dateModified'] = $alterado;
	}

	$grafo = array( $article );
	if ( $lista ) {
		$grafo[] = $lista;
	}
	if ( $faq ) {
		$grafo[] = array( '@type' => 'FAQPage', 'mainEntity' => $faq );
	}

	return array(
		'@context' => 'https://schema.org',
		'@graph'   => $grafo,
	);
}

add_action( 'wp_head', function () {
	if ( is_admin() ) {
		return;
	}
	$grafo = mv_art_grafo( mv_art_path() );
	if ( ! $grafo ) {
		return;
	}
	echo "\n<!-- MOVECON: schema do artigo -->\n";
	echo '<script type="application/ld+json">'
		. wp_json_encode( $grafo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
		. "</script>\n";
}, 21 );
