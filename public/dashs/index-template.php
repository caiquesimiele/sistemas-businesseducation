<?php
// Headers para evitar cache
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Sistema usando APIs que leem JSONs reais
// Configurar sessão para não expirar rapidamente
ini_set('session.gc_maxlifetime', 7200); // 2 horas
ini_set('session.cookie_lifetime', 7200); // 2 horas
session_start();

// Verificar se usuário está logado (sistema de autenticação real)
if (!isset($_SESSION['user_id'])) {
    // Redirecionar para login se não estiver autenticado
    header('Location: /auth/login.php');
    exit;
}

// OBTER MAINTAINER_ID DE FORMA SEGURA
// Verificar se o usuário tem acesso à organização solicitada
require_once '../../../auth/auth-functions.php';

// Verificar se há múltiplas organizações selecionadas
$selectedOrganizations = [];
if (isset($_GET['orgs']) && is_array($_GET['orgs'])) {
    // Múltiplas organizações via parâmetro
    foreach ($_GET['orgs'] as $org) {
        if (hasAssociationAccess($org)) {
            $selectedOrganizations[] = $org;
        }
    }
} elseif (isset($_SESSION['selected_organizations']) && is_array($_SESSION['selected_organizations'])) {
    // Múltiplas organizações da sessão
    foreach ($_SESSION['selected_organizations'] as $org) {
        if (hasAssociationAccess($org)) {
            $selectedOrganizations[] = $org;
        }
    }
}

// Se não há múltiplas organizações, usar o modo single
if (empty($selectedOrganizations)) {
    $requested_maintainer = $_GET['maintainer_id'] ?? $_SESSION['maintainer_id'] ?? 'arf';
    
    // Verificar se o usuário tem acesso a esta organização
    if (!hasAssociationAccess($requested_maintainer)) {
        // Se não tem acesso, usar a primeira organização permitida
        $userOrgs = getUserOrganizations();
        $maintainer_id = !empty($userOrgs) ? $userOrgs[0] : $_SESSION['maintainer_id'];
        
        // Redirecionar para a URL correta
        header('Location: ?maintainer_id=' . $maintainer_id);
        exit;
    } else {
        $maintainer_id = $requested_maintainer;
    }
    $selectedMaintainer = $maintainer_id;
    $isMultipleOrgs = false;
} else {
    // Modo múltiplas organizações
    $maintainer_id = $selectedOrganizations[0]; // Primeira como principal para compatibilidade
    $selectedMaintainer = $maintainer_id;
    $isMultipleOrgs = true;
}

// Carregar configurações da mantenedora
$maintainerConfig = loadMaintainerConfig($selectedMaintainer);
$selectedMaintainerName = $maintainerConfig['maintainer']['name'];

// Obter dados da sessão
$userInfo = [
    'id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'maintainer_id' => $maintainer_id, // Usar maintainer_id dinâmico
    'role' => $_SESSION['role'],
    'full_name' => $_SESSION['full_name']
];
$isAdmin = ($userInfo['role'] === 'admin');

// Configurações dinâmicas baseadas no maintainer_id
// $selectedMaintainer será definido após verificação de múltiplas organizações

// Carregar configurações da mantenedora via HTTP
function loadMaintainerConfig($maintainer_id) {
    try {
        // Fazer requisição HTTP para o forms
        $configUrl = "https://forms.businesseducation.com.br/experiencia/mantenedoras/{$maintainer_id}/config.php";
        
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'header' => [
                    'User-Agent: Dashboard-Internal/1.0'
                ]
            ]
        ]);
        
        $configResponse = file_get_contents($configUrl, false, $context);
        
        if ($configResponse === false) {
            throw new Exception("Não foi possível carregar configuração via HTTP");
        }
        
        // Executar o código PHP da configuração
        $tempFile = tempnam(sys_get_temp_dir(), 'config_');
        file_put_contents($tempFile, $configResponse);
        $config = require $tempFile;
        unlink($tempFile);
        
        return $config;
        
    } catch (Exception $e) {
        // Fallback: configuração básica
        return [
            'maintainer' => [
                'id' => $maintainer_id,
                'name' => 'ARF - Associação Rio Fluminense'
            ]
        ];
    }
}

// Obter filtros - SELEÇÃO MÚLTIPLA PARA ESCOLA, SEGMENTO E MATERIAL DIDÁTICO
$filtroEscola = $_GET['escola'] ?? [];
$filtroSegmento = $_GET['segmento'] ?? [];
$filtroMaterial = $_GET['material_didatico'] ?? [];
$filtroNome = $_GET['nome'] ?? '';
$filtroAnoProjeto = $_GET['project_year'] ?? ''; // NOVO: Filtro de ano-projeto

// Converter para array se for string (compatibilidade)
if (!is_array($filtroEscola)) {
    $filtroEscola = !empty($filtroEscola) ? [$filtroEscola] : [];
}
if (!is_array($filtroSegmento)) {
    $filtroSegmento = !empty($filtroSegmento) ? [$filtroSegmento] : [];
}
if (!is_array($filtroMaterial)) {
    $filtroMaterial = !empty($filtroMaterial) ? [$filtroMaterial] : [];
}

// CORREÇÃO: Sempre mostrar loading, exceto quando explicitamente pulado
$showLoading = $_GET['show_loading'] ?? '';
if ($showLoading !== 'skip') {
    // Sempre mostrar loading para melhor experiência do usuário
    $currentParams = $_GET;
    $currentParams['show_loading'] = 'skip'; // Evitar loop infinito
    
    $loadingUrl = 'loading.php?' . http_build_query($currentParams);
    header('Location: ' . $loadingUrl);
    exit;
}

// Buscar dados reais via API - Requisição HTTP entre subdomínios
$formsData = null;
$debugInfo = [];

try {
    // Se múltiplas organizações, fazer requisições separadas e consolidar
    if ($isMultipleOrgs) {
        $allData = [];
        $allResponses = [];
        $allSchools = [];
        $allSegments = [];
        $allMaterials = [];
        $allNames = [];
        $consolidatedStats = [];
        
        foreach ($selectedOrganizations as $org) {
            // Construir URL da API do subdomínio forms para cada organização
            $apiUrl = 'https://forms.businesseducation.com.br/api/dashboard-data.php';
            $params = [
                'maintainer_id' => $org,
                'survey_type' => 'pais'
            ];
            
            // Aplicar filtros
            if (!empty($filtroEscola)) {
                $params['escola'] = is_array($filtroEscola) ? implode(',', $filtroEscola) : $filtroEscola;
            }
            if (!empty($filtroSegmento)) {
                $params['segmento'] = is_array($filtroSegmento) ? implode(',', $filtroSegmento) : $filtroSegmento;
            }
            if (!empty($filtroMaterial)) {
                $params['material_didatico'] = is_array($filtroMaterial) ? implode(',', $filtroMaterial) : $filtroMaterial;
            }
            if ($filtroNome) $params['nome_completo'] = $filtroNome;
            if ($filtroAnoProjeto !== '' && $filtroAnoProjeto !== null) $params['project_year'] = $filtroAnoProjeto; // NOVO: Filtro de ano-projeto
            
            // Fazer requisição
            $fullUrl = $apiUrl . '?' . http_build_query($params);
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => 10,
                    'header' => [
                        'User-Agent: Dashboard-Internal/1.0',
                        'Accept: application/json',
                        'Cache-Control: no-cache'
                    ]
                ]
            ]);
            
            $apiResponse = @file_get_contents($fullUrl, false, $context);
            if ($apiResponse !== false) {
                $orgData = json_decode($apiResponse, true);
                if ($orgData && isset($orgData['data'])) {
                    // Adicionar identificador da organização em cada resposta
                    foreach ($orgData['data'] as &$response) {
                        $response['org_source'] = $org;
                    }
                    $allData = array_merge($allData, $orgData['data']);
                }
            }
        }
        
        // Consolidar dados de todas as organizações
        $formsData = [
            'status' => 'success',
            'data' => $allData,
            'total' => count($allData),
            'maintainer_name' => 'Múltiplas Organizações (' . count($selectedOrganizations) . ')',
            'is_consolidated' => true,
            'organizations' => $selectedOrganizations
        ];
        
        $selectedMaintainer = implode(',', $selectedOrganizations);
        $selectedMaintainerName = 'Múltiplas Organizações';
        
    } else {
        // Modo single organization (código original)
        $apiUrl = 'https://forms.businesseducation.com.br/api/dashboard-data.php';
        $params = [
            'maintainer_id' => $selectedMaintainer,
            'survey_type' => 'pais'
        ];
        
        // CORREÇÃO: Filtros como ARRAYS (padrão loja) em vez de strings concatenadas
        $filters = [];
        if (!empty($filtroEscola)) $filters['escola'] = $filtroEscola;
        if (!empty($filtroSegmento)) $filters['segmento'] = $filtroSegmento;  
        if (!empty($filtroMaterial)) $filters['material_didatico'] = $filtroMaterial;
        if ($filtroNome) $filters['nome_completo'] = $filtroNome;
        if ($filtroAnoProjeto !== '' && $filtroAnoProjeto !== null) $filters['project_year'] = $filtroAnoProjeto; // NOVO: Filtro de ano-projeto
        
        // Converter filtros para parâmetros de URL (compatibilidade API atual)
        if (!empty($filtroEscola)) {
            $params['escola'] = is_array($filtroEscola) ? implode(',', $filtroEscola) : $filtroEscola;
        }
        if (!empty($filtroSegmento)) {
            $params['segmento'] = is_array($filtroSegmento) ? implode(',', $filtroSegmento) : $filtroSegmento;
        }
        if (!empty($filtroMaterial)) {
            $params['material_didatico'] = is_array($filtroMaterial) ? implode(',', $filtroMaterial) : $filtroMaterial;
        }
        if ($filtroNome) $params['nome_completo'] = $filtroNome;
        if ($filtroAnoProjeto !== '' && $filtroAnoProjeto !== null) $params['project_year'] = $filtroAnoProjeto; // NOVO: Filtro de ano-projeto
        
        // Construir URL completa com parâmetros
        $fullUrl = $apiUrl . '?' . http_build_query($params);
        
        
        // Fazer requisição HTTP
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
                'header' => [
                    'User-Agent: Dashboard-Internal/1.0',
                    'Accept: application/json',
                    'Cache-Control: no-cache'
                ]
            ]
        ]);
        
        $apiResponse = file_get_contents($fullUrl, false, $context);
        
        if ($apiResponse === false) {
            throw new Exception('Falha na requisição HTTP para API do forms');
        }
        
        $formsData = json_decode($apiResponse, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Resposta da API não é um JSON válido: ' . json_last_error_msg());
        }
        
        $debugInfo = [
            'method' => 'http_request',
            'url' => $fullUrl,
            'response_size' => strlen($apiResponse),
            'json_valid' => true,
            'status' => $formsData['status'] ?? 'no_status',
            'data_count' => isset($formsData['data']) ? count($formsData['data']) : 0
        ];
    }
    
} catch (Exception $e) {
    $debugInfo = [
        'method' => 'http_request_failed',
        'error' => $e->getMessage(),
        'url' => $fullUrl ?? 'N/A',
        'fallback' => 'using_mock_data'
    ];
}

// SEMPRE buscar opções de filtro ANTES de processar dados com filtros
// BUSCAR ESCOLAS E SEGMENTOS via API do SmartFormsIndexer (SEM FILTROS)
$escolas = [];
$segmentos = [];
$nomes = [];
$apiTested = false;

