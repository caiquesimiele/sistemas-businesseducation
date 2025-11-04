<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesquisa de Percepção dos Pais — Programa de Empreendedorismo Business Education</title>
    <meta name="description" content="Contribua com sua opinião sobre a experiência do seu filho com o programa de empreendedorismo. Sua percepção é fundamental para continuarmos melhorando.">
    
    <?php 
    // Detectar protocolo
    $protocol = 'http';
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        $protocol = 'https';
    } elseif (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) {
        $protocol = 'https';
    }
    
    // Detectar host
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    
    // Construir URL base
    $baseUrl = $protocol . '://' . $host;
    
    // URL da imagem com cache busting
    $imageUrl = $baseUrl . '/forms/imagens/og_preview_pesquisa_responsaveis.png?v=' . time();
    ?>
    
    <!-- Meta tag para forçar atualização do cache -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <!-- Open Graph meta tags para preview no WhatsApp - POSIÇÃO PRIORITÁRIA -->
    <meta property="og:image" content="<?php echo str_replace('/forms/imagens/', '/imagens/', $imageUrl); ?>">
    <meta property="og:image:secure_url" content="<?php echo str_replace('http://', 'https://', str_replace('/forms/imagens/', '/imagens/', $imageUrl)); ?>">
    <meta property="og:image:width" content="1876">
    <meta property="og:image:height" content="911">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="Pesquisa de Percepção dos Pais - Business Education">
    
    <!-- Meta tag adicional para garantir que apenas esta imagem seja usada -->
    <meta name="robots" content="noimageindex">
    <link rel="image_src" href="<?php echo str_replace('/forms/imagens/', '/imagens/', $imageUrl); ?>">
    <meta property="og:title" content="Pesquisa de Percepção dos Pais — Programa de Empreendedorismo Business Education">
    <meta property="og:description" content="Contribua com sua opinião sobre a experiência do seu filho com o programa de empreendedorismo. Sua percepção é fundamental para continuarmos melhorando.">
    <meta property="og:url" content="<?php echo $protocol . '://' . $host . ($_SERVER['REQUEST_URI'] ?? '/forms/experiencia/pais/'); ?>">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Business Education">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:updated_time" content="<?php echo time(); ?>">
    
    <!-- Meta tags específicas para WhatsApp -->
    <meta property="article:published_time" content="<?php echo date('c'); ?>">
    <meta property="article:modified_time" content="<?php echo date('c'); ?>">
    
    <!-- Meta tags adicionais para Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Pesquisa de Percepção dos Pais — Programa de Empreendedorismo Business Education">
    <meta name="twitter:description" content="Contribua com sua opinião sobre a experiência do seu filho com o programa de empreendedorismo. Sua percepção é fundamental para continuarmos melhorando.">
    <meta name="twitter:image" content="<?php echo str_replace('/forms/imagens/', '/imagens/', $imageUrl); ?>">
    <meta name="twitter:image:alt" content="Pesquisa de Percepção dos Pais - Business Education">
    
    <!-- Meta tag final para forçar apenas nossa imagem -->
    <meta property="og:image:url" content="<?php echo str_replace('/forms/imagens/', '/imagens/', $imageUrl); ?>">
    
    <link rel="icon" type="image/png" href="/imagens/favicon-business.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="pesquisa.css?v=<?php echo time() + 4; ?>">
    <link rel="stylesheet" href="autofill-neutralizer.css">
    <link rel="stylesheet" href="field-feedback.css">
    <link rel="stylesheet" href="rocket-animated.css?v=<?php echo time(); ?>">

</head>
<body>

<!-- Imagem invisível para Open Graph (deve ser a primeira no DOM) -->
<img src="<?php echo str_replace('/forms/imagens/', '/imagens/', $imageUrl); ?>" alt="Pesquisa de Percepção dos Pais - Business Education" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;" aria-hidden="true">

<!-- Banners como IMG para ocupar 100% da largura, sem distorcer -->
<img class="banner-responsive" src="/imagens/Faixa Desperte Azul.png" alt="Desperte a Inovação">
<img class="banner-responsive" src="/imagens/Banner de Pesquisa Pais.png" alt="Pesquisa Pais">