// Buscar opções de filtro dos dados reais (não do config)
try {
    if ($isMultipleOrgs) {
        // Para múltiplas organizações, buscar filtros de todas e consolidar
        $allFilterSchools = [];
        $allFilterSegments = [];
        $allFilterNames = [];
        $allFilterMaterials = [];
        
        foreach ($selectedOrganizations as $org) {
            $filterApiUrl = 'https://forms.businesseducation.com.br/api/dashboard-data.php?get_stats=true&maintainer_id=' . urlencode($org) . '&survey_type=pais';
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'ignore_errors' => true,
                    'method' => 'GET'
                ]
            ]);
            
            $filterResponse = @file_get_contents($filterApiUrl, false, $context);
            if ($filterResponse !== false) {
                $filterData = json_decode($filterResponse, true);
                if ($filterData && $filterData['status'] === 'success') {
                    if (!empty($filterData['schools'])) {
                        foreach ($filterData['schools'] as $school) {
                            $allFilterSchools[$school] = $school;
                        }
                    }
                    if (!empty($filterData['segments'])) {
                        foreach ($filterData['segments'] as $segment) {
                            $allFilterSegments[$segment] = $segment;
                        }
                    }
                    if (!empty($filterData['names'])) {
                        foreach ($filterData['names'] as $name) {
                            $allFilterNames[$name] = $name;
                        }
                    }
                    if (!empty($filterData['materials'])) {
                        foreach ($filterData['materials'] as $material) {
                            $allFilterMaterials[$material] = $material;
                        }
                    }
                }
            }
        }
        
        $escolas = array_values($allFilterSchools);
        $segmentos = array_values($allFilterSegments);
        $nomes = array_values($allFilterNames);
        $materiais = array_values($allFilterMaterials);
        
    } else {
        // Modo single (código original)
        $filterApiUrl = 'https://forms.businesseducation.com.br/api/dashboard-data.php?get_stats=true&maintainer_id=' . urlencode($selectedMaintainer) . '&survey_type=pais';
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'ignore_errors' => true,
                'method' => 'GET'
            ]
        ]);
        
        $filterResponse = file_get_contents($filterApiUrl, false, $context);
        
        if ($filterResponse !== false) {
            $filterData = json_decode($filterResponse, true);
            
            if ($filterData && $filterData['status'] === 'success') {
                $escolas = $filterData['schools'] ?? [];
                $segmentos = $filterData['segments'] ?? [];
                $materiais = $filterData['materials'] ?? [];
                $nomes = $filterData['names'] ?? [];
                
                error_log("DASHBOARD SUCCESS - Filtros carregados dos dados reais: " . count($escolas) . " escolas, " . count($segmentos) . " segmentos, " . count($materiais) . " materiais");
            }
        }
    }
} catch (Exception $e) {
    error_log("DASHBOARD ERROR - Falha ao carregar filtros: " . $e->getMessage());
}

// Se não conseguiu dados, deixar arrays vazios (não mostrar opções inexistentes)
if (empty($escolas)) {
    $escolas = [];
    error_log("DASHBOARD INFO - Nenhuma escola com dados de pais encontrada");
}
if (empty($segmentos)) {
    $segmentos = [];
    error_log("DASHBOARD INFO - Nenhum segmento com dados de pais encontrado");
}
if (empty($materiais)) {
    $materiais = [];
    error_log("DASHBOARD INFO - Nenhum material didático com dados de pais encontrado");
}

// AGORA processar dados com filtros
if ($formsData && isset($formsData['status']) && $formsData['status'] === 'success' && !empty($formsData['data'])) {
    // Usar dados reais da API
    $dadosProcessados = processarDadosReais($formsData['data']);
    $selectedMaintainerName = $formsData['maintainer_name'] ?? 'ARF - Associação Rio Fluminense';
    
    // Extrair nomes dos dados de resposta (apenas dos dados filtrados)
    foreach ($formsData['data'] as $item) {
        $data = $item['data'] ?? [];
        
        if (!empty($data['nome_completo'])) {
            $nomes[] = $data['nome_completo'];
        }
    }
    
    $nomes = array_unique($nomes);
    
    $erro = "Dados reais carregados de " . count($formsData['data']) . " JSONs";
    
    // Salvar cache dos dados processados
    $cache_key = md5($selectedMaintainer . 'pais' . serialize($_GET));
    $cache_file = '../../cache/dashboard_pais_' . $cache_key . '.json';
    $cache_dir = dirname($cache_file);
    
    if (!is_dir($cache_dir)) {
        mkdir($cache_dir, 0755, true);
    }
    
    $cache_data = [
        'timestamp' => time(),
        'dados_processados' => $dadosProcessados,
        'maintainer_name' => $selectedMaintainerName,
        'escolas' => $escolas,
        'segmentos' => $segmentos,
        'nomes' => $nomes,
        'erro' => $erro
    ];
    
    file_put_contents($cache_file, json_encode($cache_data));
    
    // Salvar cache base (sem filtros) para verificação de loading
    $base_cache_key = md5($selectedMaintainer . 'pais_base_data');
    $base_cache_file = '../../cache/dashboard_pais_' . $base_cache_key . '.json';
    
    $base_cache_data = [
        'timestamp' => time(),
        'maintainer_name' => $selectedMaintainerName,
        'has_data' => true
    ];
    
    file_put_contents($base_cache_file, json_encode($base_cache_data));
    
} else {
    // Erro: sem dados reais disponíveis
    $dadosProcessados = [
        'total_respostas' => 0,
        'conhecimento_aulas' => ['Sim' => 0, 'Não' => 0],
        'material_didatico' => [
            'Sim, comprei o material pela loja online' => 0,
            'Sim, mas não precisei comprar' => 0,
            'Não adquiri o material' => 0
        ],
        'experiencia_loja' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        'suporte_loja' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        'custo_beneficio' => [
            'Excelente, o preço está de acordo com a benefício e qualidade' => 0,
            'Bom, o preço é aceitável em relação ao benefício e qualidade' => 0,
            'Regular, o preço cobrado é ligeiramente alto para o benefício e qualidade' => 0,
            'Ruim, o preço é muito alto em relação ao benefício e qualidade' => 0,
            'Péssimo, o preço é impagável para o benefício e qualidade' => 0
        ],
        'qualidade_kits' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        'importancia_formacao' => [
            'Muito importante.' => 0,
            'Pouco importante.' => 0,
            'Irrelevante.' => 0,
            'Perda de foco e prejudicial.' => 0
        ],
        'interesse_filho' => [
            'Muito, meu filho ama as aulas e projetos' => 0,
            'Sim, meu filho gosta o suficiente' => 0,
            'Pouco, meu filho não liga muito' => 0,
            'Não, meu filho preferiria que não houvesse' => 0
        ],
        'desenvolvimento_habilidades' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        'engajamento_equipe' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        'continuar_programa' => ['Sim' => 0, 'Não' => 0],
        'pontos_fortes' => [],
        'melhorias_sugestoes' => []
    ];
    
    // IMPORTANTE: NÃO sobrescrever as opções de filtro!
    // As variáveis $escolas e $segmentos devem manter as opções originais
    // para que o usuário possa sempre alterar os filtros
    $nomes = [];
    $erro = "ERRO: API de forms não disponível - " . ($debugInfo['error'] ?? 'Erro desconhecido');
}

function processarDadosReais($dados) {
    $processados = [
        'total_respostas' => count($dados),
        // Pergunta 1: Conhecimento das aulas de empreendedorismo
        'conhecimento_aulas' => ['Sim' => 0, 'Não' => 0],
        // Pergunta 2: Aquisição do material didático
        'material_didatico' => [
            'Sim, comprei o material pela loja online' => 0,
            'Sim, mas não precisei comprar' => 0,
            'Não adquiri o material' => 0
        ],
        // Pergunta 3: Experiência de navegação na loja (escala 1-10)
        'experiencia_loja' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        // Pergunta 4: Suporte da equipe da loja (escala 1-10)
        'suporte_loja' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        // Pergunta 5: Custo-benefício dos kits
        'custo_beneficio' => [
            'Excelente, o preço está de acordo com a benefício e qualidade' => 0,
            'Bom, o preço é aceitável em relação ao benefício e qualidade' => 0,
            'Regular, o preço cobrado é ligeiramente alto para o benefício e qualidade' => 0,
            'Ruim, o preço é muito alto em relação ao benefício e qualidade' => 0,
            'Péssimo, o preço é impagável para o benefício e qualidade' => 0
        ],
        // Pergunta 6: Qualidade dos kits (escala 1-10)
        'qualidade_kits' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        // Pergunta 7: Importância da formação empreendedora
        'importancia_formacao' => [
            'Muito importante.' => 0,
            'Pouco importante.' => 0,
            'Irrelevante.' => 0,
            'Perda de foco e prejudicial.' => 0
        ],
        // Pergunta 8: Interesse do filho pelos projetos
        'interesse_filho' => [
            'Muito, meu filho ama as aulas e projetos' => 0,
            'Sim, meu filho gosta o suficiente' => 0,
            'Pouco, meu filho não liga muito' => 0,
            'Não, meu filho preferiria que não houvesse' => 0
        ],
        // Pergunta 9: Desenvolvimento de habilidades (escala 1-10)
        'desenvolvimento_habilidades' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        // Pergunta 10: Engajamento da equipe pedagógica (escala 1-10)
        'engajamento_equipe' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0, 7 => 0, 8 => 0, 9 => 0, 10 => 0],
        // Pergunta 13: Continuidade do programa
        'continuar_programa' => ['Sim' => 0, 'Não' => 0],
        // Respostas abertas
        'pontos_fortes' => [],
        'melhorias_sugestoes' => []
    ];
    
    foreach ($dados as $item) {
        $data = $item['data'] ?? [];
        
        // Pergunta 1: Conhecimento das aulas de empreendedorismo
        if (isset($data['conhecimento_aulas'])) {
            $conhecimento = strtolower($data['conhecimento_aulas']);
            if ($conhecimento === 'sim') {
                $processados['conhecimento_aulas']['Sim']++;
            } else {
                $processados['conhecimento_aulas']['Não']++;
            }
        }
        
        // Pergunta 2: Aquisição do material didático
        if (isset($data['material_didatico'])) {
            $material = $data['material_didatico'];
            switch ($material) {
                case 'comprei_online':
                    $processados['material_didatico']['Sim, comprei o material pela loja online']++;
                    break;
                case 'nao_precisei_comprar':
                    $processados['material_didatico']['Sim, mas não precisei comprar']++;
                    break;
                case 'nao_adquiri':
                    $processados['material_didatico']['Não adquiri o material']++;
                    break;
            }
        }
        
        // Pergunta 3: Experiência de navegação na loja (escala 1-10)
        if (isset($data['experiencia_loja'])) {
            $valor = (int)$data['experiencia_loja'];
            if ($valor >= 1 && $valor <= 10) {
                $processados['experiencia_loja'][$valor]++;
            }
        }
        
        // Pergunta 4: Suporte da equipe da loja (escala 1-10)
        if (isset($data['suporte_loja'])) {
            $valor = (int)$data['suporte_loja'];
            if ($valor >= 1 && $valor <= 10) {
                $processados['suporte_loja'][$valor]++;
            }
        }
        
        // Pergunta 5: Custo-benefício dos kits
        if (isset($data['custo_beneficio'])) {
            $custo = $data['custo_beneficio'];
            switch ($custo) {
                case 'otimo':
                    $processados['custo_beneficio']['Excelente, o preço está de acordo com a benefício e qualidade']++;
                    break;
                case 'bom':
                    $processados['custo_beneficio']['Bom, o preço é aceitável em relação ao benefício e qualidade']++;
                    break;
                case 'regular':
                    $processados['custo_beneficio']['Regular, o preço cobrado é ligeiramente alto para o benefício e qualidade']++;
                    break;
                case 'ruim':
                    $processados['custo_beneficio']['Ruim, o preço é muito alto em relação ao benefício e qualidade']++;
                    break;
                case 'pessimo':
                    $processados['custo_beneficio']['Péssimo, o preço é impagável para o benefício e qualidade']++;
                    break;
            }
        }
        
        // Pergunta 6: Qualidade dos kits (escala 1-10)
        if (isset($data['qualidade_kits'])) {
            $valor = (int)$data['qualidade_kits'];
            if ($valor >= 1 && $valor <= 10) {
                $processados['qualidade_kits'][$valor]++;
            }
        }
        
        // Pergunta 7: Importância da formação empreendedora
        if (isset($data['importancia_formacao'])) {
            $importancia = $data['importancia_formacao'];
            switch ($importancia) {
                case 'muito_importante':
                    $processados['importancia_formacao']['Muito importante.']++;
                    break;
                case 'pouco_importante':
                    $processados['importancia_formacao']['Pouco importante.']++;
                    break;
                case 'irrelevante':
                    $processados['importancia_formacao']['Irrelevante.']++;
                    break;
                case 'prejudicial':
                    $processados['importancia_formacao']['Perda de foco e prejudicial.']++;
                    break;
            }
        }
        
        // Pergunta 8: Interesse do filho pelos projetos
        if (isset($data['interesse_filho'])) {
            $interesse = $data['interesse_filho'];
            switch ($interesse) {
                case 'muito_interesse':
                    $processados['interesse_filho']['Muito, meu filho ama as aulas e projetos']++;
                    break;
                case 'gosta_suficiente':
                    $processados['interesse_filho']['Sim, meu filho gosta o suficiente']++;
                    break;
                case 'pouco_interesse':
                    $processados['interesse_filho']['Pouco, meu filho não liga muito']++;
                    break;
                case 'nao_interesse':
                    $processados['interesse_filho']['Não, meu filho preferiria que não houvesse']++;
                    break;
            }
        }
        
        // Pergunta 9: Desenvolvimento de habilidades (escala 1-10)
        if (isset($data['desenvolvimento_habilidades'])) {
            $valor = (int)$data['desenvolvimento_habilidades'];
            if ($valor >= 1 && $valor <= 10) {
                $processados['desenvolvimento_habilidades'][$valor]++;
            }
        }
        
        // Pergunta 10: Engajamento da equipe pedagógica (escala 1-10)
        if (isset($data['engajamento_equipe'])) {
            $valor = (int)$data['engajamento_equipe'];
            if ($valor >= 1 && $valor <= 10) {
                $processados['engajamento_equipe'][$valor]++;
            }
        }
        
        // Pergunta 13: Continuidade do programa
        if (isset($data['continuar_programa'])) {
            $continuar = strtolower($data['continuar_programa']);
            if ($continuar === 'sim') {
                $processados['continuar_programa']['Sim']++;
            } else {
                $processados['continuar_programa']['Não']++;
            }
        }
        
        // Pergunta 11: Pontos fortes (respostas abertas)
        if (!empty($data['pontos_fortes'])) {
            $processados['pontos_fortes'][] = [
                'texto' => $data['pontos_fortes'],
                'nome' => $data['nome_completo'] ?? 'Anônimo',
                'escola' => $data['escola'] ?? 'Escola não informada'
            ];
        }
        
        // Pergunta 12: Melhorias sugeridas (respostas abertas)
        if (!empty($data['melhorias_sugestoes'])) {
            $processados['melhorias_sugestoes'][] = [
                'texto' => $data['melhorias_sugestoes'],
                'nome' => $data['nome_completo'] ?? 'Anônimo',
                'escola' => $data['escola'] ?? 'Escola não informada'
            ];
        }
    }
    
    return $processados;
}

// Calcular taxa de conhecimento do programa
function calcularTaxaConhecimento($dados) {
    $total = $dados['conhecimento_aulas']['Sim'] + $dados['conhecimento_aulas']['Não'];
    if ($total === 0) return 0;
    
    return round(($dados['conhecimento_aulas']['Sim'] / $total) * 100, 1);
}

// Calcular taxa de aquisição do material
function calcularTaxaAquisicao($dados) {
    $total = array_sum($dados['material_didatico']);
    if ($total === 0) return 0;
    
    // Considerar ambas as formas de aquisição como positivas
    $adquiriram = $dados['material_didatico']['Sim, comprei o material pela loja online'] + 
                  $dados['material_didatico']['Sim, mas não precisei comprar'];
    
    return round(($adquiriram / $total) * 100, 1);
}

// Calcular taxas de aprovação para escalas numéricas (1-10)
function calcularTaxaAprovacao($dados, $pergunta, $notaMinima = 5) {
    $total = array_sum($dados[$pergunta]);
    if ($total === 0) return 0;
    
    $aprovados = 0;
    foreach ($dados[$pergunta] as $nota => $count) {
        if ($nota >= $notaMinima) {
            $aprovados += $count;
        }
    }
    
    return round(($aprovados / $total) * 100, 1);
}

// Calcular taxa de interesse positivo dos alunos
function calcularTaxaInteresse($dados) {
    $total = array_sum($dados['interesse_filho']);
    if ($total === 0) return 0;
    
    // Considerar "Muito" e "Sim, gosta o suficiente" como interesse positivo
    $positivos = $dados['interesse_filho']['Muito, meu filho ama as aulas e projetos'] + 
                 $dados['interesse_filho']['Sim, meu filho gosta o suficiente'];
    
    return round(($positivos / $total) * 100, 1);
}

// Calcular taxa de aprovação do custo-benefício
function calcularTaxaCustoBeneficio($dados) {
    $total = array_sum($dados['custo_beneficio']);
    if ($total === 0) return 0;
    
    // Considerar "Excelente", "Bom" e "Regular" como aprovação
    $aprovados = $dados['custo_beneficio']['Excelente, o preço está de acordo com a benefício e qualidade'] + 
                 $dados['custo_beneficio']['Bom, o preço é aceitável em relação ao benefício e qualidade'] +
                 $dados['custo_beneficio']['Regular, o preço cobrado é ligeiramente alto para o benefício e qualidade'];
    
    return round(($aprovados / $total) * 100, 1);
}

// Calcular taxa de importância percebida
function calcularTaxaImportancia($dados) {
    $total = array_sum($dados['importancia_formacao']);
    if ($total === 0) return 0;
    
    // Considerar apenas "Muito importante." como aprovação
    $importantes = $dados['importancia_formacao']['Muito importante.'];
    
    return round(($importantes / $total) * 100, 1);
}

// Calcular taxa de continuidade do programa
function calcularTaxaContinuidade($dados) {
    $total = $dados['continuar_programa']['Sim'] + $dados['continuar_programa']['Não'];
    if ($total === 0) return 0;
    
    return round(($dados['continuar_programa']['Sim'] / $total) * 100, 1);
}

// Função para mapear códigos de escola para nomes amigáveis
function mapearEscola($codigo) {
    // Usar configuração da mantenedora se disponível
    global $maintainerConfig;
    
    if (isset($maintainerConfig['schools']['list'][$codigo])) {
        return $maintainerConfig['schools']['list'][$codigo];
    }
    
    // Se não encontrou no config, retornar o código mesmo
    return $codigo;
}

// Função para mapear nomes para códigos (inverso)
function mapearEscolaParaCodigo($nome) {
    // Usar configuração da mantenedora se disponível
    global $maintainerConfig;
    
    if (isset($maintainerConfig['schools']['list'])) {
        $mapeamento = array_flip($maintainerConfig['schools']['list']);
        if (isset($mapeamento[$nome])) {
            return $mapeamento[$nome];
        }
    }
    
    // Se não encontrou no config, retornar o nome mesmo
    return $nome;
}

// Função para mapear códigos de segmento para nomes amigáveis
function mapearSegmento($codigo) {
    // Mapeamento de códigos para nomes
    $mapeamento = [
        'fundamental1' => 'Ensino Fundamental Anos Iniciais (1º ao 5º ano)',
        'fundamental2' => 'Ensino Fundamental Anos Finais (6º ao 9º ano)',
        'medio' => 'Ensino Médio'
    ];
    
    return $mapeamento[$codigo] ?? $codigo;
}

// Função para mapear nomes para códigos (inverso)
function mapearSegmentoParaCodigo($nome) {
    $mapeamento = [
        'Ensino Fundamental Anos Iniciais (1º ao 5º ano)' => 'fundamental1',
        'Ensino Fundamental Anos Finais (6º ao 9º ano)' => 'fundamental2',
        'Ensino Médio' => 'medio'
    ];
    
    return $mapeamento[$nome] ?? $nome;
}


?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?php echo htmlspecialchars($selectedMaintainerName); ?></title>
    <link rel="icon" type="image/png" href="/imagens/favicon-business.png">
    
    <!-- Bootstrap CSS com cache busting -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css?v=<?php echo time(); ?>" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Dashboard CSS -->
    <link href="dashboard.css?v=<?php echo time(); ?>" rel="stylesheet">