<div class="pesquisa-container">
    <!-- Container do formulário -->
    <div class="pesquisa-form-container">
        <form class="pesquisa-form" id="pesquisaForm">
            
            <!-- Container da mensagem de boas-vindas - AGORA DENTRO DO FORMULÁRIO -->
            <div class="welcome-container">
                <div class="welcome-section">
                    <div class="intro-text">
                        <p>Bem-vindo à nossa pesquisa anual.</p>
                        <p>Sua percepção é fundamental para seguirmos personalizando o programa, garantindo que ele atenda às expectativas e objetivos de pais, educadores e alunos.</p>
                        <p>Obrigado pela sua opinião!</p>
                        
                        <div class="tempo-estimado">
                            <i class="fas fa-clock"></i>
                            Tempo estimado: 4min
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO: Programa de Empreendedorismo -->
            <div class="form-section">
                <h2 class="section-title">
                    <i class="fas fa-lightbulb"></i>
                    Experiência com o Programa de Empreendedorismo
                </h2>
                
                <!-- Pergunta Condicional - Controla a exibição das demais -->
                <div class="form-group pergunta-com-imagem" id="pergunta-1">
                    <!-- Container do conteúdo (pergunta + opções) -->
                    <div class="pergunta-conteudo-container">
                        <label class="pergunta-label required">1. Você já sabia que a escola do seu filho oferece <strong>aulas semanais de empreendedorismo</strong>?</label>
                        
                        <div class="pergunta-opcoes-container">
                            <div class="button-group">
                                <button type="button" class="choice-btn" data-name="conhecimento_aulas" data-value="sim" onclick="selectChoice(this, 'conhecimento_aulas', 'sim'); showConditionalQuestions();">
                                    Sim, já era do meu conhecimento
                                </button>
                                <button type="button" class="choice-btn" data-name="conhecimento_aulas" data-value="nao" onclick="selectChoice(this, 'conhecimento_aulas', 'nao'); hideConditionalQuestions();">
                                    Não. Estou descobrindo agora.
                                </button>
                            </div>
                            <input type="hidden" name="conhecimento_aulas" id="conhecimento_aulas">
                        </div>
                    </div>
                    
                    <!-- Imagem da pergunta 1 -->
                    <div class="pergunta-imagem-container">
                        <img src="/imagens/pergunta 1-pais.png" alt="Ilustração aulas empreendedorismo" class="pergunta-imagem">
                    </div>
                </div>

                <!-- SEÇÃO CONDICIONAL - Só aparece após responder pergunta 1 -->
                <div id="conditional_questions" class="conditional-section">
                    
                    <!-- SEÇÃO: Experiência com a Loja Online -->
                    <div class="form-section">
                        <h2 class="section-title">
                            <i class="fas fa-shopping-cart" style="margin-right: 0.5rem; color: #FF662B;"></i>
                            Experiência com a Loja Online
                        </h2>
                        
                        <div class="form-group pergunta-com-imagem" id="pergunta-2">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">2. Você adquiriu o <strong>material didático</strong> para as aulas de empreendedorismo de 2025?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="choice-options-vertical">
                                        <button type="button" class="choice-btn-vertical" data-name="material_didatico" data-value="comprei_online" onclick="selectChoice(this, 'material_didatico', 'comprei_online');">
                                            Sim, comprei o material pela loja online.
                                        </button>
                                        <button type="button" class="choice-btn-vertical" data-name="material_didatico" data-value="nao_precisei_comprar" onclick="selectChoice(this, 'material_didatico', 'nao_precisei_comprar');">
                                            Sim, mas não precisei comprar.
                                        </button>
                                        <button type="button" class="choice-btn-vertical" data-name="material_didatico" data-value="nao_adquiri" onclick="selectChoice(this, 'material_didatico', 'nao_adquiri');">
                                            Não adquiri o material
                                        </button>
                                    </div>
                                    <input type="hidden" name="material_didatico" id="material_didatico">
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 2 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 2-pais.png" alt="Ilustração material didático" class="pergunta-imagem">
                            </div>
                        </div>

                <div class="form-group pergunta-com-imagem" id="pergunta-3">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">3. Em uma escala de 1 a 10, qual foi sua avaliação geral da <strong>experiência de navegação e compra</strong> em nossa loja online?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="scale-buttons scale-10" data-name="experiencia_loja" data-scale="1-10">
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn extreme" data-value="1" onclick="toggleExplanationField('experiencia_loja', 1)">1 | Muito ruim</button>
                                            <button type="button" class="scale-btn" data-value="2" onclick="toggleExplanationField('experiencia_loja', 2)">2</button>
                                            <button type="button" class="scale-btn" data-value="3" onclick="toggleExplanationField('experiencia_loja', 3)">3</button>
                                            <button type="button" class="scale-btn" data-value="4" onclick="toggleExplanationField('experiencia_loja', 4)">4</button>
                                            <button type="button" class="scale-btn" data-value="5" onclick="toggleExplanationField('experiencia_loja', 5)">5</button>
                                        </div>
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn" data-value="6" onclick="toggleExplanationField('experiencia_loja', 6)">6</button>
                                            <button type="button" class="scale-btn" data-value="7" onclick="toggleExplanationField('experiencia_loja', 7)">7</button>
                                            <button type="button" class="scale-btn" data-value="8" onclick="toggleExplanationField('experiencia_loja', 8)">8</button>
                                            <button type="button" class="scale-btn" data-value="9" onclick="toggleExplanationField('experiencia_loja', 9)">9</button>
                                            <button type="button" class="scale-btn extreme" data-value="10" onclick="toggleExplanationField('experiencia_loja', 10)">10 | Muito bom</button>
                                        </div>
                                    </div>
                                    <input type="hidden" name="experiencia_loja" id="experiencia_loja">
                                    <div class="explanation-field" id="explanation_experiencia_loja" style="display: none; margin-top: 1rem;">
                                        <label class="pergunta-label optional">Gostaria de explicar o motivo da sua avaliação? <span class="optional-text">(opcional)</span></label>
                                        <textarea name="explicacao_experiencia_loja" placeholder="Conte-nos mais sobre sua experiência..." rows="3"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 3 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 3-pais.png" alt="Ilustração experiência navegação" class="pergunta-imagem">
                            </div>
                        </div>

                <div class="form-group pergunta-com-imagem" id="pergunta-4">
                            
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">4. Em uma escala de 1 a 10, qual foi sua avaliação geral do <strong>suporte oferecido pela nossa equipe</strong> da loja?</label>
                                
                                <div class="pergunta-opcoes-container">
                                <div class="scale-buttons scale-10" data-name="suporte_loja" data-scale="1-10">
                                    <div class="scale-row">
                                        <button type="button" class="scale-btn extreme" data-value="1" onclick="toggleExplanationField('suporte_loja', 1)">1 | Muito ruim</button>
                                        <button type="button" class="scale-btn" data-value="2" onclick="toggleExplanationField('suporte_loja', 2)">2</button>
                                        <button type="button" class="scale-btn" data-value="3" onclick="toggleExplanationField('suporte_loja', 3)">3</button>
                                        <button type="button" class="scale-btn" data-value="4" onclick="toggleExplanationField('suporte_loja', 4)">4</button>
                                        <button type="button" class="scale-btn" data-value="5" onclick="toggleExplanationField('suporte_loja', 5)">5</button>
                                    </div>
                                    <div class="scale-row">
                                        <button type="button" class="scale-btn" data-value="6" onclick="toggleExplanationField('suporte_loja', 6)">6</button>
                                        <button type="button" class="scale-btn" data-value="7" onclick="toggleExplanationField('suporte_loja', 7)">7</button>
                                        <button type="button" class="scale-btn" data-value="8" onclick="toggleExplanationField('suporte_loja', 8)">8</button>
                                        <button type="button" class="scale-btn" data-value="9" onclick="toggleExplanationField('suporte_loja', 9)">9</button>
                                        <button type="button" class="scale-btn extreme" data-value="10" onclick="toggleExplanationField('suporte_loja', 10)">10 | Muito bom</button>
                                    </div>
                                </div>
                            <input type="hidden" name="suporte_loja" id="suporte_loja">
                            <div class="explanation-field" id="explanation_suporte_loja" style="display: none; margin-top: 1rem;">
                                <label class="pergunta-label optional">Gostaria de explicar o motivo da sua avaliação? <span class="optional-text">(opcional)</span></label>
                                <textarea name="explicacao_suporte_loja" placeholder="Conte-nos mais sobre sua experiência..." rows="3"></textarea>
                            </div>
                            </div> <!-- Fim pergunta-opcoes-container -->
                            </div> <!-- Fim pergunta-conteudo-container -->
                            
                            <!-- Imagem da pergunta 4 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 4-pais.png" alt="Ilustração suporte equipe" class="pergunta-imagem">
                            </div>
                            
                        </div>
                    </div>

                    <!-- SEÇÃO: Avaliação do Programa -->
                    <div class="form-section">
                        <h2 class="section-title">
                            <i class="fas fa-star" style="margin-right: 0.5rem; color: #FF662B;"></i>
                            Avaliação do Programa
                        </h2>
                        
                        <div class="form-group pergunta-com-imagem-abaixo" id="pergunta-5">
                            <label class="pergunta-label required">5. Como você avalia a <strong>relação custo-benefício dos kits de empreendedorismo</strong> da Business Education?</label>
                            
                            <div class="choice-options-vertical">
                                <button type="button" class="choice-btn-vertical" data-name="custo_beneficio" data-value="otimo" onclick="selectChoice(this, 'custo_beneficio', 'otimo');">
                                    Excelente, o preço está de acordo com a benefício e qualidade;
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="custo_beneficio" data-value="bom" onclick="selectChoice(this, 'custo_beneficio', 'bom');">
                                    Bom, o preço é aceitável em relação ao benefício e qualidade;
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="custo_beneficio" data-value="regular" onclick="selectChoice(this, 'custo_beneficio', 'regular');">
                                    Regular, o preço cobrado é ligeiramente alto para o benefício e qualidade;
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="custo_beneficio" data-value="ruim" onclick="selectChoice(this, 'custo_beneficio', 'ruim');">
                                    Ruim, o preço é muito alto em relação ao benefício e qualidade;
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="custo_beneficio" data-value="pessimo" onclick="selectChoice(this, 'custo_beneficio', 'pessimo');">
                                    Péssimo, o preço é impagável para o benefício e qualidade;
                                </button>
                            </div>
                            <input type="hidden" name="custo_beneficio" id="custo_beneficio">
                            
                            <!-- Imagem da pergunta 5 - embaixo usando largura total -->
                            <div class="pergunta-imagem-container-abaixo">
                                <img src="/imagens/pergunta 5-pais.png" alt="Ilustração custo-benefício" class="pergunta-imagem-abaixo">
                            </div>
                        </div>

                        <div class="form-group pergunta-com-imagem" id="pergunta-6">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">6. Em uma escala de 1 a 10, como você avalia a <strong>qualidade geral dos kits de empreendedorismo</strong> da Business Education?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="scale-buttons scale-10" data-name="qualidade_kits" data-scale="1-10">
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn extreme" data-value="1" onclick="toggleExplanationField('qualidade_kits', 1)">1 | Muito ruim</button>
                                            <button type="button" class="scale-btn" data-value="2" onclick="toggleExplanationField('qualidade_kits', 2)">2</button>
                                            <button type="button" class="scale-btn" data-value="3" onclick="toggleExplanationField('qualidade_kits', 3)">3</button>
                                            <button type="button" class="scale-btn" data-value="4" onclick="toggleExplanationField('qualidade_kits', 4)">4</button>
                                            <button type="button" class="scale-btn" data-value="5" onclick="toggleExplanationField('qualidade_kits', 5)">5</button>
                                        </div>
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn" data-value="6" onclick="toggleExplanationField('qualidade_kits', 6)">6</button>
                                            <button type="button" class="scale-btn" data-value="7" onclick="toggleExplanationField('qualidade_kits', 7)">7</button>
                                            <button type="button" class="scale-btn" data-value="8" onclick="toggleExplanationField('qualidade_kits', 8)">8</button>
                                            <button type="button" class="scale-btn" data-value="9" onclick="toggleExplanationField('qualidade_kits', 9)">9</button>
                                            <button type="button" class="scale-btn extreme" data-value="10" onclick="toggleExplanationField('qualidade_kits', 10)">10 | Muito bom</button>
                                        </div>
                                    </div>
                                    <input type="hidden" name="qualidade_kits" id="qualidade_kits">
                                    <div class="explanation-field" id="explanation_qualidade_kits" style="display: none; margin-top: 1rem;">
                                        <label class="pergunta-label optional">Gostaria de explicar o motivo da sua avaliação? <span class="optional-text">(opcional)</span></label>
                                        <textarea name="explicacao_qualidade_kits" placeholder="Conte-nos mais sobre sua avaliação..." rows="3"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 6 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 6-pais.png" alt="Ilustração qualidade kits" class="pergunta-imagem">
                            </div>
                        </div>

                <div class="form-group pergunta-com-imagem-abaixo" id="pergunta-7">
                            <label class="pergunta-label required">7. Como você avalia a importância da escola oferecer uma formação empreendedora para os alunos?</label>
                            
                            <div class="choice-options-vertical">
                                <button type="button" class="choice-btn-vertical" data-name="importancia_formacao" data-value="muito_importante" onclick="selectChoice(this, 'importancia_formacao', 'muito_importante');">
                                    Muito importante.
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="importancia_formacao" data-value="pouco_importante" onclick="selectChoice(this, 'importancia_formacao', 'pouco_importante');">
                                    Pouco importante.
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="importancia_formacao" data-value="irrelevante" onclick="selectChoice(this, 'importancia_formacao', 'irrelevante');">
                                    Irrelevante.
                                </button>
                                <button type="button" class="choice-btn-vertical" data-name="importancia_formacao" data-value="prejudicial" onclick="selectChoice(this, 'importancia_formacao', 'prejudicial');">
                                    Perda de foco e prejudicial.
                                </button>
                            </div>
                            <input type="hidden" name="importancia_formacao" id="importancia_formacao">
                            
                            <!-- Imagem da pergunta 7 - embaixo usando largura total -->
                            <div class="pergunta-imagem-container-abaixo">
                                <img src="/imagens/pergunta 7-pais.png" alt="Ilustração formação empreendedora" class="pergunta-imagem-abaixo">
                            </div>
                        </div>
                    </div>

                    <!-- SEÇÃO: Experiência do seu Filho -->
                    <div class="form-section">
                        <h2 class="section-title">
                            <i class="fas fa-child" style="margin-right: 0.5rem; color: #FF662B;"></i>
                            Experiência do seu Filho
                        </h2>
                        
                        <div class="form-group pergunta-com-imagem" id="pergunta-8">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">8. Você sente que os projetos e as aulas de empreendedorismo tem despertado o <strong>interesse do seu filho</strong>?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="choice-options-vertical">
                                        <button type="button" class="choice-btn-vertical" data-name="interesse_filho" data-value="muito_interesse" onclick="selectChoice(this, 'interesse_filho', 'muito_interesse');">
                                            Muito, meu filho ama as aulas e projetos.
                                        </button>
                                        <button type="button" class="choice-btn-vertical" data-name="interesse_filho" data-value="gosta_suficiente" onclick="selectChoice(this, 'interesse_filho', 'gosta_suficiente');">
                                            Sim, meu filho gosta o suficiente.
                                        </button>
                                        <button type="button" class="choice-btn-vertical" data-name="interesse_filho" data-value="pouco_interesse" onclick="selectChoice(this, 'interesse_filho', 'pouco_interesse');">
                                            Pouco, meu filho não liga muito.
                                        </button>
                                        <button type="button" class="choice-btn-vertical" data-name="interesse_filho" data-value="nao_interesse" onclick="selectChoice(this, 'interesse_filho', 'nao_interesse');">
                                            Não, meu filho preferiria que não houvesse.
                                        </button>
                                    </div>
                                    <input type="hidden" name="interesse_filho" id="interesse_filho">
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 8 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 8-pais.png" alt="Ilustração interesse do filho" class="pergunta-imagem">
                            </div>
                        </div>

                        <div class="form-group pergunta-com-imagem" id="pergunta-9">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">9. Na sua avaliação em escala de 1 a 10, quanto o programa tem contribuído para o <strong>desenvolvimento de habilidades cruciais</strong> tais como gestão, criatividade, liderança e resolução de problemas?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="scale-buttons scale-10" data-name="desenvolvimento_habilidades" data-scale="1-10">
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn extreme" data-value="1" onclick="toggleExplanationField('desenvolvimento_habilidades', 1)">1 | Muito pouco</button>
                                            <button type="button" class="scale-btn" data-value="2" onclick="toggleExplanationField('desenvolvimento_habilidades', 2)">2</button>
                                            <button type="button" class="scale-btn" data-value="3" onclick="toggleExplanationField('desenvolvimento_habilidades', 3)">3</button>
                                            <button type="button" class="scale-btn" data-value="4" onclick="toggleExplanationField('desenvolvimento_habilidades', 4)">4</button>
                                            <button type="button" class="scale-btn" data-value="5" onclick="toggleExplanationField('desenvolvimento_habilidades', 5)">5</button>
                                        </div>
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn" data-value="6" onclick="toggleExplanationField('desenvolvimento_habilidades', 6)">6</button>
                                            <button type="button" class="scale-btn" data-value="7" onclick="toggleExplanationField('desenvolvimento_habilidades', 7)">7</button>
                                            <button type="button" class="scale-btn" data-value="8" onclick="toggleExplanationField('desenvolvimento_habilidades', 8)">8</button>
                                            <button type="button" class="scale-btn" data-value="9" onclick="toggleExplanationField('desenvolvimento_habilidades', 9)">9</button>
                                            <button type="button" class="scale-btn extreme" data-value="10" onclick="toggleExplanationField('desenvolvimento_habilidades', 10)">10 | Muito</button>
                                        </div>
                                    </div>
                                    <input type="hidden" name="desenvolvimento_habilidades" id="desenvolvimento_habilidades">
                                    <div class="explanation-field" id="explanation_desenvolvimento_habilidades" style="display: none; margin-top: 1rem;">
                                        <label class="pergunta-label optional">Gostaria de explicar o motivo da sua avaliação? <span class="optional-text">(opcional)</span></label>
                                        <textarea name="explicacao_desenvolvimento_habilidades" placeholder="Conte-nos mais sobre sua avaliação..." rows="3"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 9 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 9-pais.png" alt="Ilustração desenvolvimento habilidades" class="pergunta-imagem">
                            </div>
                        </div>

                <div class="form-group pergunta-com-imagem" id="pergunta-10">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">10. Na sua avaliação em escala de 1 a 10, quanto a equipe pedagógica do colégio, incluindo a professora, tem se engajado com a proposta de formar alunos empreendedores?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="scale-buttons scale-10" data-name="engajamento_equipe" data-scale="1-10">
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn extreme" data-value="1" onclick="toggleExplanationField('engajamento_equipe', 1)">1 | Muito pouco</button>
                                            <button type="button" class="scale-btn" data-value="2" onclick="toggleExplanationField('engajamento_equipe', 2)">2</button>
                                            <button type="button" class="scale-btn" data-value="3" onclick="toggleExplanationField('engajamento_equipe', 3)">3</button>
                                            <button type="button" class="scale-btn" data-value="4" onclick="toggleExplanationField('engajamento_equipe', 4)">4</button>
                                            <button type="button" class="scale-btn" data-value="5" onclick="toggleExplanationField('engajamento_equipe', 5)">5</button>
                                        </div>
                                        <div class="scale-row">
                                            <button type="button" class="scale-btn" data-value="6" onclick="toggleExplanationField('engajamento_equipe', 6)">6</button>
                                            <button type="button" class="scale-btn" data-value="7" onclick="toggleExplanationField('engajamento_equipe', 7)">7</button>
                                            <button type="button" class="scale-btn" data-value="8" onclick="toggleExplanationField('engajamento_equipe', 8)">8</button>
                                            <button type="button" class="scale-btn" data-value="9" onclick="toggleExplanationField('engajamento_equipe', 9)">9</button>
                                            <button type="button" class="scale-btn extreme" data-value="10" onclick="toggleExplanationField('engajamento_equipe', 10)">10 | Muito</button>
                                        </div>
                                    </div>
                                    <input type="hidden" name="engajamento_equipe" id="engajamento_equipe">
                                    <div class="explanation-field" id="explanation_engajamento_equipe" style="display: none; margin-top: 1rem;">
                                        <label class="pergunta-label optional">Gostaria de explicar o motivo da sua avaliação? <span class="optional-text">(opcional)</span></label>
                                        <textarea name="explicacao_engajamento_equipe" placeholder="Conte-nos mais sobre sua avaliação..." rows="3"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 10 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 10-pais.png" alt="Ilustração engajamento equipe" class="pergunta-imagem">
                            </div>
                        </div>
                    </div>

                    <!-- SEÇÃO: Seu Feedback -->
                    <div class="form-section">
                        <h2 class="section-title">
                            <i class="fas fa-comments" style="margin-right: 0.5rem; color: #FF662B;"></i>
                            Seu Feedback
                        </h2>
                        
                        <div class="form-group">
                            <label class="pergunta-label required">11. Conte pra nós os <strong>pontos fortes</strong> que mais te agradam no programa da Business Education?</label>
                            <textarea name="pontos_fortes" id="pontos_fortes" placeholder="Descreva os aspectos positivos que mais valoriza no programa..." rows="4"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="pergunta-label required">12. Conte pra nós o que podemos fazer para tornar sua <strong>experiência ainda melhor</strong> com o programa?</label>
                            <textarea name="melhorias_sugestoes" id="melhorias_sugestoes" placeholder="Compartilhe suas sugestões e ideias para aprimorarmos o programa..." rows="4"></textarea>
                        </div>

                <div class="form-group question-highlight pergunta-com-imagem" id="pergunta-13">
                            <!-- Container do conteúdo (pergunta + opções) -->
                            <div class="pergunta-conteudo-container">
                                <label class="pergunta-label required">13. Em sua opinião, a <strong>formação empreendedora deve continuar sendo oferecida pela escola</strong>?</label>
                                
                                <div class="pergunta-opcoes-container">
                                    <div class="button-group">
                                        <button type="button" class="choice-btn choice-btn-highlight" data-name="continuar_programa" data-value="sim" onclick="selectChoice(this, 'continuar_programa', 'sim');">
                                            Sim, o programa deve continuar construindo uma cultura empreendedora na escola.
                                        </button>
                                        <button type="button" class="choice-btn choice-btn-highlight" data-name="continuar_programa" data-value="nao" onclick="selectChoice(this, 'continuar_programa', 'nao');">
                                            Não, acredito que o programa não deve continuar na escola.
                                        </button>
                                    </div>
                                    <input type="hidden" name="continuar_programa" id="continuar_programa">
                                </div>
                            </div>
                            
                            <!-- Imagem da pergunta 13 -->
                            <div class="pergunta-imagem-container">
                                <img src="/imagens/pergunta 13-pais.png" alt="Ilustração continuidade programa" class="pergunta-imagem">
                            </div>
                        </div>
            </div>

                </div> <!-- Fim da seção condicional -->
            </div>

            <!-- SEÇÃO: Suas Informações -->
            <div class="form-section">
                <h2 class="section-title">
                    <i class="fas fa-user" style="margin-right: 0.5rem; color: #FF662B;"></i>
                    Suas Informações
                </h2>
                
                <?php 
                // Carregar configurações do formulário
                $config = require_once '../config.php';
                $form_fields = $config['forms']['pais']['form_fields'] ?? [];
                ?>
                
                <div class="form-group">
                    <label class="pergunta-label required"><?php echo $form_fields['escola']['label'] ?? 'Qual a escola do seu filho?'; ?></label>
                    <!-- Dropdown customizado para evitar problemas de renderização -->
                    <div class="custom-dropdown" id="escola-dropdown">
                        <div class="dropdown-selected" onclick="toggleDropdown('escola')">
                            <span class="selected-text" data-placeholder="<?php echo $form_fields['escola']['placeholder'] ?? 'Selecione a escola'; ?>"><?php echo $form_fields['escola']['placeholder'] ?? 'Selecione a escola'; ?></span>
                            <svg class="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="dropdown-options" id="escola-options">
                            <?php 
                            $escola_options = $config['schools']['list'] ?? [];
                            foreach ($escola_options as $value => $label): ?>
                                <div class="dropdown-option" onclick="selectOption('escola', '<?php echo htmlspecialchars($label, ENT_QUOTES); ?>')"><?php echo htmlspecialchars($label); ?></div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <input type="hidden" name="escola" id="escola" required>
                    
                    <!-- Campo de texto para "Outra escola" se habilitado -->
                    <?php if (($config['schools']['allow_other'] ?? false) && isset($escola_options['outro'])): ?>
                    <div class="form-group" id="outro_escola_container" style="display: none; margin-top: 1rem;">
                        <label class="pergunta-label optional">Especifique a escola <span class="optional-text">(opcional)</span></label>
                        <input type="text" name="escola_outro" id="escola_outro" placeholder="Nome da escola">
                    </div>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label class="pergunta-label required"><?php echo $form_fields['segmento']['label'] ?? 'Segmento:'; ?></label>
                    <!-- Dropdown customizado para evitar problemas de renderização -->
                    <div class="custom-dropdown" id="segmento-dropdown">
                        <div class="dropdown-selected" onclick="toggleDropdown('segmento')">
                            <span class="selected-text" data-placeholder="<?php echo $form_fields['segmento']['placeholder'] ?? 'Selecione o segmento'; ?>"><?php echo $form_fields['segmento']['placeholder'] ?? 'Selecione o segmento'; ?></span>
                            <svg class="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="dropdown-options" id="segmento-options">
                            <?php 
                            $segmento_options = $config['segments']['list'] ?? [];
                            foreach ($segmento_options as $value => $label): ?>
                                <div class="dropdown-option" onclick="selectOption('segmento', '<?php echo htmlspecialchars($label, ENT_QUOTES); ?>')"><?php echo htmlspecialchars($label); ?></div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <input type="hidden" name="segmento" id="segmento" required>
                </div>

                <div class="form-group">
                    <label class="pergunta-label required">Seu nome completo:</label>
                    <input type="text" name="nome_completo" id="nome_completo" placeholder="Seu nome completo" required>
                </div>
            </div>

            <!-- Botão de envio -->
            <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i>
                Enviar Pesquisa
            </button>

        </form>
        
        <!-- Mensagens de feedback -->
        <div id="message" class="message"></div>
    </div>