</head>
<body>
    <!-- Header Simplificado -->
    <div class="simple-header">
        <div class="header-logo">
            <img src="https://forms.businesseducation.com.br/imagens/Logo Business Education Laranja e Branco.png" alt="Business Education" class="business-logo">
            
            <!-- Indicador do Ano-Projeto -->
            <div class="project-year-indicator" title="Ano-projeto atual da visualização">
                <i class="fas fa-calendar-alt"></i>
                <span><?php echo !empty($filtroAnoProjeto) ? 'Projeto ' . htmlspecialchars($filtroAnoProjeto) : 'Todos os anos'; ?></span>
            </div>
        </div>
        <div class="header-actions">
            <button id="refresh-dashboard" class="btn-refresh" title="Atualizar dados do dashboard">
                <i class="fas fa-sync-alt"></i>
            </button>
            <button id="export-pdf" class="btn-pdf" title="Baixar dashboard em PDF">
                <i class="fas fa-file-pdf"></i>
            </button>
            
            <a href="https://dashs.businesseducation.com.br/dashboard/home" class="btn-pais">
                <i class="fas fa-chart-bar"></i>
                <span class="btn-text">Dashboards</span>
            </a>
            <a href="../../../auth/login.php?logout=1" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span class="btn-text">Sair</span>
            </a>
        </div>
    </div>

    <div class="container-fluid main-container">
        <!-- Filtro Lateral Deslizante -->
        <div class="sidebar-filter-container" id="sidebarFilter">
            <!-- Painel do Filtro -->
            <div class="sidebar-filter-panel">
                <div class="sidebar-filter-content">
                    <!-- Header do Filtro -->
                    <div class="sidebar-filter-header">
                        <div class="sidebar-filter-title">
            <i class="fas fa-filter"></i>
                            Filtros de Dados
                        </div>
                        <button class="sidebar-filter-close" onclick="toggleSidebarFilter()">
                        <i class="fas fa-times"></i>
                    </button>
                    </div>

                    <!-- Formulário de Filtros -->
                    <form method="GET" action="" id="filters-form" class="sidebar-filter-form">
                        <?php if ($isMultipleOrgs): ?>
                            <?php foreach ($selectedOrganizations as $org): ?>
                                <input type="hidden" name="orgs[]" value="<?php echo htmlspecialchars($org); ?>">
                            <?php endforeach; ?>
                        <?php else: ?>
                            <input type="hidden" name="maintainer_id" value="<?php echo htmlspecialchars($selectedMaintainer); ?>">
                        <?php endif; ?>
                        
                        <!-- Botão Limpar Filtros -->
                        <div class="filter-group">
                            <button type="button" class="btn btn-clear w-100" onclick="clearFilters()">
                                <i class="fas fa-eraser me-1"></i>
                                Limpar Filtros
                            </button>
                        </div>
                        
                        <!-- Filtro Escola (Múltipla seleção) -->
                        <div class="filter-group">
                            <label class="filter-label">Escola</label>
                            <div class="custom-dropdown" data-filter="escola" data-multiple="true">
                                <div class="dropdown-trigger">
                                    <span class="dropdown-text">
                                        <?php 
                                        if (!empty($filtroEscola)) {
                                            if (count($filtroEscola) === 1) {
                                                echo htmlspecialchars($filtroEscola[0]);
                                            } else {
                                                echo count($filtroEscola) . ' escolas selecionadas';
                                            }
                                        } else {
                                            echo 'Selecionar escolas';
                                        }
                                        ?>
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="dropdown-content">
                                <?php foreach ($escolas as $escola): ?>
                                        <div class="dropdown-option" data-value="<?php echo htmlspecialchars($escola); ?>" 
                                             <?php echo (in_array($escola, $filtroEscola)) ? 'data-selected="true"' : ''; ?>>
                                            <span class="option-text"><?php echo htmlspecialchars($escola); ?></span>
                                            <i class="fas fa-check option-check"></i>
                                        </div>
                                <?php endforeach; ?>
                                </div>
                            </div>
                            <?php foreach ($filtroEscola as $escola): ?>
                                <input type="hidden" name="escola[]" value="<?php echo htmlspecialchars($escola); ?>">
                            <?php endforeach; ?>
                        </div>
                        
                        <!-- Filtro Série (Múltipla seleção) -->
                        <div class="filter-group">
                            <label class="filter-label">Série</label>
                            <div class="custom-dropdown" data-filter="segmento" data-multiple="true">
                                <div class="dropdown-trigger">
                                    <span class="dropdown-text">
                                        <?php 
                                        if (!empty($filtroSegmento)) {
                                            if (count($filtroSegmento) === 1) {
                                                echo htmlspecialchars($filtroSegmento[0]);
                                            } else {
                                                echo count($filtroSegmento) . ' séries selecionadas';
                                            }
                                        } else {
                                            echo 'Selecionar séries';
                                        }
                                        ?>
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="dropdown-content">
                                <?php foreach ($segmentos as $segmento): ?>
                                        <div class="dropdown-option" data-value="<?php echo htmlspecialchars($segmento); ?>" 
                                             <?php echo (in_array($segmento, $filtroSegmento)) ? 'data-selected="true"' : ''; ?>>
                                            <span class="option-text"><?php echo htmlspecialchars($segmento); ?></span>
                                            <i class="fas fa-check option-check"></i>
                                        </div>
                                <?php endforeach; ?>
                                </div>
                            </div>
                            <?php foreach ($filtroSegmento as $segmento): ?>
                                <input type="hidden" name="segmento[]" value="<?php echo htmlspecialchars($segmento); ?>">
                            <?php endforeach; ?>
                        </div>
                        
                        <!-- Filtro Aquisição do Material (Múltipla seleção) -->
                        <div class="filter-group">
                            <label class="filter-label">Aquisição do Material</label>
                            <div class="custom-dropdown" data-filter="material_didatico" data-multiple="true">
                                <div class="dropdown-trigger">
                                    <span class="dropdown-text">
                                        <?php 
                                        if (!empty($filtroMaterial)) {
                                            if (count($filtroMaterial) === 1) {
                                                echo htmlspecialchars($filtroMaterial[0]);
                                            } else {
                                                echo count($filtroMaterial) . ' opções selecionadas';
                                            }
                                        } else {
                                            echo 'Todas as opções';
                                        }
                                        ?>
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="dropdown-content">
                                <?php foreach ($materiais as $material): ?>
                                        <div class="dropdown-option" data-value="<?php echo htmlspecialchars($material); ?>" 
                                             <?php echo (in_array($material, $filtroMaterial)) ? 'data-selected="true"' : ''; ?>>
                                            <span class="option-text"><?php echo htmlspecialchars($material); ?></span>
                                            <i class="fas fa-check option-check"></i>
                                        </div>
                                <?php endforeach; ?>
                                </div>
                            </div>
                            <?php foreach ($filtroMaterial as $material): ?>
                                <input type="hidden" name="material_didatico[]" value="<?php echo htmlspecialchars($material); ?>">
                            <?php endforeach; ?>
                        </div>
                        
                        <!-- Filtro Nome (Seleção única) -->
                        <div class="filter-group">
                            <label class="filter-label">Nome do Responsável</label>
                            <div class="custom-dropdown" data-filter="nome" data-multiple="false">
                                <div class="dropdown-trigger">
                                    <span class="dropdown-text">
                                        <?php 
                                        if (!empty($filtroNome)) {
                                            echo htmlspecialchars($filtroNome);
                                        } else {
                                            echo 'Todos os responsáveis';
                                        }
                                        ?>
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="dropdown-content">
                                    <!-- Campo de pesquisa -->
                                    <div class="dropdown-search-container">
                                        <input type="text" class="dropdown-search-input" placeholder="Digite para pesquisar..." autocomplete="off">
                                        <i class="fas fa-search dropdown-search-icon"></i>
                                    </div>
                                    
                                    <div class="dropdown-option" data-value="" <?php echo empty($filtroNome) ? 'data-selected="true"' : ''; ?>>
                                        <span class="option-text">Todos os responsáveis</span>
                                        <i class="fas fa-check option-check"></i>
                                    </div>
                                <?php foreach ($nomes as $nome): ?>
                                        <div class="dropdown-option" data-value="<?php echo htmlspecialchars($nome); ?>" 
                                             <?php echo ($filtroNome === $nome) ? 'data-selected="true"' : ''; ?>>
                                            <span class="option-text"><?php echo htmlspecialchars($nome); ?></span>
                                            <i class="fas fa-check option-check"></i>
                                        </div>
                                <?php endforeach; ?>
                                </div>
                            </div>
                            <input type="hidden" name="nome" value="<?php echo htmlspecialchars($filtroNome); ?>">
                        </div>
                        
                        <!-- Filtro Ano-Projeto (Seleção única) -->
                        <div class="filter-group">
                            <label class="filter-label">Ano-Projeto</label>
                            <div class="custom-dropdown" data-filter="project_year" data-multiple="false">
                                <div class="dropdown-trigger">
                                    <span class="dropdown-text">
                                        <?php 
                                        if (!empty($filtroAnoProjeto)) {
                                            echo htmlspecialchars($filtroAnoProjeto);
                                        } else {
                                            echo 'Todos os anos';
                                        }
                                        ?>
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="dropdown-content">
                                    <div class="dropdown-option" data-value=""
                                         <?php echo empty($filtroAnoProjeto) ? 'data-selected="true"' : ''; ?>>
                                        <span class="option-text">Todos os anos</span>
                                        <i class="fas fa-check option-check"></i>
                                    </div>
                                    <div class="dropdown-option" data-value="2025" 
                                         <?php echo $filtroAnoProjeto === '2025' ? 'data-selected="true"' : ''; ?>>
                                        <span class="option-text">2025</span>
                                        <i class="fas fa-check option-check"></i>
                                    </div>
                                    <div class="dropdown-option" data-value="2026"
                                         <?php echo $filtroAnoProjeto === '2026' ? 'data-selected="true"' : ''; ?>>
                                        <span class="option-text">2026</span>
                                        <i class="fas fa-check option-check"></i>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" name="project_year" value="<?php echo htmlspecialchars($filtroAnoProjeto); ?>">
                        </div>
                        
                        <!-- Botões de Ação -->
                        <div class="sidebar-filter-actions">
                            <button type="submit" class="btn btn-filter">
                                <i class="fas fa-search me-1"></i>
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>
                    </div>
            
            <!-- Aba de Controle REMOVIDA - integrada no pseudo-elemento -->
        </div>

        <!-- Overlay -->
        <div class="sidebar-filter-overlay" id="sidebarOverlay" onclick="closeSidebarFilter()"></div>

        <!-- Botão Mobile -->
        <button class="mobile-filter-button" onclick="toggleSidebarFilter()">
            <i class="fas fa-filter"></i>
        </button>

        <!-- Conteúdo Principal -->
        <div class="main-content-wrapper" id="mainContent">
            <!-- Área Principal do Dashboard -->
            <div class="dashboard-content">
                                <!-- Banner do Dashboard -->
                <div class="row">
                    <div class="col-12">
                        <div class="dashboard-banner">
                            <img src="../../../imagens/Banner de Pesquisa Pais.png" alt="Banner Dashboard Pais" class="banner-image">
                        </div>
                    </div>
                </div>
                
                <!-- Highlights principais: Título (2/3) + Respostas (1/3) -->
                <div class="row gx-3 gy-3">
                    <!-- Highlight de título - 2/3 da linha -->
                    <div class="col-md-8">
                        <div class="rate-card highlight-orange">
                            <div class="simple-layout-container">
                                <!-- Logo - esquerda -->
                                <div class="logo-section">
                                    <img src="https://forms.businesseducation.com.br/imagens/Somente Logo Business Preto.svg" alt="Business Education" class="highlight-logo-simple">
                                </div>
                                
                                <!-- Textos - direita -->
                                <div class="text-section">
                                    <div class="dashboard-title-main">Pesquisa de Percepção dos Pais</div>
                                    <div class="maintainer-name-sub"><?php echo htmlspecialchars($selectedMaintainerName); ?></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total de respostas - 1/3 da linha -->
                    <div class="col-md-4">
                        <div class="rate-card">
                            <div class="rate-title">Total de Respostas</div>
                            <div class="rate-value"><?php echo $dadosProcessados['total_respostas'] ?? 0; ?></div>
                            <div class="rate-label">Respostas coletadas na pesquisa</div>
                        </div>
                    </div>
                </div>



        <?php if (!empty($dadosProcessados) && $dadosProcessados['total_respostas'] > 0): ?>
            <!-- Seção: Experiência com a Loja Online -->
            <div class="section-container">
                <h2 class="section-title">
                    <i class="fas fa-shopping-cart me-3"></i>
                    Experiência com a Loja Online
                </h2>
                
                        <!-- Highlights - Taxas de Aprovação -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Taxa de Conhecimento</div>
                            <div class="rate-value"><?php echo calcularTaxaConhecimento($dadosProcessados); ?>%</div>
                                    <div class="rate-label">Já sabia que a escola oferece aulas de empreendedorismo</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Navegação na Loja</div>
                            <div class="rate-value"><?php echo calcularTaxaAprovacao($dadosProcessados, 'experiencia_loja', 5); ?>%</div>
                                    <div class="rate-label">Avaliação positiva da experiência de navegação (nota 5+)</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Suporte da Loja</div>
                            <div class="rate-value"><?php echo calcularTaxaAprovacao($dadosProcessados, 'suporte_loja', 5); ?>%</div>
                                    <div class="rate-label">Avaliação positiva do suporte oferecido (nota 5+)</div>
                        </div>
                    </div>
                </div>
                
                        <!-- Gráficos de Barras - Juntos -->
                        <div class="row gx-3 gy-3">
                            <div class="col-12">
                                <div class="chart-container chart-container-bar-wide chart-loading">
                                    <div class="chart-title">Navegação na Loja</div>
                                    <div class="chart-question">3. Em uma escala de 1 a 10, qual foi sua avaliação geral da experiência de navegação e compra em nossa loja online?</div>
                                    <canvas id="navegacaoChart"></canvas>
                                </div>
                    </div>
                </div>
                
                        <div class="row gx-3 gy-3">
                            <div class="col-12">
                    <div class="chart-container chart-container-bar-wide chart-loading">
                                    <div class="chart-title">Suporte da Loja</div>
                                    <div class="chart-question">4. Em uma escala de 1 a 10, qual foi sua avaliação geral do suporte oferecido pela nossa equipe da loja online?</div>
                                    <canvas id="suporteChart"></canvas>
                    </div>
                </div>
                </div>
                
                        <!-- Gráficos de Pizza - Juntos em Par -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-6">
                                <div class="chart-container chart-container-pie chart-loading">
                                    <div class="chart-title">Aquisição do Material</div>
                                    <div class="chart-question">2. Você adquiriu o material didático para as aulas de empreendedorismo de 2025?</div>
                                    <canvas id="materialChart"></canvas>
                                </div>
                            </div>
                            <div class="col-md-6">
                    <div class="chart-container chart-container-pie chart-loading">
                        <div class="chart-title">Conhecimento do Programa</div>
                                    <div class="chart-question">1. Você já sabia que a escola do seu filho oferece aulas semanais de empreendedorismo?</div>
                        <canvas id="conhecimentoChart"></canvas>
                    </div>
                </div>
                </div>
            </div>

            <!-- Seção: Avaliação do Programa -->
            <div class="section-container">
                <h2 class="section-title">
                    <i class="fas fa-star me-3"></i>
                    Avaliação do Programa
                </h2>
                
                        <!-- Highlights - Taxas de Aprovação -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Custo-Benefício do Material</div>
                            <div class="rate-value"><?php echo calcularTaxaCustoBeneficio($dadosProcessados); ?>%</div>
                                    <div class="rate-label">Aprovação da relação custo-benefício</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Qualidade do Material</div>
                            <div class="rate-value"><?php echo calcularTaxaAprovacao($dadosProcessados, 'qualidade_kits', 5); ?>%</div>
                                    <div class="rate-label">Qualidade geral dos kits de empreendedorismo (nota 5+)</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Importância do Empreendedorismo</div>
                            <div class="rate-value"><?php echo calcularTaxaImportancia($dadosProcessados); ?>%</div>
                                    <div class="rate-label">Consideram importante a formação empreendedora</div>
                        </div>
                    </div>
                </div>
                
                        <!-- Gráfico de Barras -->
                        <div class="row gx-3 gy-3">
                            <div class="col-12">
                                <div class="chart-container chart-container-bar-wide chart-loading">
                                    <div class="chart-title">Qualidade do Material</div>
                                    <div class="chart-question">6. Independente do custo, em uma escala de 1 a 10, como você avalia a qualidade geral dos kits de empreendedorismo da Business Education?</div>
                        <canvas id="qualidadeChart"></canvas>
                                </div>
                    </div>
                </div>
                
                        <!-- Gráficos de Pizza - Juntos em Par -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-6">
                    <div class="chart-container chart-container-pie chart-loading">
                        <div class="chart-title">Custo-Benefício do Material</div>
                                    <div class="chart-question">5. Como você avalia a relação custo-benefício dos kits de empreendedorismo da Business Education?</div>
                        <canvas id="custoBeneficioChart"></canvas>
                    </div>
                </div>
                            <div class="col-md-6">
                    <div class="chart-container chart-container-pie chart-loading">
                                    <div class="chart-title">Importância do Empreendedorismo</div>
                                    <div class="chart-question">7. Como você avalia a importância de a escola oferecer uma formação empreendedora para os alunos?</div>
                                    <canvas id="importanciaChart"></canvas>
                                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Seção: Experiência dos Alunos e Continuidade -->
            <div class="section-container">
                <h2 class="section-title">
                    <i class="fas fa-graduation-cap me-3"></i>
                    Experiência dos Alunos e Continuidade
                </h2>
                
                        <!-- Highlights - Taxas de Aprovação -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Interesse dos Alunos</div>
                            <div class="rate-value"><?php echo calcularTaxaInteresse($dadosProcessados); ?>%</div>
                                    <div class="rate-label">Alunos demonstram interesse pelas aulas</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Desenvolvimento nos Alunos</div>
                            <div class="rate-value"><?php echo calcularTaxaAprovacao($dadosProcessados, 'desenvolvimento_habilidades', 5); ?>%</div>
                                    <div class="rate-label">Contribuição para desenvolvimento de habilidades (nota 5+)</div>
                        </div>
                    </div>
                            <div class="col-md-4">
                        <div class="rate-card">
                                    <div class="rate-title">Continuidade do Programa</div>
                            <div class="rate-value"><?php echo calcularTaxaContinuidade($dadosProcessados); ?>%</div>
                                    <div class="rate-label">Desejam que o programa continue sendo oferecido</div>
                        </div>
                    </div>
                </div>
                
                        <!-- Gráficos de Barras -->
                        <div class="row gx-3 gy-3">
                            <div class="col-12">
                                <div class="chart-container chart-container-bar-wide chart-loading">
                                    <div class="chart-title">Desenvolvimento nos Alunos</div>
                                    <div class="chart-question">9. Na sua avaliação em escala de 1 a 10, quanto o programa tem contribuído para o desenvolvimento de habilidades cruciais tais como gestão, criatividade, liderança e resolução de problemas?</div>
                        <canvas id="desenvolvimentoChart"></canvas>
                                </div>
                    </div>
                </div>
                
                        <div class="row gx-3 gy-3">
                            <div class="col-12">
                                <div class="chart-container chart-container-bar-wide chart-loading">
                                    <div class="chart-title">Envolvimento Docente</div>
                                    <div class="chart-question">10. Na sua avaliação em escala de 1 a 10, quanto a equipe pedagógica do colégio, incluindo a professora da matéria, tem se engajado com a proposta de formar alunos empreendedores?</div>
                        <canvas id="engajamentoChart"></canvas>
                                </div>
                    </div>
                </div>
                
                        <!-- Gráficos de Pizza -->
                        <div class="row gx-3 gy-3">
                            <div class="col-md-6">
                    <div class="chart-container chart-container-pie chart-loading">
                        <div class="chart-title">Interesse dos Alunos</div>
                                    <div class="chart-question">8. Você sente que os projetos e as aulas de empreendedorismo tem despertado o interesse do seu filho?</div>
                        <canvas id="interesseChart"></canvas>
                    </div>
                </div>
                            <div class="col-md-6">
                    <div class="chart-container chart-container-pie chart-loading">
                                    <div class="chart-title">Continuidade do Programa</div>
                                    <div class="chart-question">13. Em sua opinião, a formação empreendedora deve continuar sendo oferecida pela escola?</div>
                                    <canvas id="continuidadeChart"></canvas>
                    </div>
                </div>
                </div>
                
                        <div class="row gx-3 gy-3">
                    <!-- Pontos Fortes -->
                            <div class="col-md-6">
                        <div class="chart-container chart-container-text chart-loaded">
                            <div class="chart-title">
                                <i class="fas fa-thumbs-up me-2"></i>
                                Pontos Fortes
                            </div>
                                    <div class="chart-question">11. Conte pra nós os pontos fortes que mais te agradam no programa da Business Education?</div>
                            <div style="max-height: 350px; overflow-y: auto; padding-right: 5px;">
                                <?php foreach ($dadosProcessados['pontos_fortes'] as $ponto): ?>
                                    <div class="text-response-card">
                                        <div class="response-text"><?php echo htmlspecialchars($ponto['texto']); ?></div>
                                        <div class="response-author"><?php echo htmlspecialchars($ponto['nome']); ?></div>
                                        <div class="response-school" style="font-size: 11px; color: #6c757d; margin-top: 2px;"><?php echo htmlspecialchars($ponto['escola']); ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Melhorias Sugeridas -->
                            <div class="col-md-6">
                        <div class="chart-container chart-container-text chart-loaded">
                            <div class="chart-title">
                                <i class="fas fa-lightbulb me-2"></i>
                                Melhorias Sugeridas
                            </div>
                                    <div class="chart-question">12. Conte pra nós o que podemos fazer para tornar sua experiência ainda melhor com o programa?</div>
                            <div style="max-height: 350px; overflow-y: auto; padding-right: 5px;">
                                <?php foreach ($dadosProcessados['melhorias_sugestoes'] as $ponto): ?>
                                    <div class="text-response-card">
                                        <div class="response-text"><?php echo htmlspecialchars($ponto['texto']); ?></div>
                                        <div class="response-author"><?php echo htmlspecialchars($ponto['nome']); ?></div>
                                        <div class="response-school" style="font-size: 11px; color: #6c757d; margin-top: 2px;"><?php echo htmlspecialchars($ponto['escola']); ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                Nenhuma resposta encontrada com os filtros aplicados.
            </div>
        <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Escolha de Exportação PDF -->
    <div class="modal fade" id="exportPdfModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border-radius: 20px; border: none; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
                <div class="modal-header" style="background: linear-gradient(135deg, #E85A1F 0%, #D94A0F 100%); border-radius: 20px 20px 0 0; border: none; padding: 25px;">
                    <div class="w-100 text-center">
                        <i class="fas fa-file-pdf" style="font-size: 48px; color: white; margin-bottom: 10px;"></i>
                        <h5 class="modal-title fw-bold" style="font-size: 24px; color: #FFFFFF;">Escolha o Tipo de Exportação</h5>
                    </div>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <p class="text-center mb-4" style="color: #666; font-size: 16px;">
                        Como você gostaria de exportar o dashboard?
                    </p>
                    
                    <div class="export-options">
                        <!-- Opção Completa -->
                        <div class="export-option mb-3" onclick="exportPdfWithOption(true)" style="cursor: pointer; padding: 20px; border: 2px solid #e0e0e0; border-radius: 15px; transition: all 0.3s;">
                            <div class="d-flex align-items-center">
                                <div class="option-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #1a237e, #283593); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                                    <i class="fas fa-expand text-white" style="font-size: 28px;"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold" style="color: #333; font-size: 18px;">
                                        Exportação Completa
                                    </h6>
                                    <p class="mb-0 text-muted" style="font-size: 14px;">
                                        Inclui todas as respostas detalhadas de pontos fortes e melhorias sugeridas
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Opção Resumida -->
                        <div class="export-option" onclick="exportPdfWithOption(false)" style="cursor: pointer; padding: 20px; border: 2px solid #e0e0e0; border-radius: 15px; transition: all 0.3s;">
                            <div class="d-flex align-items-center">
                                <div class="option-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #1a237e, #283593); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                                    <i class="fas fa-compress text-white" style="font-size: 28px;"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold" style="color: #333; font-size: 18px;">
                                        Exportação Resumida
                                    </h6>
                                    <p class="mb-0 text-muted" style="font-size: 14px;">
                                        Versão compacta sem as respostas detalhadas (arquivo menor)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4">
                    <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal" style="border-radius: 10px;">
                        <i class="fas fa-times me-2"></i>Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Estilo adicional para o modal -->
    <style>
        .export-option:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: #FF692B !important;
            background: rgba(255, 105, 43, 0.05);
        }
        
        .modal-backdrop {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .modal.fade .modal-dialog {
            transform: scale(0.8);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .modal.show .modal-dialog {
            transform: scale(1);
            opacity: 1;
        }
        
        @media (max-width: 576px) {
            .export-option {
                padding: 15px !important;
            }
            .option-icon {
                width: 50px !important;
                height: 50px !important;
                margin-right: 15px !important;
            }
            .option-icon i {
                font-size: 24px !important;
            }
        }
        
        /* Garantir que backgrounds sejam preservados no PDF */
        @media print, screen {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Fundo principal azul */
            body, .main-container {
                background-color: #056BF1 !important;
            }
        }
    </style>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Bibliotecas para export PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <!-- Chart.js v4.3.0 - Versão estável testada -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.js"></script>
    <!-- Chart.js DataLabels Plugin v2.0.0 - Versão compatível -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js"></script>
    
            <!-- Funcionalidade Mobile -->
    <script>
            // PRIMEIRA FUNÇÃO REMOVIDA - usar apenas a função unificada abaixo

            // Fechar filtros ao clicar fora (mobile)
            document.addEventListener('click', function(e) {
                const sidebarFilter = document.querySelector('.sidebar-filter-container');
                const closeBtn = document.querySelector('.sidebar-filter-close');
                
                if (window.innerWidth <= 768 && 
                    sidebarFilter.classList.contains('show') && 
                    !sidebarFilter.contains(e.target) && 
                    !closeBtn.contains(e.target)) {
                    sidebarFilter.classList.remove('show');
                    overlay.classList.remove('show');
                    document.body.style.overflow = 'auto';
                    
                    // Esconder completamente após animação
                    setTimeout(() => {
                        if (!sidebarFilter.classList.contains('show')) {
                            sidebarFilter.style.display = 'none';
                        }
                    }, 300);
                }
            });

            // Fechar filtros após aplicar filtros (mobile)
            document.addEventListener('DOMContentLoaded', function() {
                const filterButton = document.querySelector('.btn-filter');
                
                if (filterButton) {
                    filterButton.addEventListener('click', function() {
                        if (window.innerWidth <= 768) {
                            setTimeout(() => {
                                const sidebarFilter = document.querySelector('.sidebar-filter-container');
                                sidebarFilter.classList.remove('show');
                                overlay.classList.remove('show');
                                document.body.style.overflow = 'auto';
                                
                                // Esconder completamente após animação
                                setTimeout(() => {
                                    if (!sidebarFilter.classList.contains('show')) {
                                        sidebarFilter.style.display = 'none';
                                    }
                                }, 300);
                            }, 300);
                        }
                    });
                }
                
                // Adicionar event listener para o botão de fechar
                const closeButton = document.querySelector('.sidebar-filter-close');
                if (closeButton) {
                    closeButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (window.innerWidth <= 768) {
                            const sidebarFilter = document.querySelector('.sidebar-filter-container');
                            sidebarFilter.classList.remove('show');
                            overlay.classList.remove('show');
                            document.body.style.overflow = 'auto';
                            
                            // Esconder completamente após animação
                            setTimeout(() => {
                                if (!sidebarFilter.classList.contains('show')) {
                                    sidebarFilter.style.display = 'none';
                                }
                            }, 300);
                        }
                    });
                }
            });
        </script>

        <!-- Script de Debug e Monitoramento do Sticky -->
        <script>
            // Configuração do sticky sidebar
            document.addEventListener('DOMContentLoaded', function() {
                const sidebarSticky = document.querySelector('.sidebar-sticky');
                
                if (sidebarSticky) {
                    // Função para manter o sticky funcionando
                    function forceSticky() {
                        const rect = sidebarSticky.getBoundingClientRect();
                        const shouldStick = rect.top <= 20;
                        
                        if (shouldStick) {
                            sidebarSticky.style.position = 'fixed';
                            sidebarSticky.style.top = '20px';
                            sidebarSticky.style.width = sidebarSticky.offsetWidth + 'px';
                            sidebarSticky.classList.add('stuck');
                        } else {
                            sidebarSticky.style.position = 'sticky';
                            sidebarSticky.style.width = 'auto';
                            sidebarSticky.classList.remove('stuck');
                        }
                    }
                    
                    // Monitor de scroll
                    window.addEventListener('scroll', forceSticky);
                    window.addEventListener('resize', forceSticky);
                    
                    // Teste inicial
                    setTimeout(forceSticky, 1000);
                }
            });
        </script>

    <!-- Dados para o JavaScript -->
    <script>
        // Passa os dados do PHP para o JavaScript
        const dadosDashboard = <?php echo json_encode($dadosProcessados); ?>;
    </script>
    
    <!-- Dashboard JavaScript separado -->
    <script src="dashboard.js?v=<?php echo time(); ?>"></script>
    
    <!-- Script do Filtro Lateral Deslizante -->
    <script>
        // Variáveis globais para o filtro lateral
        let sidebarFilterOpen = false;
        let activeFiltersCount = 0;

        // Função UNIFICADA para alternar o filtro lateral (mobile + desktop)
        function toggleSidebarFilter() {
            const container = document.getElementById('sidebarFilter');
            const overlay = document.getElementById('sidebarOverlay');
            const mainContent = document.getElementById('mainContent');
            
            // CORREÇÃO: Unificar comportamento mobile e desktop
            if (window.innerWidth <= 768) {
                // Mobile: usar classes 'show' e 'open'
                if (container.classList.contains('open')) {
                    container.classList.remove('open');
                    overlay.style.opacity = '0';
                    overlay.style.visibility = 'hidden';
                    document.body.style.overflow = 'auto';
                } else {
                    container.classList.add('open');
                    overlay.style.opacity = '1';
                    overlay.style.visibility = 'visible';
                    document.body.style.overflow = 'hidden';
                }
            } else {
                // Desktop: usar variável global
                if (sidebarFilterOpen) {
                    closeSidebarFilter();
                } else {
                    openSidebarFilter();
                }
            }
        }

        // Função para abrir o filtro lateral
        function openSidebarFilter() {
            const container = document.getElementById('sidebarFilter');
            const overlay = document.getElementById('sidebarOverlay');
            const mainContent = document.getElementById('mainContent');
            
            container.classList.add('open');
            overlay.classList.add('active');
            mainContent.classList.add('filter-open');
            
            sidebarFilterOpen = true;
        }

        // Função para fechar o filtro lateral
        function closeSidebarFilter() {
            const container = document.getElementById('sidebarFilter');
            const overlay = document.getElementById('sidebarOverlay');
            const mainContent = document.getElementById('mainContent');
            
            container.classList.remove('open');
            overlay.classList.remove('active');
            mainContent.classList.remove('filter-open');
            
            sidebarFilterOpen = false;
        }

        // Função para contar filtros ativos - DESABILITADA (elemento HTML removido)
        function updateFilterIndicator() {
            // CORREÇÃO: Elemento filterIndicator foi removido do HTML, função desabilitada
            return;
            
            const indicator = document.getElementById('filterIndicator');
            let count = 0;
            
            // Contar filtros ativos
            const selectedOptions = document.querySelectorAll('.dropdown-option[data-selected="true"]');
            
            selectedOptions.forEach(option => {
                if (option.dataset.value !== '') {
                    count++;
                }
            });
            
            activeFiltersCount = count;
            
            if (count > 0) {
                indicator.textContent = count;
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }

        // Função para limpar filtros
        function clearFilters() {
            // Limpar seleções dos dropdowns
            document.querySelectorAll('.dropdown-option').forEach(option => {
                option.removeAttribute('data-selected');
                option.classList.remove('selected');
            });
            
            // Marcar opções padrão (todas)
            const defaultOptions = document.querySelectorAll('.dropdown-option[data-value=""]');
            defaultOptions.forEach(option => {
                option.setAttribute('data-selected', 'true');
                option.classList.add('selected');
            });
            
            // Atualizar textos dos dropdowns
            updateDropdownTexts();
            
            // Atualizar indicador
            updateFilterIndicator();
            
            // Redirecionar para a página sem filtros
            const currentUrl = new URL(window.location.href);
            currentUrl.search = `?maintainer_id=${currentUrl.searchParams.get('maintainer_id') || 'arf'}`;
            window.location.href = currentUrl.toString();
        }

        // Função para fechar filtro com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarFilterOpen) {
                closeSidebarFilter();
            }
        });

        // Inicializar o filtro lateral
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar dropdowns
            initCustomDropdowns();
            updateDropdownTexts();
            applyInitialSelections();
            
            // Atualizar indicador inicial
            updateFilterIndicator();
            
            // Event listener para o painel com pseudo-elemento (lingueta integrada)
            const filterPanel = document.querySelector('.sidebar-filter-panel');
            if (filterPanel) {
                filterPanel.addEventListener('click', function(e) {
                    // Verificar se o clique foi na área da lingueta (últimos 40px da direita)
                    const rect = this.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const panelWidth = rect.width;
                    
                    // Se clicou nos últimos 40px da direita (área da lingueta pseudo-elemento)
                    if (clickX >= panelWidth - 40) {
                        e.stopPropagation();
                        toggleSidebarFilter();
                    }
                });
                
                // Sistema de centralização flutuante do ícone
                function updateFloatingIcon() {
                    const scrollTop = filterPanel.scrollTop;
                    const clientHeight = filterPanel.clientHeight;
                    const floatingTop = scrollTop + (clientHeight / 2);
                    filterPanel.style.setProperty('--floating-icon-top', `${floatingTop}px`);
                }
                filterPanel.addEventListener('scroll', updateFloatingIcon);
                window.addEventListener('resize', updateFloatingIcon);
                updateFloatingIcon();
                // Forçar update ao abrir o painel
                document.addEventListener('sidebarFilterOpen', updateFloatingIcon);
            }
            
            // Adicionar listeners para atualizar indicador
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('dropdown-option')) {
                    setTimeout(updateFilterIndicator, 100);
                }
            });
        });

        // Função para aplicar seleções iniciais
        function applyInitialSelections() {
            const dropdowns = document.querySelectorAll('.custom-dropdown');
            
            dropdowns.forEach(dropdown => {
                const options = dropdown.querySelectorAll('.dropdown-option[data-selected="true"]');
                options.forEach(option => {
                    option.classList.add('selected');
                });
                updateDropdownText(dropdown);
            });
        }

        // Função para inicializar dropdowns customizados
        function initCustomDropdowns() {
            const dropdowns = document.querySelectorAll('.custom-dropdown');
            
            dropdowns.forEach(dropdown => {
                const trigger = dropdown.querySelector('.dropdown-trigger');
                const content = dropdown.querySelector('.dropdown-content');
                const options = dropdown.querySelectorAll('.dropdown-option:not(.disabled)');
                const isMultiple = dropdown.dataset.multiple === 'true';
                const filterName = dropdown.dataset.filter;
                
                // Inicializar campo de pesquisa se existir
                const searchInput = dropdown.querySelector('.dropdown-search-input');
                if (searchInput) {
                    initSearchField(dropdown, searchInput);
                }
                
                // Click no trigger
                trigger.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Fechar outros dropdowns
                    document.querySelectorAll('.custom-dropdown').forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            const otherContent = otherDropdown.querySelector('.dropdown-content');
                            const otherTrigger = otherDropdown.querySelector('.dropdown-trigger');
                            otherContent.classList.remove('show');
                            otherTrigger.classList.remove('active');
                        }
                    });
                    
                    // Toggle atual
                    content.classList.toggle('show');
                    trigger.classList.toggle('active');
                    
                    // Focar no campo de pesquisa se existir
                    if (searchInput) {
                        setTimeout(() => searchInput.focus(), 100);
                    }
                });
                
                // Click nas opções
                options.forEach(option => {
                    option.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        const value = this.dataset.value;
                        const isSelected = this.hasAttribute('data-selected');
                        
                        if (isMultiple) {
                            // Multi-seleção
                            if (isSelected) {
                                // Desmarcar
                                this.removeAttribute('data-selected');
                                this.classList.remove('selected');
                                removeHiddenInput(filterName, value);
                            } else {
                                // Marcar
                                this.setAttribute('data-selected', 'true');
                                this.classList.add('selected');
                                addHiddenInput(filterName, value);
                            }
                        } else {
                            // Seleção única
                            // Desmarcar todas as outras opções
                            options.forEach(opt => {
                                opt.removeAttribute('data-selected');
                                opt.classList.remove('selected');
                            });
                            
                            // Marcar a selecionada
                            this.setAttribute('data-selected', 'true');
                            this.classList.add('selected');
                            
                            // Atualizar input hidden
                            updateSingleHiddenInput(filterName, value);
                            
                            // Fechar dropdown
                            content.classList.remove('show');
                            trigger.classList.remove('active');
                        }
                        
                        updateDropdownText(dropdown);
                        updateFilterIndicator();
                    });
                });
            });
            
            // Fechar dropdowns ao clicar fora
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.custom-dropdown')) {
                    document.querySelectorAll('.dropdown-content').forEach(content => {
                        content.classList.remove('show');
                    });
                    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
                        trigger.classList.remove('active');
                    });
                }
            });
        }

        // Função para inicializar campo de pesquisa
        function initSearchField(dropdown, searchInput) {
            const options = dropdown.querySelectorAll('.dropdown-option:not(.dropdown-search-container *)');
            const noResultsOption = dropdown.querySelector('.dropdown-option.no-results');
            
            // Criar opção "sem resultados" se não existir
            if (!noResultsOption) {
                const noResults = document.createElement('div');
                noResults.className = 'dropdown-option no-results';
                noResults.innerHTML = '<span class="option-text">Nenhum resultado encontrado</span>';
                noResults.style.display = 'none';
                dropdown.querySelector('.dropdown-content').appendChild(noResults);
            }
            
            // Event listener para pesquisa
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                let hasVisibleOptions = false;
                
                options.forEach(option => {
                    const optionText = option.querySelector('.option-text').textContent.toLowerCase();
                    const isVisible = optionText.includes(searchTerm);
                    
                    if (isVisible) {
                        option.classList.remove('filtered-out');
                        option.style.display = '';
                        hasVisibleOptions = true;
                    } else {
                        option.classList.add('filtered-out');
                        option.style.display = 'none';
                    }
                });
                
                // Mostrar/ocultar mensagem "sem resultados"
                const noResults = dropdown.querySelector('.dropdown-option.no-results');
                if (noResults) {
                    if (hasVisibleOptions || searchTerm === '') {
                        noResults.style.display = 'none';
                    } else {
                        noResults.style.display = '';
                    }
                }
            });
            
            // Limpar pesquisa ao fechar dropdown
            const trigger = dropdown.querySelector('.dropdown-trigger');
            trigger.addEventListener('click', function() {
                if (!dropdown.querySelector('.dropdown-content').classList.contains('show')) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            });
            
            // Prevenir fechamento do dropdown ao clicar no campo de pesquisa
            searchInput.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // Funções auxiliares para gerenciar inputs hidden
        function addHiddenInput(filterName, value) {
            const form = document.getElementById('filters-form');
            
            // Verificar se já existe
            const existing = form.querySelector(`input[name="${filterName}[]"][value="${value}"]`);
            if (existing) return;
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = filterName + '[]';
            input.value = value;
            input.dataset.filterValue = value;
            form.appendChild(input);
        }

        function removeHiddenInput(filterName, value) {
            const form = document.getElementById('filters-form');
            const inputs = form.querySelectorAll(`input[name="${filterName}[]"][value="${value}"]`);
            inputs.forEach(input => input.remove());
        }

        function updateSingleHiddenInput(filterName, value) {
            const form = document.getElementById('filters-form');
            let input = form.querySelector(`input[name="${filterName}"]`);
            
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = filterName;
                form.appendChild(input);
            }
            
            input.value = value;
        }

        function updateDropdownTexts() {
            document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
                updateDropdownText(dropdown);
            });
        }

        function updateDropdownText(dropdown) {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const text = trigger.querySelector('.dropdown-text');
            const selectedOptions = dropdown.querySelectorAll('.dropdown-option[data-selected="true"]');
            const isMultiple = dropdown.dataset.multiple === 'true';
            const filterName = dropdown.dataset.filter;
            
            if (selectedOptions.length === 0) {
                // Nenhuma seleção
                switch(filterName) {
                    case 'escola':
                        text.textContent = 'Selecionar escolas';
                        break;
                    case 'segmento':
                        text.textContent = 'Selecionar séries';
                        break;
                    case 'nome':
                        text.textContent = 'Todos os responsáveis';
                        break;
                    default:
                        text.textContent = 'Selecionar';
                }
            } else if (isMultiple) {
                // Multi-seleção
                if (selectedOptions.length === 1) {
                    const optionText = selectedOptions[0].querySelector('.option-text').textContent;
                    text.textContent = optionText;
                } else {
                    const count = selectedOptions.length;
                    switch(filterName) {
                        case 'escola':
                            text.textContent = `${count} escolas selecionadas`;
                            break;
                        case 'segmento':
                            text.textContent = `${count} séries selecionadas`;
                            break;
                        default:
                            text.textContent = `${count} selecionados`;
                    }
                }
            } else {
                // Seleção única
                const optionText = selectedOptions[0].querySelector('.option-text').textContent;
                text.textContent = optionText;
            }
        }

        // Função para atualizar dados do dashboard
        function refreshDashboard() {
            const refreshBtn = document.getElementById('refresh-dashboard');
            const refreshIcon = refreshBtn.querySelector('i');
            
            // Desabilitar botão e mostrar estado de loading
            refreshBtn.disabled = true;
            refreshBtn.classList.add('refreshing');
            refreshIcon.classList.add('fa-spin');
            
            // Limpar cache via API
            fetch('../../../forms/api/clear-cache.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Cache limpo com sucesso, recarregar página
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // Erro ao limpar cache, mas ainda recarregar
                    console.error('Erro ao limpar cache:', data.message);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                // Mesmo com erro, recarregar após delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        }
        
        // Variável global para armazenar o modal
        let exportPdfModalInstance = null;
        
        // Função para mostrar o modal de escolha
        function showExportPdfModal() {
            const modalElement = document.getElementById('exportPdfModal');
            if (!exportPdfModalInstance) {
                exportPdfModalInstance = new bootstrap.Modal(modalElement);
            }
            exportPdfModalInstance.show();
        }
        
        // Função chamada quando o usuário escolhe uma opção
        async function exportPdfWithOption(expandSections) {
            // Fechar o modal
            if (exportPdfModalInstance) {
                exportPdfModalInstance.hide();
            }
            
            // Chamar a função de exportação com o parâmetro
            await exportDashboardPDF(expandSections);
        }
        
        // Função para exportar dashboard em PDF
        async function exportDashboardPDF(expandSections = true) {
            const pdfBtn = document.getElementById('export-pdf');
            const pdfIcon = pdfBtn.querySelector('i');
            
            try {
                // Desabilitar botão e mostrar estado de loading
                pdfBtn.disabled = true;
                pdfBtn.classList.add('generating');
                pdfIcon.className = 'fas fa-spinner fa-spin';
                
                // Aguardar um momento para garantir que os gráficos estão renderizados
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Rolar para o topo para garantir captura completa
                window.scrollTo(0, 0);
                
                // Aguardar um pouco mais para garantir renderização completa
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Capturar a área principal do dashboard (como a loja faz)
                const dashboardElement = document.getElementById('mainContent');
                
                if (!dashboardElement) {
                    throw new Error('Elemento #mainContent não encontrado - necessário para captura do PDF');
                }
                
                // Variáveis para armazenar estilos originais
                const scrollableSections = dashboardElement.querySelectorAll('[style*="max-height"][style*="overflow-y"]');
                const originalStyles = [];
                
                // CONDICIONAL: Expandir seções apenas se o usuário escolheu exportação completa
                if (expandSections) {
                    console.log('📊 Modo COMPLETO: Expandindo seções com scroll interno...');
                    
                    scrollableSections.forEach((section, index) => {
                        originalStyles[index] = {
                            maxHeight: section.style.maxHeight,
                            overflowY: section.style.overflowY,
                            height: section.style.height
                        };
                        
                        // Expandir seção para mostrar todo conteúdo
                        section.style.maxHeight = 'none';
                        section.style.overflowY = 'visible';
                        section.style.height = 'auto';
                        
                        console.log(`   ✅ Seção ${index + 1} expandida`);
                    });
                    
                    // Aguardar reflow após expansão
                    await new Promise(resolve => setTimeout(resolve, 300));
                } else {
                    console.log('📊 Modo RESUMIDO: Mantendo seções com scroll interno...');
                }
                
                // Calcular altura real do conteúdo (após expandir seções)
                const realHeight = Math.max(
                    dashboardElement.scrollHeight,
                    dashboardElement.offsetHeight, 
                    dashboardElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight || 0
                );
                
                console.log('🔍 Debug - Alturas calculadas:');
                console.log('  - Element scrollHeight:', dashboardElement.scrollHeight);
                console.log('  - Element offsetHeight:', dashboardElement.offsetHeight);
                console.log('  - Document scrollHeight:', document.documentElement.scrollHeight);
                console.log('  - Altura real escolhida:', realHeight);
                
                // CORREÇÃO: Limitar altura para evitar canvas gigantesco
                const maxCanvasHeight = 20000; // Limite seguro para o canvas
                const canvasHeight = Math.min(realHeight, maxCanvasHeight);
                
                if (realHeight > maxCanvasHeight) {
                    console.warn(`⚠️ Altura real (${realHeight}px) excede limite do canvas (${maxCanvasHeight}px)`);
                    console.log(`   Canvas será limitado a ${canvasHeight}px`);
                }
                
                // Configurações do html2canvas para alta qualidade
                const canvas = await html2canvas(dashboardElement, {
                    scale: 1.5, // Reduzir escala para evitar memória excessiva
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#056BF1', // Fundo azul do dashboard
                    width: dashboardElement.scrollWidth,
                    height: canvasHeight, // Usar altura limitada
                    scrollX: 0,
                    scrollY: -window.pageYOffset,
                    windowWidth: window.innerWidth,
                    windowHeight: canvasHeight,
                    imageTimeout: 15000, // Timeout para imagens
                    onclone: function(clonedDoc) {
                        console.log('🔧 Aplicando correções no clone para captura completa...');
                        
                        // CORREÇÃO CORS: Remover imagens externas que causam erro
                        const externalImages = clonedDoc.querySelectorAll('img[src*="forms.businesseducation.com.br"]');
                        externalImages.forEach(img => {
                            console.log('   🔄 Removendo imagem externa (CORS):', img.src);
                            img.style.display = 'none'; // Ocultar em vez de remover para não quebrar layout
                        });
                        
                        // NÃO forçar expansão total no clone (já foi expandido antes)
                        
                        // Garantir que o #mainContent clonado está visível (igual à loja)
                        const clonedMainContent = clonedDoc.getElementById('mainContent');
                        if (clonedMainContent) {
                            clonedMainContent.style.transform = 'none';
                            clonedMainContent.style.display = 'block';
                            clonedMainContent.style.visibility = 'visible';
                            clonedMainContent.style.height = 'auto';
                            clonedMainContent.style.maxHeight = 'none';
                            clonedMainContent.style.overflow = 'visible';
                        }
                        
                        // FORÇAR CORES CORRETAS DO DASHBOARD DE PESQUISA PAIS
                        // 1. Containers de gráficos (fundo branco igual aos KPIs)
                        const chartContainers = clonedDoc.querySelectorAll('.chart-container');
                        chartContainers.forEach(container => {
                            container.style.backgroundColor = '#ffffff';
                            container.style.color = '#333333';
                            container.style.borderRadius = '15px';
                            container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        });
                        
                        // 2. Banner info (gradiente laranja)
                        const bannerInfo = clonedDoc.querySelectorAll('.banner-info');
                        bannerInfo.forEach(banner => {
                            banner.style.background = 'linear-gradient(135deg, #FF692B 0%, #FF8C42 100%)';
                            banner.style.color = '#ffffff';
                            banner.style.borderRadius = '15px';
                            banner.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        });
                        
                        // 3. Cards KPI (fundo branco)
                        const kpiCards = clonedDoc.querySelectorAll('.kpi-card');
                        kpiCards.forEach(card => {
                            card.style.backgroundColor = '#ffffff';
                            card.style.color = '#333333';
                            card.style.borderRadius = '15px';
                            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        });
                        
                        // 4. Títulos dos gráficos (texto escuro no fundo branco) e banners (branco)
                        const chartTitles = clonedDoc.querySelectorAll('.chart-title');
                        chartTitles.forEach(title => {
                            title.style.color = '#333333';
                            title.style.fontWeight = 'bold';
                        });
                        
                        const bannerTitles = clonedDoc.querySelectorAll('.banner-title');
                        bannerTitles.forEach(title => {
                            title.style.color = '#ffffff';
                            title.style.fontWeight = 'bold';
                        });
                        
                        // 5. Perguntas dos gráficos (texto cinza) e subtítulos dos banners (branco transparente)
                        const chartQuestions = clonedDoc.querySelectorAll('.chart-question');
                        chartQuestions.forEach(question => {
                            question.style.color = '#666666';
                        });
                        
                        const bannerSubtitles = clonedDoc.querySelectorAll('.banner-subtitle');
                        bannerSubtitles.forEach(subtitle => {
                            subtitle.style.color = 'rgba(255, 255, 255, 0.8)';
                        });
                        
                        // 6. Valores KPI (texto escuro)
                        const kpiValues = clonedDoc.querySelectorAll('.kpi-value');
                        kpiValues.forEach(value => {
                            value.style.color = '#333333';
                            value.style.fontWeight = 'bold';
                        });
                        
                        // 7. Labels KPI (cinza)
                        const kpiLabels = clonedDoc.querySelectorAll('.kpi-label');
                        kpiLabels.forEach(label => {
                            label.style.color = '#666666';
                        });
                        
                        // 8. Títulos de seção (texto branco no fundo claro)
                        const sectionTitles = clonedDoc.querySelectorAll('.section-title');
                        sectionTitles.forEach(title => {
                            title.style.setProperty('color', '#ffffff', 'important');
                            title.style.setProperty('font-weight', 'bold', 'important');
                        });
                        
                        // 8.1 Ícones dos títulos de seção (brancos)
                        const sectionIcons = clonedDoc.querySelectorAll('.section-title i, h2.section-title i');
                        sectionIcons.forEach(icon => {
                            icon.style.setProperty('color', '#ffffff', 'important');
                        });
                        
                        // 9. Garantir canvas visíveis
                        const canvases = clonedDoc.querySelectorAll('canvas');
                        canvases.forEach(canvas => {
                            canvas.style.opacity = '1';
                            canvas.style.visibility = 'visible';
                        });
                        
                        // 10. Aplicar estilo global para preservar cores
                        const style = clonedDoc.createElement('style');
                        style.textContent = `
                            * {
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);
                    }
                });
                
                console.log('✅ CANVAS CAPTURADO COM SUCESSO! Dimensões:', canvas.width, 'x', canvas.height);
                
                // RESTAURAR estilos originais das seções expandidas (apenas se foram expandidas)
                if (expandSections) {
                    scrollableSections.forEach((section, index) => {
                        if (originalStyles[index]) {
                            section.style.maxHeight = originalStyles[index].maxHeight;
                            section.style.overflowY = originalStyles[index].overflowY;
                            section.style.height = originalStyles[index].height;
                        }
                    });
                    console.log('🔄 Estilos originais restaurados');
                }
                
                // Obter informações para nome do arquivo
                const maintainerName = '<?php echo addslashes($selectedMaintainerName); ?>';
                const currentDate = new Date().toISOString().split('T')[0];
                const filename = `Dashboard_Pais_${maintainerName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate}.pdf`;
                
                // Criar PDF usando jsPDF
                const { jsPDF } = window.jspdf;
                
                // Calcular dimensões do PDF baseado no canvas
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                
                // CORREÇÃO: Usar limite com margem de segurança maior
                const maxPdfHeight = 10000; // Limite seguro com boa margem (jsPDF máximo é 14400)
                const needsScaling = imgHeight > maxPdfHeight;
                
                console.log(`📄 Dimensões do canvas: ${imgWidth}x${imgHeight}`);
                console.log(`📏 Limite seguro: ${maxPdfHeight}px`);
                console.log(`🔍 Precisa escalar: ${needsScaling ? 'SIM' : 'NÃO'}`);
                
                let pdfWidth = imgWidth;
                let pdfHeight = imgHeight;
                let imageWidth = imgWidth;
                let imageHeight = imgHeight;
                
                if (needsScaling) {
                    // Calcular escala para caber no limite
                    const scale = maxPdfHeight / imgHeight;
                    pdfHeight = maxPdfHeight;
                    pdfWidth = Math.floor(imgWidth * scale);
                    imageWidth = pdfWidth;
                    imageHeight = pdfHeight;
                    
                    console.warn(`⚠️ Altura do conteúdo (${imgHeight}px) excede o limite seguro (${maxPdfHeight}px)`);
                    console.log(`📐 Aplicando escala de ${(scale * 100).toFixed(1)}%`);
                    console.log(`📄 Dimensões finais do PDF: ${pdfWidth}x${pdfHeight}`);
                }
                
                // Criar PDF com dimensões calculadas
                const pdf = new jsPDF({
                    orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [pdfWidth, pdfHeight]
                });
                
                // Converter canvas para image data
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Adicionar imagem ao PDF
                pdf.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);
                
                // Adicionar metadados
                pdf.setProperties({
                    title: `Dashboard Pesquisa Pais - ${maintainerName}`,
                    subject: 'Dashboard de Pesquisas Business Education',
                    author: 'Business Education Dashboard',
                    creator: 'dashs.businesseducation.com.br'
                });
                
                // Salvar PDF
                pdf.save(filename);
                console.log('✅ PDF gerado com sucesso');
                
                console.log('PDF gerado com sucesso:', filename);
                
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar PDF. Tente novamente em alguns segundos.');
            } finally {
                // Restaurar botão
                setTimeout(() => {
                    pdfBtn.disabled = false;
                    pdfBtn.classList.remove('generating');
                    pdfIcon.className = 'fas fa-file-pdf';
                }, 1000);
            }
        }
        
        // Adicionar evento ao botão de refresh e PDF
        document.addEventListener('DOMContentLoaded', function() {
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', refreshDashboard);
            }
            
            const pdfBtn = document.getElementById('export-pdf');
            if (pdfBtn) {
                pdfBtn.addEventListener('click', showExportPdfModal);
            }
        });
    </script>
    
    <!-- FORÇA ESTILOS DIRETOS - SOLUÇÃO DEFINITIVA -->
    <script>
        function forceLayoutStyles() {
            // ATACAR O PROBLEMA NA RAIZ: O PAI (.rate-card.highlight-orange)
            const parentCards = document.querySelectorAll('.rate-card.highlight-orange');
            parentCards.forEach(parent => {
                parent.style.setProperty('justify-content', 'center', 'important');
                parent.style.setProperty('align-items', 'center', 'important');
                parent.style.setProperty('display', 'flex', 'important');
                console.log('🎯 PAI CENTRALIZADO:', parent);
            });
            
            const containers = document.querySelectorAll('.simple-layout-container');
            containers.forEach(container => {
                // FORÇA: Container MENOR para permitir centralização horizontal
                container.style.setProperty('gap', '8px', 'important'); // Gap visível
                container.style.setProperty('padding', '1rem', 'important');
                container.style.setProperty('display', 'flex', 'important');
                container.style.setProperty('align-items', 'center', 'important');
                container.style.setProperty('justify-content', 'center', 'important');
                container.style.setProperty('width', 'auto', 'important'); // AUTO para não ocupar 100%
                container.style.setProperty('max-width', '90%', 'important'); // Máximo 90%
                container.style.setProperty('box-sizing', 'border-box', 'important');
                container.style.setProperty('margin', '0 auto', 'important'); // MARGIN AUTO para centralizar
                
                // FORÇA: Logo e texto com larguras fixas menores
                const logoSection = container.querySelector('.logo-section');
                const textSection = container.querySelector('.text-section');
                if (logoSection) {
                    logoSection.style.setProperty('flex', 'none', 'important');
                    logoSection.style.setProperty('width', '80px', 'important'); // FIXO para controle
                    logoSection.style.setProperty('justify-content', 'center', 'important');
                    logoSection.style.setProperty('margin-right', '0', 'important'); // Remove margin
                }
                if (textSection) {
                    textSection.style.setProperty('flex', '1', 'important'); // FLEXÍVEL para usar espaço disponível
                    textSection.style.setProperty('width', 'auto', 'important'); // AUTO
                    textSection.style.setProperty('max-width', 'none', 'important'); // SEM LIMITAÇÃO - igual à loja
                    textSection.style.setProperty('align-items', 'flex-start', 'important');
                    textSection.style.setProperty('text-align', 'left', 'important'); // TEXTO À ESQUERDA INTERNO
                    textSection.style.setProperty('justify-content', 'center', 'important'); // CENTRO VERTICAL como logo
                    textSection.style.setProperty('gap', '0.4rem', 'important'); // ESPAÇAMENTO ENTRE TEXTOS
                    
                    // REMOVER FORÇAMENTO DE NOWRAP - permite texto completo e quebra natural
                    const titleEl = textSection.querySelector('.dashboard-title-main');
                    const subEl = textSection.querySelector('.maintainer-name-sub');
                    if (titleEl) {
                        titleEl.style.removeProperty('white-space');
                        titleEl.style.removeProperty('overflow');
                        titleEl.style.removeProperty('text-overflow');
                    }
                    if (subEl) {
                        subEl.style.removeProperty('white-space');
                        subEl.style.removeProperty('overflow');
                        subEl.style.removeProperty('text-overflow');
                    }
                }
                console.log('🔧 PAIS - CONTAINER MENOR centralizado:', container);
            });
        }
        
        // Aplicar múltiplas vezes para garantir
        document.addEventListener('DOMContentLoaded', forceLayoutStyles);
        setTimeout(forceLayoutStyles, 100);
        setTimeout(forceLayoutStyles, 500);
        setTimeout(forceLayoutStyles, 1000);
        setTimeout(forceLayoutStyles, 2000);
    </script>

</body>
</html> 