</div>

<!-- Popup de validação -->
<div id="validation-popup-overlay" class="validation-popup-overlay">
    <div class="validation-popup">
        <div class="validation-popup-header">
            <i class="fas fa-exclamation-triangle icon"></i>
            <h3>Campos obrigatórios não preenchidos</h3>
            <button type="button" class="validation-popup-close" onclick="closeValidationPopup()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="validation-popup-body">
            <p class="validation-popup-message">
                Para enviar a pesquisa, é necessário responder todas as perguntas obrigatórias. 
                Por favor, complete as seguintes perguntas:
            </p>
            <div class="missing-questions-list">
                <h4>
                    <i class="fas fa-list-ul icon"></i>
                    Perguntas em falta
                </h4>
                <div id="missing-questions-grid" class="missing-questions-grid">
                    <!-- Itens serão inseridos dinamicamente -->
                </div>
            </div>
            <div class="validation-popup-actions">
                <button type="button" class="validation-popup-btn" onclick="closeValidationPopup()">
                    <i class="fas fa-check"></i>
                    Entendi, vou preencher
                </button>
            </div>
        </div>
    </div>
</div>

<script src="field-feedback.js"></script>
<script src="pesquisa.js?v=<?php echo time() + 3; ?>"></script>
</body>
</html> 