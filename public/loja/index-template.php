<?php
// Configurações
require_once 'config/env.php';

// Carrega as configurações da loja
$store_config_from_file = require_once 'config/store.php';
// O store.php agora retorna diretamente $store_config
$store_display_settings = $store_config_from_file['store']; // Acessa o sub-array 'store' que contém os títulos, descrições OG, etc.
$payment_integration_path = $store_config_from_file['payment_integration_folder'] ?? 'payment'; // <-- NOVA LINHA: Ler a pasta de integração
$freight_integration_path = $store_config_from_file['freight_integration_folder'] ?? 'frete_melhorenvio'; // Configuração de frete

$max_parcelas = $store_config_from_file['payment']['max_installments'] ?? 7; // Max parcelas vem de $store_config_from_file['payment']

// Carrega configurações de frete
$freight_config = $store_config_from_file['freight'] ?? [];
$freight_enabled = $freight_config['enabled'] ?? false;

// Inicialização de sessão (pular para bots OG)
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$is_og_bot = (
    stripos($user_agent, 'facebookexternalhit') !== false ||
    stripos($user_agent, 'WhatsApp') !== false ||
    stripos($user_agent, 'Twitterbot') !== false ||
    stripos($user_agent, 'LinkedInBot') !== false ||
    stripos($user_agent, 'Slackbot') !== false
);

if (!$is_og_bot) {
    session_start();
}

// Converte os dados dos produtos do formato de configuração para o formato usado na página
$produtos = [];
// Ajuste: A lista de produtos está em $store_config_from_file['products']
if (isset($store_config_from_file['products']) && is_array($store_config_from_file['products'])) {
    foreach ($store_config_from_file['products'] as $key => $product) {
        // Usamos a série como identificador único para cada produto
        $id_produto = $product['id'] ?? $key; // Fallback para a chave se o ID não estiver definido
        
        $produtos[$id_produto] = [
            'nome' => $product['name'] ?? 'Produto sem nome',
            'serie' => $product['grade'] ?? '',
            'valor' => $product['prices']['original'] ?? 0,
            'valor_pix' => $product['prices']['pix'] ?? 0,
            'valor_cartao' => $product['prices']['credit_card'] ?? 0,
            'imagem' => $product['image_main'] ?? ($product['image'] ?? ''), // Usa image_main, fallback para image se existir
            'galeria' => $product['gallery_images'] ?? [], // Novo campo para a galeria
            'shipping' => $product['shipping'] ?? []
        ];
    }
}

// Função para calcular parcela
function calcularParcela($valorTotal, $numParcelas) {
    return number_format($valorTotal / $numParcelas, 2, ',', '.');
}

// Função para calcular o percentual de desconto
function calcularDesconto($valorOriginal, $valorComDesconto) {
    return number_format(((($valorOriginal - $valorComDesconto) / $valorOriginal) * 100), 2, ',', '.');
}

// Determina a URL completa da página atual para as meta tags OG e Twitter
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$currentPageUrl = $protocol . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ($_SERVER['REQUEST_URI'] ?? '');

// Extrai o store_id do caminho do script atual para o meta tag store-id usando StoreResolver
require_once '../../core/StoreResolver.php';

$current_script_path_parts = explode('/', trim(dirname($_SERVER['SCRIPT_NAME']), '/'));
// Para stores/loja_modelo/, queremos o elemento [1] que é 'loja_modelo'
$detected_store_from_path = $current_script_path_parts[1] ?? null;

// Valida usando StoreResolver
if ($detected_store_from_path) {
    $resolver_result = StoreResolver::resolve($detected_store_from_path);
    $determined_store_id_for_meta = $resolver_result['found'] ? $resolver_result['folder_name'] : 'unknown_store';
} else {
    $determined_store_id_for_meta = $store_display_settings['id'] ?? 'unknown_store';
}

?>
<!DOCTYPE html>

<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Meta Tags Dinâmicas -->
<title><?php echo htmlspecialchars($store_display_settings['page_title'] ?? 'Loja Rápida'); ?></title>
<meta name="description" content="<?php echo htmlspecialchars($store_display_settings['meta_description'] ?? 'Loja de Materiais Didáticos'); ?>">
    <meta name="store-id" content="<?php echo htmlspecialchars(str_replace('_', '-', $determined_store_id_for_meta)); ?>">
<meta name="store-name" content="<?php echo htmlspecialchars($store_display_settings['name_store'] ?? $store_display_settings['name'] ?? 'Loja'); ?>">
<meta name="payment-integration-path" content="<?php echo htmlspecialchars($payment_integration_path); ?>">
<meta name="freight-integration-path" content="<?php echo htmlspecialchars($freight_integration_path); ?>">
<meta name="freight-enabled" content="<?php echo $freight_enabled ? 'true' : 'false'; ?>">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="<?php echo htmlspecialchars($currentPageUrl); ?>">
<meta property="og:title" content="<?php echo htmlspecialchars($store_display_settings['og_title'] ?? ($store_display_settings['page_title'] ?? 'Loja Rápida')); ?>">
<meta property="og:description" content="<?php echo htmlspecialchars($store_display_settings['og_description'] ?? ($store_display_settings['meta_description'] ?? 'Confira nossos produtos!')); ?>">
<meta property="og:image" content="<?php echo htmlspecialchars($store_display_settings['og_image_url'] ?? ''); ?>">
<meta property="og:image:secure_url" content="<?php echo htmlspecialchars($store_display_settings['og_image_url'] ?? ''); ?>">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="<?php echo htmlspecialchars($store_display_settings['og_site_name'] ?? ($store_display_settings['name'] ?? 'Loja Rápida')); ?>">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="<?php echo htmlspecialchars($currentPageUrl); ?>">
<meta name="twitter:title" content="<?php echo htmlspecialchars($store_display_settings['og_title'] ?? ($store_display_settings['page_title'] ?? 'Loja Rápida')); ?>">
<meta name="twitter:description" content="<?php echo htmlspecialchars($store_display_settings['og_description'] ?? ($store_display_settings['meta_description'] ?? 'Confira nossos produtos!')); ?>">
<meta name="twitter:image" content="<?php echo htmlspecialchars($store_display_settings['og_image_url'] ?? ''); ?>">
<meta name="twitter:image:alt" content="<?php echo htmlspecialchars($store_display_settings['og_title'] ?? 'Loja Business Education'); ?>">
<?php if (!empty($store_display_settings['twitter_handle']) && $store_display_settings['twitter_handle'] !== '@seuTwitterHandle'): ?>
<meta name="twitter:site" content="<?php echo htmlspecialchars($store_display_settings['twitter_handle']); ?>">
<meta name="twitter:creator" content="<?php echo htmlspecialchars($store_display_settings['twitter_handle']); ?>">
<?php endif; ?>

<link rel="icon" type="image/png" href="<?php echo htmlspecialchars($store_config['images']['favicon']); ?>">
<!-- Preload apenas de imagens dos slides visíveis (não duplicados) -->
<link rel="preload" as="image" href="../imagens/Menino com Coroa - Loja.png">
<link rel="preload" as="image" href="../imagens/Caixa Livros.png">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/rocket-background.css">
<link rel="stylesheet" href="css/phone-ddi-selector.css?v=3.0">
    <link rel="stylesheet" href="css/autofill-neutralizer.css">
    <link rel="stylesheet" href="css/custom-dropdown.css">
    <link rel="stylesheet" href="css/field-feedback.css">
<style>
    /* Estilos globais removidos - agora controlados pelo CSS externo */

/* Garante que o dropdown do seletor DDI fique sempre acima */
.ddi-dropdown {
    z-index: 9999 !important;
}

.phone-input-container {
    z-index: 1000 !important;
}

.ddi-search-container {
    z-index: 9999 !important;
}

/* Evita conflitos com outros elementos */
.form-section {
    position: relative;
    z-index: 1;
}

/* Correção específica apenas para containers do DDI */
.col:has(.phone-input-container) {
    overflow: visible !important;
}

/* Z-index específico para DDI apenas */
.phone-input-container {
    z-index: 1001 !important;
    position: relative !important;
}

.phone-input-container .countries-dropdown {
    z-index: 10001 !important;
}

/* Apenas o essencial para manter cores claras */

/* CORREÇÃO LIMPA E ESPECÍFICA APENAS PARA O DDI */
.phone-input-container {
    color-scheme: light !important;
}

.phone-input-container .countries-dropdown {
    background: white !important;
    border: 1px solid #ccc !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.phone-input-container .search-container {
    background: #f5f5f5 !important;
}

.phone-input-container .country-option {
    color: #333 !important;
    background: transparent !important;
}

.phone-input-container .country-option:hover {
    background: #f5f5f5 !important;
}

.phone-input-container .country-option.selected {
    background: #e3f2fd !important;
}

.toggle-switch-container {
    display: flex;
    align-items: center;
    margin: 24px 0 12px 0;
    gap: 12px;
}
.toggle-switch {
    position: relative;
    width: 48px;
    height: 26px;
    display: flex;
    align-items: center;
}
.toggle-switch input[type="checkbox"] {
    opacity: 0;
    width: 0;
    height: 0;
}
.toggle-label {
    position: absolute;
    left: 0;
    top: 0;
    width: 48px;
    height: 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
}
.toggle-inner {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #e9ecef;
    border-radius: 26px;
    transition: background 0.3s;
}
.toggle-switch input[type="checkbox"]:checked + .toggle-label .toggle-inner {
    background: #28a745;
}
.toggle-switch .toggle-switch {
    display: none;
}
.toggle-switch .toggle-switch:before {
    display: none;
}
.toggle-switch .toggle-label .toggle-switch {
    display: none;
}
.toggle-switch .toggle-label .toggle-switch:before {
    display: none;
}
.toggle-switch .toggle-label .toggle-switch:after {
    display: none;
}
.toggle-switch .toggle-label .toggle-inner:after {
    content: '';
    position: absolute;
    left: 4px;
    top: 4px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    transition: left 0.3s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.toggle-switch input[type="checkbox"]:checked + .toggle-label .toggle-inner:after {
    left: 26px;
}
.toggle-text {
    margin-left: 60px;
    font-size: 1rem;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
}
@media (max-width: 576px) {
    .toggle-text {
        font-size: 0.95rem;
        margin-left: 54px;
    }
    .toggle-switch {
        width: 40px;
        height: 22px;
    }
    .toggle-label {
        width: 40px;
        height: 22px;
    }
    .toggle-inner {
        border-radius: 22px;
    }
    .toggle-switch input[type="checkbox"]:checked + .toggle-label .toggle-inner:after {
        left: 20px;
    }
}
.btn-limpar {
    background-color: transparent;
    color: #dc3545;
    border: 2px solid #dc3545;
    padding: 8px 16px;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12), 0 3px 8px rgba(0, 0, 0, 0.08);
}

.btn-limpar:hover {
    background-color: #dc3545;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.12);
}

.btn-limpar:active {
    background-color: #c82333;
    color: white;
    transform: scale(0.95);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

@keyframes pulsePagamento {
  0% { box-shadow: 0 4px 15px rgba(255, 140, 0, 0.18); }
  50% { box-shadow: 0 0 0 8px rgba(255, 140, 0, 0.32), 0 8px 28px rgba(255, 140, 0, 0.18); }
  100% { box-shadow: 0 4px 15px rgba(255, 140, 0, 0.18); }
}
#botao-pagar {
  background: linear-gradient(135deg, #121F4B 0%, #1a2b5f 100%);
  color: white;
  animation: none;
  transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
}
/* Removido - agora usando custom-overrides.css */
#botao-pagar:active {
  background: #0347a8;
  color: white;
  transform: scale(0.98);
}
/* Removido - agora usando custom-overrides.css */
#bloco-cartao {
  background: #121F4B;
  color: white;
  border-radius: 12px;
  padding: 25px;
  margin: 40px 0;
}
#bloco-cartao label,
#bloco-cartao .error {
  color: white;
}
#bloco-cartao input:not(.campo-valido):not(.campo-invalido):not(.campo-neutro),
#bloco-cartao select:not(.campo-valido):not(.campo-invalido):not(.campo-neutro) {
  background: #fff;
  color: #121F4B;
  border: 1px solid #e9ecef;
}
#bloco-cartao input:focus:not(.campo-valido):not(.campo-invalido):not(.campo-neutro),
#bloco-cartao select:focus:not(.campo-valido):not(.campo-invalido):not(.campo-neutro) {
  border-color: #ffd129;
  box-shadow: 0 0 0 2px #ffd12944;
}

/* Estilo para o select de parcelas - só aplica quando não há feedback ativo */
#parcelas:not(.campo-valido):not(.campo-invalido):not(.campo-neutro) {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

#parcelas option {
  padding: 10px;
  font-size: 0.95rem;
}

/* Estilos para o botão flutuante do carrinho */
#btn-flutuante-carrinho {
  background-color: #121F4B !important; /* Cor base azul escura com !important */
  color: #fff !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* Removido - agora usando hover branco gelo no CSS principal */

/* ==== ESTILOS DO SELETOR DE ANO-PROJETO ==== */
.project-year-section {
    background: #121F4B;
    color: white;
    padding: 40px 0;
}

.project-year-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
}

.project-year-section h2.section-title {
    font-size: 2.5rem;
    color: white;
    margin-bottom: 60px;
    font-weight: 700;
    text-align: center;
}

.project-year-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 30px 0;
}

.project-year-option {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
    min-height: 120px;
}

.project-year-option:hover {
    border-color: #FF662B;
    background: linear-gradient(135deg, #FF662B 0%, #e55a24 100%);
    color: white;
    box-shadow: 0 8px 30px rgba(255, 102, 43, 0.25);
    transform: translateY(-2px);
}

.project-year-option:hover .year-title {
    color: white;
}

.project-year-option:hover .year-description {
    color: #f0f0f0;
}

.project-year-option:hover .year-delivery {
    color: #121F4B;
    font-weight: 700;
}

.project-year-option:hover .year-icon {
    background: rgba(255, 255, 255, 0.2);
}

.project-year-option:hover .year-icon i {
    color: #121F4B;
}

.project-year-option.selected {
    border-color: #FF662B;
    background: linear-gradient(135deg, #FF662B 0%, #e55a24 100%);
    color: white;
}

.project-year-option.selected .year-title {
    color: white;
}

.project-year-option.selected .year-description {
    color: #f0f0f0;
}

.project-year-option.selected .year-delivery {
    color: #121F4B;
    font-weight: 700;
}

.project-year-section .section-subtitle {
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 30px;
}

.year-icon {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(18, 31, 75, 0.1);
    transition: all 0.3s ease;
}

.year-icon i {
    font-size: 1.8rem;
    color: #121F4B;
}

.project-year-option.selected .year-icon {
    background: rgba(255, 255, 255, 0.2);
}

.project-year-option.selected .year-icon i {
    color: #121F4B;
}

.year-info {
    flex: 1;
}

.year-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #121F4B;
    margin-bottom: 5px;
}

.year-description {
    font-size: 0.95rem;
    color: #6c757d;
    margin-bottom: 8px;
}

.year-delivery {
    font-size: 0.9rem;
    color: #28a745;
    font-weight: 700;
    white-space: nowrap;
}

.year-selector {
    flex-shrink: 0;
    opacity: 0;
    transition: all 0.3s ease;
}

.project-year-option.selected .year-selector {
    opacity: 1;
}

.year-selector i {
    font-size: 1.5rem;
    color: #121F4B;
}

.project-year-warning {
    margin-top: 25px;
    padding: 20px;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 1px solid #ffeaa7;
    border-radius: 12px;
    animation: slideDown 0.4s ease;
}

.warning-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.warning-content i {
    font-size: 1.5rem;
    color: #856404;
    flex-shrink: 0;
}

.warning-text {
    color: #856404;
    font-size: 0.95rem;
    line-height: 1.5;
}

.warning-text strong {
    font-weight: 700;
}

/* Animações */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsividade */
@media (max-width: 768px) {
    .project-year-options {
        grid-template-columns: 1fr;
        gap: 15px;
        justify-items: center;
    }
    
    .project-year-option {
        padding: 20px;
        min-height: 100px;
        width: 100%;
        max-width: 350px;
    }
    
    .year-icon {
        width: 50px;
        height: 50px;
    }
    
    .year-icon i {
        font-size: 1.5rem;
    }
    
    .year-title {
        font-size: 1.2rem;
    }
    
    .project-year-warning {
        padding: 15px;
    }
    
    .project-year-container {
        padding: 0 15px;
        text-align: center;
    }
    
    .warning-content {
        gap: 12px;
    }
}

/* ==== ESTILOS DO SISTEMA DE FRETE ==== */
/* Estilos movidos para o arquivo CSS principal */

.opcoes-frete {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    justify-content: flex-start;
}

#opcoes-frete-container > *:not(.ver-mais-opcoes-container):not(.opcoes-extras-container) {
    flex: 1;
    min-width: 280px;
    max-width: none;
}

/* Forçar botão a sair do layout flex */
.ver-mais-opcoes-container {
    flex: none !important;
    width: 100% !important;
    min-width: auto !important;
    max-width: none !important;
}

.opcoes-extras-container {
    flex: none !important;
    width: 100% !important;
    min-width: auto !important;
    max-width: none !important;
}

/* Classes antigas mantidas para compatibilidade */
.bloco-opcao-frete {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    position: relative;
}

/* Classes novas do JavaScript */
.freight-option {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    position: relative;
}

/* Hover para blocos habilitados */
.bloco-opcao-frete:hover:not(.disabled),
.freight-option:hover:not(.disabled) {
    border-color: #121F4B;
    box-shadow: 0 8px 24px rgba(18, 31, 75, 0.15);
    transform: translateY(-2px);
}

/* Estado selecionado */
.bloco-opcao-frete.selecionado,
.freight-option.selected {
    border-color: #121F4B;
    background: linear-gradient(135deg, #121F4B 0%, #1a2b5f 100%);
    color: white;
    box-shadow: 0 8px 32px rgba(18, 31, 75, 0.25);
    transform: translateY(-1px);
}

.bloco-opcao-frete.selecionado .frete-preco,
.freight-option.selected .freight-price {
    color: #ffd129;
    font-weight: 600;
}

/* Estado desabilitado */
.bloco-opcao-frete.disabled,
.freight-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    background: #f8f9fa;
}

/* Estado placeholder */
.bloco-opcao-frete.placeholder {
    opacity: 0.6;
}

.bloco-opcao-frete.placeholder .frete-nome {
    color: #6c757d;
    font-style: italic;
}

/* Ícones dos fretes */
.frete-imagem {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.bloco-opcao-frete.selecionado .frete-imagem {
    background: rgba(255, 255, 255, 0.1);
}

.bloco-opcao-frete.selecionado .frete-imagem i {
    color: #ffd129 !important;
}

.bloco-opcao-frete.disabled .frete-imagem i {
    color: #6c757d !important;
}

/* Texto dos fretes */
.frete-info {
    flex: 1;
}

.frete-nome {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: #121F4B;
    transition: color 0.3s ease;
}

/* NOVOS ESTILOS: Separar transportadora e modalidade */
.frete-empresa {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 2px;
    color: #121F4B;
    transition: color 0.3s ease;
}

.frete-modalidade {
    font-weight: 400;
    font-size: 0.85rem;
    margin-bottom: 5px;
    color: #6c757d;
    transition: color 0.3s ease;
    line-height: 1.2;
}

.bloco-opcao-frete.selecionado .frete-empresa {
    color: white;
}

.bloco-opcao-frete.selecionado .frete-modalidade {
    color: #e9ecef;
}

.bloco-opcao-frete.disabled .frete-empresa {
    color: #6c757d;
}

.bloco-opcao-frete.disabled .frete-modalidade {
    color: #adb5bd;
}

.bloco-opcao-frete.selecionado .frete-nome {
    color: white;
}

.bloco-opcao-frete.disabled .frete-nome {
    color: #6c757d;
}

.frete-preco {
    font-size: 1.3rem;
    font-weight: 700;
    color: #28a745;
    margin-bottom: 3px;
    transition: color 0.3s ease;
}

.bloco-opcao-frete.disabled .frete-preco {
    color: #6c757d;
}

.frete-prazo {
    font-size: 0.9rem;
    color: #6c757d;
    transition: color 0.3s ease;
}

.bloco-opcao-frete.selecionado .frete-prazo {
    color: #e9ecef;
}

.bloco-opcao-frete.disabled .frete-prazo {
    color: #adb5bd;
}

/* Animação para mudanças de estado */
.bloco-opcao-frete.calculando {
    position: relative;
}

.bloco-opcao-frete.calculando::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 20px;
    width: 20px;
    height: 20px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #121F4B;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsividade melhorada */
@media (max-width: 768px) {
    .container-frete {
        margin: 30px auto;
        padding: 20px;
    }
    
    .opcoes-frete {
        flex-direction: column;
        gap: 15px;
    }
    
    #opcoes-frete-container > * {
        flex: 1 1 100%;
        min-width: unset;
        max-width: unset;
    }
    
    .bloco-opcao-frete,
    .freight-option {
        padding: 15px;
        gap: 12px;
    }
    
    .frete-imagem,
    .freight-icon {
        width: 50px;
        height: 50px;
    }
    
    .frete-imagem i,
    .freight-icon i {
        font-size: 1.5rem !important;
    }
    
    .frete-nome,
    .freight-name {
        font-size: 1rem;
    }
    
    .frete-preco,
    .freight-price {
        font-size: 1.2rem;
    }
    
    /* Reduz hover em mobile */
    .bloco-opcao-frete:hover:not(.disabled),
    .freight-option:hover:not(.disabled) {
        transform: none;
    }
}

/* Estilo para campos inválidos na validação */
.container-frete.invalid {
    animation: shakeError 0.5s ease-in-out;
}

@keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* Modal Cupom Styles */
.coupon-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.coupon-modal.show {
    opacity: 1;
}

.coupon-modal.closing {
    opacity: 0;
}

.coupon-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.4s ease;
}

.coupon-modal-content {
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 24px;
    padding: 50px 60px 70px 60px;
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow: visible;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 2px solid rgba(40, 44, 74, 0.1);
}

.coupon-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(40, 44, 74, 0.1);
    border: none;
    color: #282C4A;
    font-size: 24px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    display: grid;
    place-items: center;
    line-height: 1;
    padding: 0;
    margin: 0;
    z-index: 10;
    font-weight: 400;
    font-family: Arial, sans-serif;
}

.coupon-modal-close:hover {
    background: rgba(40, 44, 74, 0.2);
    transform: rotate(90deg) scale(1.1);
}

.coupon-modal-header {
    text-align: center;
    margin-bottom: 40px;
    animation: fadeInDown 0.6s ease 0.2s both;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
}

.modal-title-top {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #282C4A;
    margin: 0;
    padding-bottom: 2px;
    letter-spacing: 0.3px;
}

.modal-title-main {
    font-family: 'Poppins', sans-serif;
    font-size: 48px;
    color: #282C4A;
    line-height: 1.1;
    margin: 0;
    padding: 0;
    letter-spacing: -0.5px;
}

.title-compra {
    font-weight: 600;
}

.title-antecipada {
    font-weight: 800;
}

.modal-title-badge {
    background: linear-gradient(135deg, #282C4A 0%, #1f2238 100%);
    padding: 8px 24px;
    border-radius: 20px;
    margin-top: 12px;
}

.modal-title-badge p {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #FFFFFF;
    margin: 0;
    letter-spacing: 0.5px;
}

.coupon-modal-body {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 50px;
    animation: fadeInUp 0.6s ease 0.4s both;
}

.coupon-progress-container {
    position: relative;
    width: 280px;
    height: 280px;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    animation: scaleIn 0.8s ease-out 0.6s both;
    transition: transform 0.3s ease;
    padding: 0;
}

.coupon-progress-container:hover {
    transform: scale(1.05) rotate(5deg);
}

.circular-progress {
    width: 100%;
    height: 100%;
}

.progress-track {
    stroke: #282C4A;
}

.progress-fill {
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
    transform-origin: center;
    transform: rotate(-90deg);
}

.progress-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 100%;
    display: grid;
    place-items: center;
    padding: 0;
    margin: 0;
}

.progress-inner-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0;
    margin: 0;
}

.progress-top {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #282C4A;
    line-height: 1;
    margin: 0;
    padding: 0 0 8px 0;
    opacity: 1;
    letter-spacing: 0;
}

.progress-main {
    font-family: 'Poppins', sans-serif;
    font-size: 62px;
    font-weight: 800;
    color: #282C4A;
    line-height: 1;
    margin: 0;
    padding: 0;
}

.progress-label {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #282C4A;
    line-height: 1;
    margin: 0;
    padding: 8px 0 0 0;
    opacity: 1;
    letter-spacing: 0;
}

.coupon-ticket {
    flex-shrink: 0;
    max-width: 450px;
    width: 100%;
    animation: slideInRight 0.8s ease-out 0.6s both;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
}

.coupon-ticket:hover {
    transform: translateY(-5px) scale(1.02);
}

.coupon-ticket img {
    width: 100%;
    height: auto;
    display: block;
}

.coupon-modal-footer {
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    padding: 20px 40px;
    background: linear-gradient(135deg, #282C4A 0%, #1f2238 100%);
    border-radius: 50px;
    text-align: center;
    animation: fadeInUp 0.6s ease 0.8s both;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    width: fit-content;
    max-width: 90%;
    z-index: 10;
}

.coupon-modal-footer p {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #FFFFFF;
    margin: 0;
    padding: 0;
    letter-spacing: 0.3px;
    line-height: 1.5;
    white-space: nowrap;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes modalSlideUp {
    from {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes countUp {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes separatorFade {
    from {
        opacity: 0;
        width: 0;
    }
    to {
        opacity: 1;
        width: 70%;
    }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.progress-fill {
    animation: pulse 2s ease-in-out infinite;
}

/* Shimmer/Skeleton Loading Effect */
.coupon-modal-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmerAnimation 2s infinite;
    pointer-events: none;
    border-radius: 24px;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.coupon-modal-content.loading .coupon-modal-shimmer {
    opacity: 1;
}

.coupon-modal-content.loading {
    pointer-events: none;
}

.coupon-modal-content.loading .coupon-modal-body,
.coupon-modal-content.loading .coupon-modal-header,
.coupon-modal-content.loading .coupon-modal-footer {
    opacity: 0.4;
}

@keyframes shimmerAnimation {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .coupon-modal-content {
        padding: 40px 30px 30px 30px;
        border-radius: 20px;
    }
    
    .modal-title-main {
        font-size: 42px;
    }
    
    .modal-title-sub {
        font-size: 18px;
    }
    
    .coupon-modal-body {
        flex-direction: column;
        gap: 30px;
    }
    
    .coupon-progress-container {
        width: 220px;
        height: 220px;
    }
    
    .progress-top {
        font-size: 18px;
        padding: 0 0 6px 0;
    }
    
    .progress-main {
        font-size: 50px;
    }
    
    .progress-label {
        font-size: 18px;
        padding: 6px 0 0 0;
    }
    
    .modal-title-top {
        padding-bottom: 1px;
    }
    
    .coupon-ticket {
        max-width: 100%;
    }
    
    .coupon-modal-close {
        width: 40px;
        height: 40px;
        font-size: 28px;
        top: 15px;
        right: 15px;
    }
    
    .coupon-modal-content {
        padding: 40px 30px 70px 30px;
    }
    
    .coupon-modal-footer {
        bottom: -25px;
        padding: 18px 30px;
        border-radius: 40px;
        max-width: 85%;
    }
    
    .coupon-modal-footer p {
        font-size: 13px;
        line-height: 1.4;
        white-space: normal;
    }
    
    .modal-title-top {
        font-size: 18px;
    }
    
    .modal-title-main {
        font-size: 32px;
    }
    
    .modal-title-badge {
        padding: 6px 20px;
    }
    
    .modal-title-badge p {
        font-size: 14px;
    }
}
</style>
</head>
<body class="store-home-page">

<!-- Wrapper para pattern contínuo (hero + extensão + metade do banner) -->
<div class="hero-clouds-wrapper">

<!-- Seção 1: Hero/Home (Header + Banners + Vídeo) -->
<section class="hero-section">
<!-- Header -->
<header class="site-header">
        <div class="header-container">
    <div class="logo-container">
        <a href="home/" title="Business Education" class="logo-home">
        <img src="../imagens/logo-loja.png" alt="Logo Business Education">
        </a>
    </div>
    <nav class="header-nav">
        <a href="pedidos/meus-pedidos" class="header-btn meus-pedidos-destaque" title="Meus Pedidos">
            <span class="btn-text">Meus Pedidos</span>
            <span class="btn-text-mobile">Meus Pedidos</span>
            <i class="fas fa-box"></i>
        </a>
        <a href="#" class="header-btn carrinho" id="header-btn-carrinho" title="Carrinho">
            <span class="btn-text">Carrinho</span>
            <span class="btn-text-mobile"></span>
            <i class="fas fa-shopping-cart"></i>
        </a>
        <a href="ajuda/index" class="header-btn ajuda" title="Ajuda">
            <span class="btn-text">Ajuda</span>
            <span class="btn-text-mobile">Ajuda</span>
            <i class="fas fa-headset"></i>
        </a>
        <a href="faq/index" class="header-btn" title="FAQ">
            <span class="btn-text">FAQ</span>
            <span class="btn-text-mobile"></span>
            <i class="fas fa-question-circle"></i>
        </a>
        <a href="https://wa.me/551142102216" target="_blank" class="header-btn whatsapp" title="WhatsApp">
            <span class="btn-text">WhatsApp</span>
            <span class="btn-text-mobile">WhatsApp</span>
            <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://businesseducation.com.br" target="_blank" class="header-btn business" title="Site Business">
            <span class="btn-text">Site Business</span>
            <span class="btn-text-mobile">Business</span>
            <img src="../imagens/favicon-business.png" class="favicon-icon" alt="Business">
        </a>
    </nav>
        </div>
</header>

    <!-- Conteúdo Hero -->
    <div class="hero-content">
        <!-- Slider Container -->
        <div class="hero-slider">
            <div class="slider-wrapper">
                <!-- Slide 1 MOBILE: Empreendedor é Rei -->
                <div class="slide active slide-mobile-only" data-slide="0">
                    <div class="hero-entrepreneur-container">
                        <div class="entrepreneur-phrase">
                            <div class="typewriter-container entrepreneur-typewriter">
                                <div class="typewriter-line" data-text="Em terra de"></div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="incertezas,"></div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="empreendedor"></div>
                                <div class="typewriter-line" data-text="é rei!"></div>
                            </div>
                        </div>
                        <div class="entrepreneur-image">
                            <img src="../imagens/Menino com Coroa - Loja.png" alt="Empreendedor é Rei">
                        </div>
                    </div>
                </div>

                <!-- Slide 2 MOBILE: Banner Principal -->
                <div class="slide slide-mobile-only" data-slide="1">
                    <div class="hero-banner">
                        <img alt="Banner Promocional" src="imagens/banner-promocional-mobile.png" class="banner-image" id="banner-image-1"/>
                    </div>
                </div>

                <!-- Slide 3 MOBILE: Vídeo apenas -->
                <div class="slide slide-mobile-only" data-slide="2">
                    <div class="hero-video-container mobile-video-only">
                        <div class="hero-video">
                            <video controls class="video-institucional">
                                <source src="../imagens/Institucional B2c - Business Education - Mobile.mp4" type="video/mp4">
                                Seu navegador não suporta a reprodução de vídeos.
                            </video>
                        </div>
                    </div>
                </div>

                <!-- Slide 4 MOBILE: Texto com palavras rotativas -->
                <div class="slide slide-mobile-only" data-slide="3">
                    <div class="hero-text-only hero-rotating-words-container">
                        <div class="rotating-words-text">
                            <div class="typewriter-container rotating-text-container">
                                <div class="typewriter-line video-highlight">Educação para</div>
                                <div class="typewriter-line rotating-word-line word-rotate-blue">
                                    <span class="rotating-word active">OUSAR</span>
                                    <span class="rotating-word">LIDERAR</span>
                                    <span class="rotating-word">CRIAR</span>
                                    <span class="rotating-word">INOVAR</span>
                                    <span class="rotating-word">TRANSFORMAR</span>
                                </div>
                                <div class="typewriter-line video-highlight">e ser o que</div>
                                <div class="typewriter-line video-highlight">quiser.</div>
                            </div>
                        </div>
                        <div class="rotating-words-image">
                            <img src="../imagens/Caixa Livros.png" alt="Educação para o futuro">
                        </div>
                    </div>
                </div>

                <!-- Slide 1 DESKTOP: Empreendedor é Rei -->
                <div class="slide active slide-desktop-only" data-slide="0">
                    <div class="hero-entrepreneur-container">
                        <div class="entrepreneur-phrase">
                            <div class="typewriter-container entrepreneur-typewriter">
                                <div class="typewriter-line" data-text="Em terra de"></div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="incertezas,"></div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="empreendedor"></div>
                                <div class="typewriter-line" data-text="é rei!"></div>
                            </div>
                        </div>
                        <div class="entrepreneur-image">
                            <img src="../imagens/Menino com Coroa - Loja.png" alt="Empreendedor é Rei">
                        </div>
                    </div>
                </div>

                <!-- Slide 2 DESKTOP: Banner Principal -->
                <div class="slide slide-desktop-only" data-slide="1">
                    <div class="hero-banner">
                        <img alt="Banner Promocional" src="imagens/banner-promocional.png" class="banner-image" id="banner-image-2"/>
                    </div>
                </div>

                <!-- Slide 3 DESKTOP: Vídeo institucional -->
                <div class="slide slide-desktop-only" data-slide="2">
                    <div class="hero-video-container">
                        <div class="hero-video">
                            <video controls class="video-institucional video-desktop">
                                <source src="../imagens/Institucional B2c - Business Education.mp4" type="video/mp4">
                                Seu navegador não suporta a reprodução de vídeos.
                            </video>
                        </div>
                    </div>
                </div>

                <!-- Slide 4 DESKTOP: Texto com palavras rotativas -->
                <div class="slide slide-desktop-only" data-slide="3">
                    <div class="hero-text-only hero-rotating-words-container">
                        <div class="rotating-words-image">
                            <img src="../imagens/Caixa Livros.png" alt="Educação para o futuro">
                        </div>
                        <div class="rotating-words-text">
                            <div class="typewriter-container rotating-text-container">
                                <div class="typewriter-line video-highlight">Educação para</div>
                                <div class="typewriter-line rotating-word-line word-rotate-blue">
                                    <span class="rotating-word active">OUSAR</span>
                                    <span class="rotating-word">LIDERAR</span>
                                    <span class="rotating-word">CRIAR</span>
                                    <span class="rotating-word">INOVAR</span>
                                    <span class="rotating-word">TRANSFORMAR</span>
                                </div>
                                <div class="typewriter-line video-highlight">e ser o que</div>
                                <div class="typewriter-line video-highlight">quiser.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DUPLICADOS PARA LOOP INFINITO - MOBILE (texto pré-renderizado) -->
                <div class="slide slide-mobile-only" data-slide="0">
                    <div class="hero-entrepreneur-container">
                        <div class="entrepreneur-phrase">
                            <div class="typewriter-container entrepreneur-typewriter">
                                <div class="typewriter-line" data-text="Em terra de">Em terra de</div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="incertezas,">incertezas,</div>
                                <div class="typewriter-line entrepreneur-highlight" data-text="empreendedor">empreendedor</div>
                                <div class="typewriter-line" data-text="é rei!">é rei!</div>
                            </div>
                        </div>
                        <div class="entrepreneur-image">
                            <img src="../imagens/Menino com Coroa - Loja.png" alt="Empreendedor é Rei">
                        </div>
                    </div>
                </div>

                <div class="slide slide-mobile-only" data-slide="1">
                    <div class="hero-banner">
                        <img alt="Banner Topo" src="<?php echo htmlspecialchars($store_config['images']['banner_top']); ?>" class="banner-image" id="banner-image-3"/>
                    </div>
                </div>

                <div class="slide slide-mobile-only" data-slide="2">
                    <div class="hero-video-container mobile-video-only">
                        <div class="hero-video">
                            <video controls class="video-institucional">
                                <source src="../imagens/Institucional B2c - Business Education - Mobile.mp4" type="video/mp4">
                                Seu navegador não suporta a reprodução de vídeos.
                            </video>
                        </div>
                    </div>
                </div>

                <div class="slide slide-mobile-only" data-slide="3">
                    <div class="hero-text-only hero-rotating-words-container">
                        <div class="rotating-words-text">
                            <div class="typewriter-container rotating-text-container">
                                <div class="typewriter-line video-highlight">Educação para</div>
                                <div class="typewriter-line rotating-word-line word-rotate-blue">
                                    <span class="rotating-word active">OUSAR</span>
                                    <span class="rotating-word">LIDERAR</span>
                                    <span class="rotating-word">CRIAR</span>
                                    <span class="rotating-word">INOVAR</span>
                                    <span class="rotating-word">TRANSFORMAR</span>
                                </div>
                                <div class="typewriter-line video-highlight">e ser o que</div>
                                <div class="typewriter-line video-highlight">quiser.</div>
                            </div>
                        </div>
                        <div class="rotating-words-image">
                            <img src="../imagens/Caixa Livros.png" alt="Educação para o futuro">
                        </div>
                    </div>
                </div>

                <!-- DUPLICADOS PARA LOOP INFINITO - DESKTOP (texto pré-renderizado) -->
                <div class="slide slide-desktop-only" data-slide="0">
                    <div class="hero-entrepreneur-container">
                        <div class="entrepreneur-phrase">
                            <div class="typewriter-container entrepreneur-typewriter">
                                <div class="typewriter-line">Em terra de</div>
                                <div class="typewriter-line entrepreneur-highlight">incertezas,</div>
                                <div class="typewriter-line entrepreneur-highlight">empreendedor</div>
                                <div class="typewriter-line">é rei!</div>
                            </div>
                        </div>
                        <div class="entrepreneur-image">
                            <img src="../imagens/Menino com Coroa - Loja.png" alt="Empreendedor é Rei">
                        </div>
                    </div>
                </div>

                <div class="slide slide-desktop-only" data-slide="1">
                    <div class="hero-banner">
                        <img alt="Banner Topo" src="<?php echo htmlspecialchars($store_config['images']['banner_top']); ?>" class="banner-image" id="banner-image-4"/>
                    </div>
                </div>

                <div class="slide slide-desktop-only" data-slide="2">
                    <div class="hero-video-container">
                        <div class="hero-video">
                            <video controls class="video-institucional video-desktop">
                                <source src="../imagens/Institucional B2c - Business Education.mp4" type="video/mp4">
                                Seu navegador não suporta a reprodução de vídeos.
                            </video>
                        </div>
                    </div>
                </div>

                <div class="slide slide-desktop-only" data-slide="3">
                    <div class="hero-text-only hero-rotating-words-container">
                        <div class="rotating-words-image">
                            <img src="../imagens/Caixa Livros.png" alt="Educação para o futuro">
                        </div>
                        <div class="rotating-words-text">
                            <div class="typewriter-container rotating-text-container">
                                <div class="typewriter-line video-highlight">Educação para</div>
                                <div class="typewriter-line rotating-word-line word-rotate-blue">
                                    <span class="rotating-word active">OUSAR</span>
                                    <span class="rotating-word">LIDERAR</span>
                                    <span class="rotating-word">CRIAR</span>
                                    <span class="rotating-word">INOVAR</span>
                                    <span class="rotating-word">TRANSFORMAR</span>
                                </div>
                                <div class="typewriter-line video-highlight">e ser o que</div>
                                <div class="typewriter-line video-highlight">quiser.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Indicadores - Desktop: 4 / Mobile: 4 -->
            <div class="slider-indicators">
                <button class="indicator active" data-slide="0" aria-label="Slide 1"></button>
                <button class="indicator" data-slide="1" aria-label="Slide 2"></button>
                <button class="indicator" data-slide="2" aria-label="Slide 3"></button>
                <button class="indicator" data-slide="3" aria-label="Slide 4"></button>
            </div>
        </div>
        
    </div>
</section>

<!-- Extensão da seção hero - azul escuro com pattern de nuvens -->
<section class="hero-extension-section">
    <!-- Esta seção proporciona continuidade do pattern de nuvens -->
</section>

<!-- Banner da Escola - posicionado na transição entre seções -->
<section class="school-banner-wrapper">
    <div class="section-container">
        <div class="hero-school-banner">
            <img alt="Nome da Escola" src="<?php echo htmlspecialchars($store_config['images']['banner_school']); ?>" class="banner-image"/>
        </div>
    </div>
</section>

</div><!-- Fim do hero-clouds-wrapper -->

<!-- Seção 2: Formulário de Dados -->
<section class="form-section">
    <div class="section-container">
        <div class="form-header">
        <h2 class="section-title">Formulário de Compra</h2>
    </div>

        <form id="form-pagamento">
            <!-- Botão Limpar Dados dentro do formulário -->
            <div class="form-actions">
    <button type="button" id="btnLimparDados" class="btn-limpar">
        <i class="fas fa-trash-alt"></i> Limpar dados
    </button>
</div>

<!-- Dados Pessoais -->
<div class="row">
    <div class="col">
        <label for="nome" class="required">Nome</label>
        <input type="text" id="nome" name="nome" required placeholder="Digite seu nome">
        <div class="error" id="nome-error">Digite seu nome</div>
    </div>
    <div class="col">
        <label for="sobrenome" class="required">Sobrenome</label>
        <input type="text" id="sobrenome" name="sobrenome" required placeholder="Digite seu sobrenome">
        <div class="error" id="sobrenome-error">Digite seu sobrenome</div>
    </div>
    <div class="col">
        <label for="cpf" class="required">CPF</label>
        <input type="text" id="cpf" name="cpf" required placeholder="000.000.000-00">
        <div class="error" id="cpf-error">Digite um CPF válido</div>
    </div>
</div>

<div class="row">
    <div class="col">
        <label for="celular" class="required">Celular</label>
        <div id="phone-container-celular"></div>
        <!-- Campo hidden único para armazenar o valor completo do celular -->
        <input type="hidden" id="celular_hidden" name="celular" value="">
        <div class="error" id="celular-error">Digite um celular válido</div>
    </div>
    <div class="col">
        <label for="email" class="required">Email</label>
        <input type="email" id="email" name="email" required placeholder="seu@email.com">
        <div class="error" id="email-error">Digite um email válido</div>
    </div>
    <div class="col">
        <label for="qtd_filhos" class="required">Quantidade de Filhos</label>
        <select id="qtd_filhos" name="qtd_filhos" required>
            <option value="">Selecione</option>
            <option value="1">1 filho</option>
            <option value="2">2 filhos</option>
            <option value="3">3 filhos</option>
            <option value="4">4 filhos</option>
</select>
        <div class="error" id="qtd_filhos-error">Selecione a quantidade de filhos</div>
    </div>
</div>

<!-- Container para campos dos filhos -->
<div id="campos-filhos">
    <h3 style="text-align: left; margin-bottom: 20px;">Dados dos Filhos</h3>
</div>

<!-- Endereço de Entrega -->
<div class="endereco-section">
    <h3>Endereço de Entrega</h3>
    <div class="row">
        <div class="col-small">
            <label for="entrega_cep" class="required">CEP</label>
            <input type="text" id="entrega_cep" name="entrega_cep" required placeholder="00000-000">
            <div class="error" id="entrega_cep-error">CEP inválido</div>
        </div>
        <div class="col">
            <label for="entrega_endereco" class="required">Endereço</label>
            <input type="text" id="entrega_endereco" name="entrega_endereco" required placeholder="Rua, Avenida, etc">
            <div class="error" id="entrega_endereco-error">Endereço obrigatório</div>
        </div>
        <div class="col-small">
            <label for="entrega_numero" class="required">Número</label>
            <input type="text" id="entrega_numero" name="entrega_numero" required placeholder="Nº">
            <div class="error" id="entrega_numero-error">Número obrigatório</div>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <label for="entrega_complemento">Complemento</label>
            <input type="text" id="entrega_complemento" name="entrega_complemento" placeholder="Apto, Bloco, etc">
        </div>
        <div class="col">
            <label for="entrega_bairro" class="required">Bairro</label>
            <input type="text" id="entrega_bairro" name="entrega_bairro" required placeholder="Seu bairro">
            <div class="error" id="entrega_bairro-error">Bairro obrigatório</div>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <label for="entrega_cidade" class="required">Cidade</label>
            <input type="text" id="entrega_cidade" name="entrega_cidade" required placeholder="Sua cidade">
            <div class="error" id="entrega_cidade-error">Cidade obrigatória</div>
        </div>
        <div class="col-small">
            <label for="entrega_estado" class="required">Estado</label>
            <select id="entrega_estado" name="entrega_estado" required>
                <option value="">UF</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
</select>
            <div class="error" id="entrega_estado-error">Estado obrigatório</div>
        </div>
    </div>
    <!-- Toggle para endereço de faturamento MOVIMENTADO PARA CA -->
    <div class="toggle-switch-container">
        <div class="toggle-switch">
            <input type="checkbox" id="mesmo_endereco" checked>
            <label class="toggle-label" for="mesmo_endereco">
                <span class="toggle-inner"></span>
            </label>
        </div>
        <span class="toggle-text">O endereço de faturamento é o mesmo de entrega</span>
    </div>
</div>

<!-- Endereço de Faturamento -->
<div id="endereco-faturamento-container" style="display: none;">
    <h3>Endereço de Faturamento</h3>
    <div class="row">
        <div class="col-small">
            <label for="faturamento_cep">CEP</label>
            <input type="text" id="faturamento_cep" name="faturamento_cep" placeholder="00000-000">
        </div>
        <div class="col">
            <label for="faturamento_endereco">Endereço</label>
            <input type="text" id="faturamento_endereco" name="faturamento_endereco" placeholder="Rua, Avenida, etc">
        </div>
        <div class="col-small">
            <label for="faturamento_numero">Número</label>
            <input type="text" id="faturamento_numero" name="faturamento_numero" placeholder="Nº">
        </div>
    </div>

    <div class="row">
        <div class="col">
            <label for="faturamento_complemento">Complemento</label>
            <input type="text" id="faturamento_complemento" name="faturamento_complemento" placeholder="Apto, Bloco, etc">
        </div>
        <div class="col">
            <label for="faturamento_bairro">Bairro</label>
            <input type="text" id="faturamento_bairro" name="faturamento_bairro" placeholder="Seu bairro">
        </div>
    </div>

    <div class="row">
        <div class="col">
            <label for="faturamento_cidade">Cidade</label>
            <input type="text" id="faturamento_cidade" name="faturamento_cidade" placeholder="Sua cidade">
        </div>
        <div class="col-small">
            <label for="faturamento_estado">Estado</label>
            <select id="faturamento_estado" name="faturamento_estado">
                <option value="">UF</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
            </select>
        </div>
    </div>
</div>
        </form>
    </div>
</section>

<!-- Seção 3: Produtos -->
<section class="products-section">
    <div class="section-container">
        
        <!-- Nova Seção: Seleção Automática (inicialmente oculta) -->
        <div id="colecoes-correspondentes" class="colecoes-correspondentes" style="display: none;">
            <h2 class="section-title" style="display: flex; align-items: center;">
                Seleção Automática
                <button class="info-tooltip-btn" data-tooltip="Ao inserir a série dos seus filhos, selecionamos automaticamente os produtos certos para eles.">
                    <i class="fas fa-info-circle"></i>
                </button>
            </h2>
            <p class="section-subtitle">Produtos selecionados automaticamente para seus filhos</p>
            <div class="produtos-correspondentes" id="produtos-correspondentes">
                <!-- Produtos auto-selecionados serão movidos aqui via JavaScript -->
            </div>
        </div>
        
        <!-- Seção Original: Todas as Coleções -->
        <div id="todas-colecoes" class="todas-colecoes">
            <h2 class="section-title">Todas as Coleções</h2>
            <p class="section-subtitle">Produtos disponíveis para as demais séries</p>
            <div class="produtos" id="produtos-originais">
                <?php foreach ($produtos as $id => $produto): ?>
                <div class="produto" data-produto-id="<?php echo htmlspecialchars($id); ?>" data-produto-grade="<?php echo htmlspecialchars($produto['serie']); ?>">
                    <div class="product-gallery">
                        <div class="main-image-container">
                            <div class="image-crossfade-container">
                                <img class="main-product-image active" id="mainProductImage_<?php echo htmlspecialchars($id); ?>" alt="<?php echo htmlspecialchars($produto['nome']); ?>" src="<?php echo htmlspecialchars($produto['imagem']); ?>"/>
                                <img class="main-product-image" id="secondaryProductImage_<?php echo htmlspecialchars($id); ?>" alt="<?php echo htmlspecialchars($produto['nome']); ?>" src="<?php echo htmlspecialchars($produto['imagem']); ?>"/>
                            </div>
                            <?php if (!empty($produto['galeria']) && count($produto['galeria']) > 1): ?>
                                <button type="button" class="carousel-arrow prev" onclick="navigateGallery('<?php echo htmlspecialchars($id); ?>', -1)" title="Anterior">&#10094;</button>
                                <button type="button" class="carousel-arrow next" onclick="navigateGallery('<?php echo htmlspecialchars($id); ?>', 1)" title="Próxima">&#10095;</button>
                            <?php endif; ?>
                        </div>
                        <?php if (!empty($produto['galeria']) && count($produto['galeria']) > 1): ?>
                            <div class="thumbnail-container">
                                <div class="thumbnail-track">
                                    <?php foreach ($produto['galeria'] as $thumb_idx => $thumb_image_url): ?>
                                        <img class="thumbnail<?php echo ($thumb_image_url == $produto['imagem']) ? ' active' : ''; ?>" 
                                             src="<?php echo htmlspecialchars($thumb_image_url); ?>" 
                                             alt="Thumbnail <?php echo $thumb_idx + 1; ?> de <?php echo htmlspecialchars($produto['nome']); ?>" 
                                             data-image-url="<?php echo htmlspecialchars($thumb_image_url); ?>"
                                             onclick="changeMainImage('<?php echo htmlspecialchars($id); ?>', '<?php echo htmlspecialchars($thumb_image_url); ?>', this)">
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <h3 class="produto-nome"><?php echo htmlspecialchars($produto['nome']); ?></h3>
                    <div class="produto-grade" style="display: none;"><?php echo htmlspecialchars($produto['grade']); ?></div>
                    
                    <div class="valor-original">
                          R$ <?php echo number_format($produto['valor'], 2, ',', '.'); ?>
                          <span class="desconto">
                           (-<?php echo calcularDesconto($produto['valor'], $produto['valor_pix']); ?>%)
                          </span>
                    </div>
                    <div class="valor-pix">
                          R$ <?php echo number_format($produto['valor_pix'], 2, ',', '.'); ?> no Pix
                         </div>
                    <div class="valor-parcelado">
                          ou até <?php echo $max_parcelas; ?>x de R$ <?php echo calcularParcela($produto['valor_cartao'], $max_parcelas); ?> sem juros
                         </div>
                    
                    <!-- Div para mostrar nomes dos filhos -->
                    <div class="produto-nomes-filhos" id="nomes-filhos-<?php echo htmlspecialchars($id); ?>" style="display: none;">
                        <i class="fas fa-user-graduate"></i>
                        <span class="nomes-lista"></span>
                    </div>
                    
                    <div class="quantidade">
                    <label>
                           Quantidade
                          </label>
                    <div class="quantidade-botoes">
                        <input type="hidden" name="quantidade[<?php echo htmlspecialchars($id); ?>]" value="0" id="quantidade-input-<?php echo htmlspecialchars($id); ?>">
                        <button type="button" class="btn-quantidade" data-value="1" data-produto="<?php echo htmlspecialchars($id); ?>" onclick="selecionarQuantidade(this)">1</button>
                        <button type="button" class="btn-quantidade" data-value="2" data-produto="<?php echo htmlspecialchars($id); ?>" onclick="selecionarQuantidade(this)">2</button>
                        <button type="button" class="btn-quantidade" data-value="3" data-produto="<?php echo htmlspecialchars($id); ?>" onclick="selecionarQuantidade(this)">3</button>
                        <button type="button" class="btn-quantidade" data-value="4" data-produto="<?php echo htmlspecialchars($id); ?>" onclick="selecionarQuantidade(this)">4</button>
                    </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <input id="valor_total" name="valor_total" type="hidden" value="0"/>
        <input id="valor_cartao_total" name="valor_cartao_total" type="hidden" value="0"/>
    </div>
</section>

<?php if ($freight_enabled): ?>
<!-- Seção 4: Ano-Projeto -->
<section class="project-year-section">
    <div class="section-container">
        <h2 class="section-title">Ano Letivo</h2>
        <div class="project-year-container">
            <p class="section-subtitle">Selecione para qual ano você está adquirindo os materiais:</p>
            
            <div class="project-year-options">
                <div class="project-year-option" id="project-year-2025" data-year="2025" onclick="selecionarAnoProjeto('2025')">
                    <div class="year-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="year-info">
                        <div class="year-title">Ano Letivo 2025</div>
                        <div class="year-description">Materiais para o ano letivo atual</div>
                        <div class="year-delivery">Entrega imediata disponível</div>
                    </div>
                    <div class="year-selector">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                
                <div class="project-year-option" id="project-year-2026" data-year="2026" onclick="selecionarAnoProjeto('2026')">
                    <div class="year-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="year-info">
                        <div class="year-title">Ano Letivo 2026</div>
                        <div class="year-description">Materiais para o próximo ano letivo</div>
                        <div class="year-delivery">Envios a partir de 08/12/2025</div>
                    </div>
                    <div class="year-selector">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            
            <!-- Aviso para 2026 -->
            <div class="project-year-warning" id="warning-2026" style="display: none;">
                <div class="warning-content">
                    <i class="fas fa-bullhorn"></i>
                    <div class="warning-text">
                        <strong>Importante!</strong><br>
                        Nossa janela de envios para <strong>2026</strong> inicia em <strong>16 de dezembro de 2025</strong>.
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Seção 5: Frete -->
<section class="freight-section">
    <div class="section-container">
    <h2 class="section-title">Opções de Entrega</h2>
        <div class="container-frete">
    
    <!-- Blocos de Frete Principais -->
    <div class="opcoes-frete-principais" id="opcoes-frete-container" style="min-height: 350px;">
        <!-- Opção FIXA: Retirada na Escola (sempre disponível) -->
        <div class="bloco-opcao-frete disabled placeholder" id="opcao-retirada-escola" 
             data-option-id="retirada_escola" 
             onclick="selecionarOpcaoFrete('retirada_escola')"
             title="Selecione produtos para calcular o frete">
            <div class="frete-imagem">
                <i class="fas fa-school" style="font-size: 2rem; color: #6c757d;"></i>
            </div>
            <div class="frete-info">
                <div class="frete-empresa">Retirada na Escola</div>
                <div class="frete-modalidade">Retire no local</div>
                <div class="frete-preco" id="preco-retirada-escola">-</div>
                <div class="frete-prazo">Selecione produtos</div>
            </div>
        </div>
        
        <!-- Placeholder para estado "Calculando" - OCULTO DEFINITIVAMENTE -->
        <div class="bloco-opcao-frete disabled" id="calculating-placeholder" style="display: none !important; visibility: hidden; position: absolute; top: -9999px;">
            <div class="frete-imagem">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #6c757d;"></i>
            </div>
            <div class="frete-info">
                <div class="frete-nome">Calculando fretes...</div>
                <div class="frete-preco">Aguarde</div>
                <div class="frete-prazo">Consultando transportadoras</div>
            </div>
        </div>
    </div>
    
    <!-- Botão Ver Mais Opções FIXO -->
    <div class="ver-mais-opcoes-fixo" id="ver-mais-opcoes-fixo">
        <button class="btn-ver-mais-opcoes-fixo" type="button" id="btn-ver-mais-opcoes-fixo">
            <span class="btn-text">Ver mais opções</span>
            <div class="btn-arrow">
                <i class="fas fa-chevron-down"></i>
            </div>
        </button>
    </div>
    
    <!-- Container para Opções Extras -->
    <div class="opcoes-extras-fixo" id="opcoes-extras-fixo">
        <div class="opcoes-extras-grid" id="opcoes-extras-grid-fixo">
            <!-- Opções extras serão inseridas aqui -->
        </div>
    </div>
</div>

<!-- Campos hidden para dados completos do frete -->
<input id="frete_valor" name="frete_valor" type="hidden" value="0"/>
<input id="frete_opcao" name="frete_opcao" type="hidden" value=""/>
<input id="frete_company" name="frete_company" type="hidden" value=""/>
<input id="frete_service" name="frete_service" type="hidden" value=""/>
<input id="frete_delivery_time" name="frete_delivery_time" type="hidden" value="0"/>
<input id="frete_delivery_range" name="frete_delivery_range" type="hidden" value=""/>
<input id="frete_melhor_envio_id" name="frete_melhor_envio_id" type="hidden" value=""/>

<!-- Campo hidden para ano-projeto selecionado pelo cliente -->
<input id="customer_project_year" name="customer_project_year" type="hidden" value=""/>

<!-- Div de erro para validação de frete (mesmo padrão dos outros campos) -->
<div class="error" id="frete-error" style="display: none; text-align: center; margin-top: 15px; opacity: 0; transition: opacity 0.3s ease;">Selecione uma opção de entrega</div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Seção 6: Carrinho e Resumo -->
<section class="checkout-section">
    <div class="section-container">
        <div style="max-width: 1000px; margin: 0 auto;">
    <!-- Bloco Unificado: Carrinho + Resumo do Pagamento -->
    <div class="quadro-pedido" id="quadro-pedido">
        <!-- Seção do Carrinho -->
        <div class="secao-carrinho" id="secao-carrinho" style="display: none;">
            <div class="secao-titulo">
                <i class="fas fa-shopping-cart"></i>
                Carrinho
            </div>
            <div class="carrinho-items" id="carrinho-items">
                <!-- Itens serão inseridos dinamicamente via JavaScript -->
            </div>
        </div>

        <!-- Divisor -->
        <div class="divisor-secoes" id="divisor-secoes" style="display: none;"></div>

        <!-- Seção do Resumo do Pagamento -->
        <div class="secao-resumo">
            <div class="secao-titulo">
                <i class="fas fa-wallet"></i>
                Resumo do Pagamento
            </div>
            <div class="valor-original" id="valorOriginal">R$ 0,00 <span class="desconto">(-0%)</span></div>
            <div class="valor-pix" id="valorPix">R$ 0,00 no Pix</div>
            <div class="valor-parcela" id="valorCartao">ou até <?php echo $max_parcelas; ?>x de R$ 0,00 sem juros</div>
            <div class="opcoes-pagamento">
            <label class="opcao-pagamento">
                <input type="radio" name="forma_pagamento" value="pix" checked required>
                <i class="fab fa-pix"></i>
                Pix
            </label>
            <label class="opcao-pagamento">
                <input type="radio" name="forma_pagamento" value="cartao">
                <i class="fas fa-credit-card"></i>
                Cartão de Crédito
            </label>
            </div>
        </div>

        <!-- Seção de Cartão de Crédito -->
        <div id="bloco-cartao" style="display: none;">
            <div class="row">
                <div class="col">
                    <label for="nome_cartao">Nome no Cartão</label>
                    <input type="text" id="nome_cartao" name="nome_cartao" placeholder="Nome como está no cartão">
                    <div class="error" id="nome_cartao-error">Digite o nome como está no cartão</div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="numero_cartao">Número do Cartão</label>
                    <input type="text" id="numero_cartao" name="numero_cartao" placeholder="0000 0000 0000 0000">
                    <div class="error" id="numero_cartao-error">Digite um número de cartão válido</div>
                </div>
                <div class="col-small">
                    <label for="validade_cartao">Validade</label>
                    <input type="text" id="validade_cartao" name="validade_cartao" placeholder="MM/AA">
                    <div class="error" id="validade_cartao-error">Digite uma data válida</div>
                </div>
                <div class="col-small">
                    <label for="cvv_cartao">CVV</label>
                    <input type="text" id="cvv_cartao" name="cvv_cartao" placeholder="000">
                    <div class="error" id="cvv_cartao-error">Digite o código de segurança</div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="parcelas">Parcelas</label>
                    <select id="parcelas" name="parcelas">
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- Botão Efetuar Pagamento (fora do container) -->
    <button id="botao-pagar" type="button">
        <i class="fas fa-lock"></i>
        Efetuar Pagamento
    </button>

    <!-- Separador estiloso -->
    <div class="separador-business">
        <div class="linha-separador"></div>
    </div>

    <!-- Botão Coleções Business Education -->
    <div style="text-align: center; margin: 30px 0;">
        <button id="btn-business-education" class="btn-business-education">
            <span class="btn-business-text">Coleções Business Education</span>
            <div class="btn-business-arrow">
                <svg width="29" height="29" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12h8M16 12l-4-4M16 12l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </button>
    </div>
        </div>
        </div>
        
        <!-- Banner do Rodapé (condicionado ao botão) -->
        <div id="banner-rodape-container" class="banner-footer">
            <img alt="Banner Rodapé" src="<?php echo htmlspecialchars($store_config['images']['banner_footer']); ?>" class="banner-image"/>
        </div>
    </div>
</section>

<!-- Scripts necessários - carregados imediatamente após o conteúdo -->
<script src="js/phone-ddi-selector.js"></script>
<script src="js/field-feedback.js"></script>
<script src="js/script.js"></script>
<script src="js/payment.js"></script>
    <script src="js/custom-dropdown.js"></script>
<?php if ($freight_enabled): ?>
<script src="js/frete.js"></script>
<?php endif; ?>
<script>
 // Variáveis de configuração centralizadas (injetadas a partir do PHP)
 window.maxParcelas = <?php echo $max_parcelas; ?>;
 
 // Configurações de imagens da loja
  window.storeImages = {
    logo_primary: "<?php echo htmlspecialchars($store_config['images']['logo_primary']); ?>",
    logo_secondary: "<?php echo htmlspecialchars($store_config['images']['logo_secondary']); ?>",
    banner_top: "<?php echo htmlspecialchars($store_config['images']['banner_top']); ?>",
    banner_top_mobile: "<?php echo htmlspecialchars($store_config['images']['banner_top_mobile']); ?>",
    banner_school: "<?php echo htmlspecialchars($store_config['images']['banner_school']); ?>",
    banner_footer: "<?php echo htmlspecialchars($store_config['images']['banner_footer']); ?>",
    favicon: "<?php echo htmlspecialchars($store_config['images']['favicon']); ?>"
};
 window.produtosConfig = {
    <?php foreach ($produtos as $id => $produto): ?>
    "<?php echo $id; ?>": {
      valorPix: <?php echo $produto['valor_pix']; ?>,
      valorCartao: <?php echo $produto['valor_cartao']; ?>,
      valorOriginal: <?php echo $produto['valor']; ?>,
      dimensions: {
        weight: <?php echo $produto['shipping']['weight'] ?? 0.8; ?>,
        width: <?php echo $produto['shipping']['width'] ?? 21; ?>,
        height: <?php echo $produto['shipping']['height'] ?? 28; ?>,
        length: <?php echo $produto['shipping']['length'] ?? 2; ?>
      }
    },
    <?php endforeach; ?>
 };
 
 // Mapeamento de séries para produtos (do arquivo de configuração)
 window.serieParaProduto = {
    <?php foreach ($store_config_from_file['grade_to_product'] as $serie => $produto_id): ?>
    "<?php echo $serie; ?>": "<?php echo $produto_id; ?>",
    <?php endforeach; ?>
 };
 
 // Dados das galerias de produtos
 window.productGalleriesData = {};
 <?php foreach ($produtos as $id => $produto): ?>
    <?php if (!empty($produto['galeria']) && count($produto['galeria']) > 0): ?>
        window.productGalleriesData['<?php echo $id; ?>'] = {
            images: <?php echo json_encode($produto['galeria']); ?>,
            currentIndex: <?php echo array_search($produto['imagem'], $produto['galeria']) ?: 0; ?>
        };
    <?php endif; ?>
 <?php endforeach; ?>
 
 // Configurações de frete
 <?php if ($freight_enabled): ?>
 window.freteConfig = {
    enabled: <?php echo $freight_enabled ? 'true' : 'false'; ?>,
    basePrice: <?php echo $freight_config['fixed_options']['retirada_escola']['base_price'] ?? 0; ?>,
    additionalFactor: <?php echo $freight_config['fixed_options']['retirada_escola']['additional_factor'] ?? 0; ?>,
    deliveryTime: "<?php echo $freight_config['fixed_options']['retirada_escola']['delivery_time'] ?? 'até 7 dias'; ?>",
    originCep: "<?php echo preg_replace('/[^0-9]/', '', $store_config['company']['address']['postal_code'] ?? '27910110'); ?>",
    // NOVO: Configurações de retirada na escola
    retiradaEscola: {
        enabled: <?php echo ($freight_config['fixed_options']['retirada_escola']['enabled'] ?? true) ? 'true' : 'false'; ?>
    },
    // NOVO: Configurações de limitação de preço
    priceLimit: {
        enabled: <?php echo ($freight_config['melhor_envio']['price_limit']['enabled'] ?? false) ? 'true' : 'false'; ?>,
        limitValue: <?php echo $freight_config['melhor_envio']['price_limit']['limit_value'] ?? 18.90; ?>,
        maxOriginalPrice: <?php echo $freight_config['melhor_envio']['price_limit']['max_original_price'] ?? 26.00; ?>,
        appliesAfterPackaging: <?php echo ($freight_config['melhor_envio']['price_limit']['applies_after_packaging'] ?? true) ? 'true' : 'false'; ?>
    }
 };
 <?php else: ?>
 window.freteConfig = { enabled: false };
 <?php endif; ?>
 
 const quantidadeInputs = document.querySelectorAll('input[name^="quantidade"]');
 const valorPix = document.getElementById('valorPix');
 const valorCartao = document.getElementById('valorCartao');
 const valorOriginal = document.getElementById('valorOriginal');
 const totalInput = document.getElementById('valor_total');
 const totalCartaoInput = document.getElementById('valor_cartao_total');
 const parcelasSelect = document.getElementById('parcelas');

 // Variável global para controlar quando recalcular frete
 let ultimasQuantidades = null;

 // NOVO: Controle do estado do botão de pagamento
 let botaoPagamentoTimeout = null;
 
 /**
  * NOVO: Ativa o estado de loading do botão de pagamento
  */
 function ativarLoadingBotaoPagamento() {
    const botao = document.getElementById('botao-pagar');
    if (botao) {
        botao.classList.add('loading');
        botao.disabled = true;
        botao.style.pointerEvents = 'none';
        console.log('Botão de pagamento: Loading ativado');
    }
 }
 
 /**
  * NOVO: Desativa o estado de loading do botão de pagamento
  */
 function desativarLoadingBotaoPagamento() {
    const botao = document.getElementById('botao-pagar');
    if (botao) {
        botao.classList.remove('loading');
        botao.disabled = false;
        botao.style.pointerEvents = 'auto';
        console.log('Botão de pagamento: Loading desativado');
    }
 }
 
 /**
  * NOVO: Programa a desativação do loading após um delay
  */
 function programarDesativacaoLoading(delay = 1000) {
    // Limpa timeout anterior se existir
    if (botaoPagamentoTimeout) {
        clearTimeout(botaoPagamentoTimeout);
    }
    
    // Programa nova desativação
    botaoPagamentoTimeout = setTimeout(() => {
        desativarLoadingBotaoPagamento();
        botaoPagamentoTimeout = null;
    }, delay);
 }

 /**
  * Função para selecionar ano-projeto
  */
 function selecionarAnoProjeto(ano) {
    // Remove seleção anterior
    document.querySelectorAll('.project-year-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    const opcaoSelecionada = document.getElementById(`project-year-${ano}`);
    if (opcaoSelecionada) {
        opcaoSelecionada.classList.add('selected');
    }
    
    // Atualiza campo hidden
    const campoHidden = document.getElementById('customer_project_year');
    if (campoHidden) {
        campoHidden.value = ano;
    }
    
    // Controla exibição do aviso 2026
    const aviso2026 = document.getElementById('warning-2026');
    if (aviso2026) {
        if (ano === '2026') {
            aviso2026.style.display = 'block';
            // Scroll suave para o aviso
            setTimeout(() => {
                aviso2026.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 200);
        } else {
            aviso2026.style.display = 'none';
        }
    }
    
    console.log('Ano letivo selecionado:', ano);
 }
 
 // Ano letivo é obrigatório - sem seleção padrão
 // O cliente deve escolher obrigatoriamente entre 2025 ou 2026

 // Função para resetar seleção de ano letivo
 function resetarSelecaoAnoLetivo() {
     // Remove seleção de todas as opções
     document.querySelectorAll('.project-year-option').forEach(option => {
         option.classList.remove('selected');
     });
     
     // Limpa campo hidden
     const campoHidden = document.getElementById('customer_project_year');
     if (campoHidden) {
         campoHidden.value = '';
     }
     
     // Esconde aviso 2026
     const aviso2026 = document.getElementById('warning-2026');
     if (aviso2026) {
         aviso2026.style.display = 'none';
     }
     
     console.log('Seleção de ano letivo resetada');
 }

 function atualizarTotais(evitarRecalculoFrete = false) {
    // NOVO: Ativa loading do botão de pagamento no início da atualização
    ativarLoadingBotaoPagamento();
    
    let totalPix = 0;
    let totalCartao = 0;
    let totalOriginal = 0;
    
    // Percorre todos os inputs de quantidade
    const quantidadesAtuais = {};
    quantidadeInputs.forEach(input => {
      const quantidade = parseInt(input.value);
      const produtoId = input.name.match(/quantidade\[(.*?)\]/)[1];
      quantidadesAtuais[produtoId] = quantidade;
      
      if (quantidade > 0) {
        if (window.produtosConfig && window.produtosConfig[produtoId]) {
          totalPix += quantidade * window.produtosConfig[produtoId].valorPix;
          totalCartao += quantidade * window.produtosConfig[produtoId].valorCartao;
          totalOriginal += quantidade * window.produtosConfig[produtoId].valorOriginal;
        }
      }
    });

    // CORRIGIDO: Adiciona valor do frete se houver
    let valorFrete = 0;
    if (typeof getValorFreteAtual === 'function') {
        valorFrete = getValorFreteAtual();
    } else {
        // Fallback: lê diretamente do campo hidden
        const freteInput = document.getElementById('frete_valor');
        if (freteInput) {
            valorFrete = parseFloat(freteInput.value) || 0;
        }
    }
    
    // NOVO: Aplica desconto do cupom CORRIGIDO - CÁLCULO DUAL
    let descontoCupom = { pix: 0, cartao: 0 };
    let cupomAplicaFrete = false;
    
    if (window.couponManager && window.couponManager.isApplied) {
        // Notifica o CouponManager sobre mudança dos valores para reaplicação
        window.couponManager.onOrderValuesChange();
        descontoCupom = window.couponManager.calculateCurrentDiscount();
        cupomAplicaFrete = window.couponManager.currentCoupon?.appliesToShipping || false;
        
        console.log('Desconto do cupom CORRIGIDO:', {
            descontoPix: descontoCupom.pix,
            descontoCartao: descontoCupom.cartao,
            aplicaFrete: cupomAplicaFrete
        });
        
        // Se o cupom NÃO aplica ao frete, desconta apenas dos produtos
        if (!cupomAplicaFrete) {
            totalPix = Math.max(0, totalPix - descontoCupom.pix);
            totalCartao = Math.max(0, totalCartao - descontoCupom.cartao);
        }
    }
    
    // Adiciona frete
    totalPix += valorFrete;
    totalCartao += valorFrete;
    totalOriginal += valorFrete;
    
    // Se o cupom APLICA ao frete, desconta do total (produtos + frete)
    if (window.couponManager && window.couponManager.isApplied && cupomAplicaFrete) {
        totalPix = Math.max(0, totalPix - descontoCupom.pix);
        totalCartao = Math.max(0, totalCartao - descontoCupom.cartao);
    }

    const maxParcelas = window.maxParcelas || <?php echo $max_parcelas; ?>;
    const parcelaCartao = totalCartao / maxParcelas;

    const desconto = totalOriginal > 0 ? ((totalOriginal - totalPix) / totalOriginal) * 100 : 0;

    valorPix.textContent = "R$ " + totalPix.toFixed(2).replace('.', ',') + " no Pix";
    valorCartao.textContent = `ou até ${maxParcelas}x de R$ ${parcelaCartao.toFixed(2).replace('.', ',')} sem juros`;
    valorOriginal.innerHTML = "R$ " + totalOriginal.toFixed(2).replace('.', ',') + " <span class='desconto' style='color: #ffd129;'>(-" + desconto.toFixed(2) + "%)</span>";
    
    // Atualiza os campos de valor total (pix e cartão)
    totalInput.value = totalPix.toFixed(2);
    totalCartaoInput.value = totalCartao.toFixed(2);
    
    // Atualiza o select de parcelas
    atualizarSelectParcelas(totalCartao);
    
    // Só recalcula opções de frete se as quantidades dos produtos mudaram
    if (!evitarRecalculoFrete) {
        const quantidadesMudaram = !ultimasQuantidades || 
            JSON.stringify(quantidadesAtuais) !== JSON.stringify(ultimasQuantidades);
        
        if (quantidadesMudaram) {
            console.log('Quantidades mudaram, recalculando opções de frete...');
            ultimasQuantidades = {...quantidadesAtuais};
            
            if (typeof atualizarOpcoesFreteDisponiveis === 'function') {
                atualizarOpcoesFreteDisponiveis();
                // NOVO: Programa desativação do loading após recálculo de frete (delay maior)
                programarDesativacaoLoading(1500);
            } else {
                // NOVO: Desativa loading imediatamente se não há recálculo de frete
                programarDesativacaoLoading(500);
            }
        } else {
            console.log('Quantidades não mudaram, mantendo opções de frete atuais');
            // NOVO: Desativa loading rapidamente se não há mudanças
            programarDesativacaoLoading(300);
        }
    } else {
        // NOVO: Desativa loading rapidamente para atualizações simples (sem recálculo de frete)
        programarDesativacaoLoading(200);
    }
 }

 // Função para selecionar quantidade através dos botões
 function selecionarQuantidade(botao) {
    // NOVO: Ativa loading do botão de pagamento
    ativarLoadingBotaoPagamento();
    
    const produtoId = botao.getAttribute('data-produto');
    const valor = botao.getAttribute('data-value');
    const input = document.getElementById(`quantidade-input-${produtoId}`);
    
    // Verifica se o botão já está ativo
    const isActive = botao.classList.contains('active');
    
    // Remove a classe 'active' de todos os botões do mesmo produto
    const botoesProduto = document.querySelectorAll(`.btn-quantidade[data-produto="${produtoId}"]`);
    botoesProduto.forEach(b => b.classList.remove('active'));
    
    // Se o botão já estava ativo, desativa-o (valor 0), senão ativa-o com o valor do botão
    if (isActive) {
        // Botão estava ativo, então vamos desativá-lo (valor 0)
        input.value = '0';
    } else {
        // Botão estava inativo, então vamos ativá-lo com seu valor
        input.value = valor;
        // Adiciona a classe 'active' apenas ao botão selecionado
        botao.classList.add('active');
    }
    
    // Atualiza os totais e o carrinho
    atualizarTotais();
    atualizarCarrinho();
 }
 
 // Função para atualizar o select de parcelas com os valores
function atualizarSelectParcelas(valorTotal) {
   // Limpa o select
   parcelasSelect.innerHTML = '';
   
   // Formata valores usando toLocaleString
   const formatarMoeda = (valor) => {
     return valor.toLocaleString('pt-BR', {
       style: 'currency',
       currency: 'BRL',
       minimumFractionDigits: 2,
       maximumFractionDigits: 2
     });
   };
   
   // Adiciona as opções de parcelas
   const maxParcelas = window.maxParcelas || <?php echo $max_parcelas; ?>;
   for (let i = 1; i <= maxParcelas; i++) {
     const valorParcela = valorTotal / i;
     const option = document.createElement('option');
     option.value = i;
     option.textContent = `${i}x de ${formatarMoeda(valorParcela)} sem juros - Total: ${formatarMoeda(valorTotal)}`;
     parcelasSelect.appendChild(option);
   }
   
   // CORREÇÃO CRÍTICA: Atualizar também o dropdown customizado se existir
   const dropdownContainer = document.getElementById('parcelas-dropdown');
   if (dropdownContainer) {
     const dropdownOptions = dropdownContainer.querySelector('.dropdown-options');
     if (dropdownOptions) {
       // Limpar opções do dropdown customizado
       dropdownOptions.innerHTML = '';
       
       // Recriar opções no dropdown customizado
       for (let i = 1; i <= maxParcelas; i++) {
         const valorParcela = valorTotal / i;
         const dropdownOption = document.createElement('div');
         dropdownOption.className = 'dropdown-option';
         dropdownOption.textContent = `${i}x de ${formatarMoeda(valorParcela)} sem juros - Total: ${formatarMoeda(valorTotal)}`;
         dropdownOption.dataset.value = i;
         
         // Adicionar evento de clique
         dropdownOption.addEventListener('click', function() {
           // Atualizar select original
           parcelasSelect.value = i;
           
           // Disparar evento change
           const event = new Event('change', { bubbles: true });
           parcelasSelect.dispatchEvent(event);
           
           // Atualizar texto exibido no dropdown
           const selectedText = dropdownContainer.querySelector('.selected-text');
           if (selectedText) {
             selectedText.textContent = dropdownOption.textContent;
             selectedText.classList.remove('placeholder');
           }
           
           // Atualizar opção selecionada visualmente
           dropdownOptions.querySelectorAll('.dropdown-option').forEach(opt => {
             opt.classList.remove('selected');
           });
           dropdownOption.classList.add('selected');
           
           // Fechar dropdown
           dropdownContainer.querySelector('.dropdown-selected').classList.remove('active');
           dropdownOptions.classList.remove('show');
         });
         
         // Selecionar primeira opção por padrão
         if (i === 1) {
           dropdownOption.classList.add('selected');
           const selectedText = dropdownContainer.querySelector('.selected-text');
           if (selectedText) {
             selectedText.textContent = dropdownOption.textContent;
             selectedText.classList.remove('placeholder');
           }
         }
         
         dropdownOptions.appendChild(dropdownOption);
       }
       
       // Definir primeira parcela como selecionada no select original
       parcelasSelect.value = '1';
     }
   }
}

 // Função para alterar quantidade no carrinho
 function alterarQuantidadeCarrinho(produtoId, novaQuantidade) {
    const input = document.getElementById(`quantidade-input-${produtoId}`);
    const botoesProduto = document.querySelectorAll(`.btn-quantidade[data-produto="${produtoId}"]`);
    
         if (input) {
         // NOVO: Ativa loading do botão de pagamento
         ativarLoadingBotaoPagamento();
         
         // Atualiza o input hidden (permite 0 para remoção)
         input.value = Math.max(0, novaQuantidade);
         
         // Atualiza os botões na seção de produtos
         botoesProduto.forEach(b => b.classList.remove('active'));
         
         if (novaQuantidade > 0 && novaQuantidade <= 4) {
             const botaoCorrespondente = document.querySelector(`.btn-quantidade[data-produto="${produtoId}"][data-value="${novaQuantidade}"]`);
             if (botaoCorrespondente) {
                 botaoCorrespondente.classList.add('active');
             }
         }
        
        // Atualiza totais e carrinho
        atualizarTotais();
        atualizarCarrinho();
    }
 }

 // Função para obter filhos vinculados a um produto
 function obterFilhosVinculados(produtoId) {
    const filhosVinculados = [];
    
    // Busca a série/grade do produto usando o mapeamento reverso
    let gradeProduto = null;
    
    // Primeiro, tenta buscar no DOM
    const produtoElement = document.querySelector(`button[data-produto="${produtoId}"]`);
    if (produtoElement) {
      const produtoContainer = produtoElement.closest('.produto');
      if (produtoContainer) {
        const gradeElement = produtoContainer.querySelector('.produto-grade');
        if (gradeElement) {
          gradeProduto = gradeElement.textContent.trim();
        }
      }
    }
    
    // Se não encontrou no DOM, usa o mapeamento reverso
    if (!gradeProduto && window.serieParaProduto) {
      for (const [serie, produto] of Object.entries(window.serieParaProduto)) {
        if (produto === produtoId) {
          gradeProduto = serie;
          break;
        }
      }
    }
    
    // Se encontrou a grade, busca filhos com essa série
    if (gradeProduto) {
      const qtdFilhos = parseInt(document.getElementById('qtd_filhos')?.value || '0');
      
      for (let i = 1; i <= qtdFilhos; i++) {
        const nomeFilho = document.getElementById(`nome_filho_${i}`)?.value || '';
        const serieFilho = document.getElementById(`serie_filho_${i}`)?.value || '';
        
        if (nomeFilho && serieFilho === gradeProduto) {
          filhosVinculados.push(nomeFilho);
        }
      }
    }
    
    return filhosVinculados;
 }

 // Função para atualizar o carrinho
 function atualizarCarrinho() {
    const quantidadeInputs = document.querySelectorAll('input[name^="quantidade"]');
    const secaoCarrinho = document.getElementById('secao-carrinho');
    const divisorSecoes = document.getElementById('divisor-secoes');
    const carrinhoItems = document.getElementById('carrinho-items');
    
    if (!secaoCarrinho || !carrinhoItems) return;
    
    // Limpa o carrinho
    carrinhoItems.innerHTML = '';
    
    let temItens = false;
    
    // Adiciona produtos selecionados
    quantidadeInputs.forEach(input => {
      const quantidade = parseInt(input.value);
      if (quantidade > 0) {
        const produtoId = input.name.match(/quantidade\[(.*?)\]/)[1];
        
        if (window.produtosConfig && window.produtosConfig[produtoId]) {
          const produto = window.produtosConfig[produtoId];
          
                     // Busca o nome e imagem do produto no DOM
           const produtoElement = document.querySelector(`button[data-produto="${produtoId}"]`);
           let produtoNome = 'Produto';
           let produtoImagem = '';
           
           if (produtoElement) {
             const produtoContainer = produtoElement.closest('.produto');
             if (produtoContainer) {
               const nomeElement = produtoContainer.querySelector('.produto-nome');
               const imagemElement = produtoContainer.querySelector('.main-product-image.active');
               
               if (nomeElement) produtoNome = nomeElement.textContent.trim();
               if (imagemElement) produtoImagem = imagemElement.src;
             }
           }
          
          // Determina o preço baseado na forma de pagamento selecionada
          const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked');
          const valorUnitario = (formaPagamento && formaPagamento.value === 'cartao') ? produto.valorCartao : produto.valorPix;
          const valorTotal = valorUnitario * quantidade;
          
          // Calcula preços originais para mostrar riscados
          const valorOriginalUnitario = produto.valorOriginal;
          const valorOriginalTotal = valorOriginalUnitario * quantidade;
          
          // Busca filhos vinculados a este produto
          const filhosVinculados = obterFilhosVinculados(produtoId);
          
          const filhosHtml = filhosVinculados.length > 0 
            ? `<div class="carrinho-filhos-vinculados">
                 <i class="fas fa-user-graduate" style="color: #ffd129; margin-right: 5px;"></i>
                 <span style="color: #ffd129; font-size: 0.9em; font-weight: 500;">
                   ${filhosVinculados.join(', ')}
                 </span>
               </div>` 
            : '';
          
          const itemHtml = `
            <div class="carrinho-item" data-produto-id="${produtoId}">
              <div class="carrinho-item-imagem">
                <img src="${produtoImagem}" alt="${produtoNome}">
              </div>
              <div class="carrinho-item-info">
                <div class="carrinho-item-nome">${produtoNome}</div>
                ${filhosHtml}
                <div class="carrinho-item-detalhes">
                  <div class="carrinho-valor-unitario">
                    <span class="valor-original-riscado">R$ ${valorOriginalUnitario.toFixed(2).replace('.', ',')}</span>
                    <span class="carrinho-valor-unit">R$ ${valorUnitario.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div class="carrinho-item-controles">
                  <button class="carrinho-btn-qtd" onclick="alterarQuantidadeCarrinho('${produtoId}', ${quantidade - 1})" ${quantidade <= 0 ? 'disabled' : ''}>-</button>
                  <span class="carrinho-qtd-display">${quantidade}</span>
                  <button class="carrinho-btn-qtd" onclick="alterarQuantidadeCarrinho('${produtoId}', ${quantidade + 1})" ${quantidade >= 4 ? 'disabled' : ''}>+</button>
                </div>
              </div>
              <div class="carrinho-item-preco">
                <div class="carrinho-precos-totais">
                  <span class="valor-original-total-riscado">R$ ${valorOriginalTotal.toFixed(2).replace('.', ',')}</span>
                  <span class="valor-final-total">R$ ${valorTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          `;
          
          carrinhoItems.innerHTML += itemHtml;
          temItens = true;
        }
      }
    });
    
    // Verifica se há cupom aplicado e se NÃO aplica ao frete
    // Se sim, adiciona a linha do cupom ANTES do frete
    let cupomHtml = '';
    let cupomAplicado = false;
    
    if (window.couponManager && window.couponManager.isApplied) {
      const descontoCupom = window.couponManager.calculateCurrentDiscount();
      const cupomAplicaFrete = window.couponManager.currentCoupon?.appliesToShipping || false;
      const cupomCodigo = window.couponManager.currentCoupon?.code || 'CUPOM';
      
      // Determina o valor do desconto baseado na forma de pagamento
      const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked');
      const valorDesconto = (formaPagamento && formaPagamento.value === 'cartao') 
        ? descontoCupom.cartao 
        : descontoCupom.pix;
      
      // Se o cupom NÃO aplica ao frete, adiciona a linha ANTES do frete
      if (!cupomAplicaFrete && valorDesconto > 0) {
        cupomHtml = `
          <div class="carrinho-item cupom">
            <div class="carrinho-item-imagem">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div class="carrinho-item-info">
              <div class="carrinho-item-nome">Cupom ${cupomCodigo}</div>
              <div class="carrinho-item-detalhes">
                <div class="desconto-badge">
                  <i class="fas fa-tag"></i>
                  Desconto Aplicado
                </div>
              </div>
            </div>
            <div class="carrinho-item-preco">
              - R$ ${valorDesconto.toFixed(2).replace('.', ',')}
            </div>
          </div>
        `;
        
        carrinhoItems.innerHTML += cupomHtml;
        cupomAplicado = true;
        temItens = true;
      }
    }
    
    // Adiciona frete se selecionado
    const freteOpcao = document.getElementById('frete_opcao');
    const freteValor = document.getElementById('frete_valor');
    
    if (freteOpcao && freteValor && freteOpcao.value) {
      let freteNome = 'Frete';
      let freteDetalhes = '';
      let freteIcone = 'fas fa-truck';
      
      // Busca informações do frete selecionado
      const freteCompany = document.getElementById('frete_company');
      const freteService = document.getElementById('frete_service');
      const freteNomeCompleto = document.getElementById('frete_nome_completo');
      const freteDeliveryRange = document.getElementById('frete_delivery_range');
      
      if (freteOpcao.value === 'retirada_escola') {
        freteNome = 'Retirada na Escola';
        freteIcone = 'fas fa-school';
        // Para retirada na escola, usa o prazo do campo frete_delivery_range
        if (freteDeliveryRange && freteDeliveryRange.value) {
          freteDetalhes = freteDeliveryRange.value;
        } else {
          freteDetalhes = 'Sem custo adicional';
        }
      } else {
        // Prioridade 1: Usar nome completo se disponível (evita duplicação)
        if (freteNomeCompleto && freteNomeCompleto.value) {
          freteNome = freteNomeCompleto.value;
        } else if (freteCompany && freteCompany.value && freteService && freteService.value) {
          // Fallback: construir nome se não tiver nome completo
          freteNome = `${freteCompany.value} - ${freteService.value}`;
        } else if (freteCompany && freteCompany.value) {
          freteNome = freteCompany.value;
        }
        
        if (freteDeliveryRange && freteDeliveryRange.value) {
          freteDetalhes = freteDeliveryRange.value;
        }
      }
      
      const valorFreteNum = parseFloat(freteValor.value) || 0;
      const freteItemHtml = `
        <div class="carrinho-item frete">
          <div class="carrinho-item-imagem">
            <i class="${freteIcone}"></i>
          </div>
          <div class="carrinho-item-info">
            <div class="carrinho-item-nome">${freteNome}</div>
            <div class="carrinho-item-detalhes">
              <span>${freteDetalhes}</span>
            </div>
          </div>
          <div class="carrinho-item-preco">
            ${valorFreteNum > 0 ? 'R$ ' + valorFreteNum.toFixed(2).replace('.', ',') : 'Grátis'}
          </div>
        </div>
      `;
      
      carrinhoItems.innerHTML += freteItemHtml;
      temItens = true;
    }
    
    // Verifica se há cupom aplicado e se APLICA ao frete
    // Se sim, adiciona a linha do cupom DEPOIS do frete
    if (window.couponManager && window.couponManager.isApplied && !cupomAplicado) {
      const descontoCupom = window.couponManager.calculateCurrentDiscount();
      const cupomAplicaFrete = window.couponManager.currentCoupon?.appliesToShipping || false;
      const cupomCodigo = window.couponManager.currentCoupon?.code || 'CUPOM';
      
      // Determina o valor do desconto baseado na forma de pagamento
      const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked');
      const valorDesconto = (formaPagamento && formaPagamento.value === 'cartao') 
        ? descontoCupom.cartao 
        : descontoCupom.pix;
      
      // Se o cupom APLICA ao frete, adiciona a linha DEPOIS do frete
      if (cupomAplicaFrete && valorDesconto > 0) {
        cupomHtml = `
          <div class="carrinho-item cupom">
            <div class="carrinho-item-imagem">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div class="carrinho-item-info">
              <div class="carrinho-item-nome">Cupom ${cupomCodigo}</div>
              <div class="carrinho-item-detalhes">
                <div class="desconto-badge">
                  <i class="fas fa-tag"></i>
                  Desconto sobre Total + Frete
                </div>
              </div>
            </div>
            <div class="carrinho-item-preco">
              - R$ ${valorDesconto.toFixed(2).replace('.', ',')}
            </div>
          </div>
        `;
        
        carrinhoItems.innerHTML += cupomHtml;
        temItens = true;
      }
    }
    
    // Mostra ou esconde as seções do carrinho
    if (temItens) {
      secaoCarrinho.style.display = 'block';
      if (divisorSecoes) divisorSecoes.style.display = 'block';
    } else {
      secaoCarrinho.style.display = 'none';
      if (divisorSecoes) divisorSecoes.style.display = 'none';
    }
 }

 // Tornar a função disponível globalmente para integração com cupons
 window.atualizarCarrinho = atualizarCarrinho;

 // Adiciona listener para o método de pagamento
 document.querySelectorAll('input[name="forma_pagamento"]').forEach(radio => {
    radio.addEventListener('change', function() {
      // NOVO: Ativa loading do botão de pagamento
      ativarLoadingBotaoPagamento();
      
      if (this.value === 'cartao') {
        // Mostra o bloco de cartão
        document.getElementById('bloco-cartao').style.display = 'block';
      } else {
        // Esconde o bloco de cartão
        document.getElementById('bloco-cartao').style.display = 'none';
      }
      
      // Atualiza estilos dos botões de pagamento (fallback para :has())
      document.querySelectorAll('.opcao-pagamento').forEach(opcao => {
        opcao.classList.remove('selected');
      });
      this.closest('.opcao-pagamento').classList.add('selected');
      
      // Atualiza os valores totais e o carrinho quando mudar a forma de pagamento
      atualizarTotais();
      atualizarCarrinho();
    });
 });
  
// Inicializa os valores quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o select de parcelas e o carrinho
    atualizarTotais();
    atualizarCarrinho();
    
    // Inicializa estilo do botão de pagamento selecionado
    const formaPagamentoSelecionada = document.querySelector('input[name="forma_pagamento"]:checked');
    if (formaPagamentoSelecionada) {
      formaPagamentoSelecionada.closest('.opcao-pagamento').classList.add('selected');
      formaPagamentoSelecionada.dispatchEvent(new Event('change'));
    }
    
    // NÃO inicializa typewriter aqui - será iniciado quando cada slide aparecer
    
 });
 
 // Função para inicializar o efeito de digitação de um slide específico
 function initTypewriterEffect(slideElement, callback) {
    const typewriterLines = slideElement.querySelectorAll('.typewriter-line[data-text]');
    if (typewriterLines.length === 0) {
        if (callback) callback();
        return;
    }
    
    let currentLineIndex = 0;
    
    function typeNextLine() {
        if (currentLineIndex >= typewriterLines.length) {
            // Animação completa - chama callback
            if (callback) {
                setTimeout(callback, 1000); // 1s de pausa antes de trocar
            }
            return;
        }
        
        const currentLine = typewriterLines[currentLineIndex];
        const text = currentLine.getAttribute('data-text');
        
        if (text) {
            // Cria estrutura: spacer invisível (reserva espaço) + texto visível
            currentLine.textContent = ''; // Limpa o conteúdo inicial
            
            // Spacer invisível que reserva o espaço do texto completo
            const spacer = document.createElement('span');
            spacer.className = 'text-spacer';
            spacer.textContent = text;
            currentLine.appendChild(spacer);
            
            // Container para texto visível
            const visibleText = document.createElement('span');
            visibleText.className = 'text-visible';
            currentLine.appendChild(visibleText);
            
            let charIndex = 0;
            
            function typeChar() {
                if (charIndex < text.length) {
                    // Remove cursor anterior se existir
                    const existingCursor = visibleText.querySelector('.typing-cursor');
                    if (existingCursor) {
                        existingCursor.remove();
                    }
                    
                    // Adiciona o próximo caractere ao texto visível
                    const textNode = document.createTextNode(text.charAt(charIndex));
                    visibleText.appendChild(textNode);
                    
                    // Adiciona cursor após o caractere
                    const cursor = document.createElement('span');
                    cursor.className = 'typing-cursor';
                    cursor.innerHTML = '&nbsp;';
                    
                    // Define cor do cursor baseado nas classes da linha
                    if (currentLine.classList.contains('entrepreneur-highlight') || currentLine.classList.contains('video-highlight')) {
                        // Linhas com destaque laranja
                        cursor.style.backgroundColor = '#FF662B';
                    } else {
                        // Padrão: branco
                        cursor.style.backgroundColor = 'white';
                    }
                    
                    visibleText.appendChild(cursor);
                    
                    charIndex++;
                    setTimeout(typeChar, 60); // Velocidade de digitação mais rápida (era 120)
                } else {
                    // Remove cursor da linha atual
                    const cursor = visibleText.querySelector('.typing-cursor');
                    if (cursor) {
                        cursor.remove();
                    }
                    
                    // Passa para a próxima linha
                    currentLineIndex++;
                    setTimeout(typeNextLine, 200); // Pausa entre linhas (era 300)
                }
            }
            
            typeChar();
        }
    }
    
    // Inicia a animação após um pequeno delay
    setTimeout(typeNextLine, 300); // Reduzido de 500
 }

// Event listener para botão limpar dados
document.getElementById('btnLimparDados').addEventListener('click', function() {
    if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
        // Limpa todos os campos do formulário
        const form = document.getElementById('form-pagamento');
        if (form) {
            form.reset();
        }
        
        // CORREÇÃO: Resetar dropdowns customizados (incluindo Quantidade de Filhos)
        if (typeof resetAllCustomDropdowns === 'function') {
            resetAllCustomDropdowns();
        }
        
        // CORREÇÃO: Resetar seleção de ano letivo (2025/2026)
        if (typeof resetarSelecaoAnoLetivo === 'function') {
            resetarSelecaoAnoLetivo();
        }
        
        // Limpa campos dinâmicos (filhos)
        const camposFilhos = document.getElementById('campos-filhos');
        if (camposFilhos) {
            camposFilhos.innerHTML = '<h3 style="text-align: left; margin-bottom: 20px;">Dados dos Filhos</h3>';
        }
        // Limpa localStorage
        localStorage.removeItem('formData');
        // Atualiza totais se necessário
        if (typeof atualizarTotais === 'function') atualizarTotais();
        // Reseta feedback visual dos campos
        if (window.FieldFeedback && typeof window.FieldFeedback.reset === 'function') {
            window.FieldFeedback.reset();
        }
        // Feedback visual
        alert('Dados do formulário limpos com sucesso!');
    }
});

 // Funcionalidade do botão Business Education
 document.getElementById('btn-business-education').addEventListener('click', function() {
     const bannerContainer = document.getElementById('banner-rodape-container');
     const isActive = this.classList.contains('active');
     
     if (isActive) {
         // Desativa o botão e esconde o banner
         this.classList.remove('active');
         bannerContainer.classList.remove('show');
         setTimeout(() => {
             bannerContainer.style.display = 'none';
         }, 500);
     } else {
         // Ativa o botão e mostra o banner
         this.classList.add('active');
         bannerContainer.style.display = 'block';
         setTimeout(() => {
             bannerContainer.classList.add('show');
         }, 10);
     }
 });

 // Função para atualizar opções de frete quando quantidades mudam
 function atualizarOpcoesFreteDisponiveis() {
    if (window.freteManager && typeof window.freteManager.onProductQuantityChange === 'function') {
        console.log('Atualizando opções de frete após mudança de quantidade...');
        window.freteManager.onProductQuantityChange();
    }
 }

 // NOVO: Event listener para mudanças no frete (sem recalcular opções)
 document.addEventListener('freteChanged', function(event) {
    console.log('Frete alterado:', event.detail);
    
    // NOVO: Ativa loading do botão durante mudança de frete
    ativarLoadingBotaoPagamento();
    
    // Atualiza totais SEM recalcular opções de frete (evita loop)
    atualizarTotais(true);
    
    // Atualiza o carrinho após um pequeno delay para garantir que os valores estejam atualizados
    setTimeout(() => {
        atualizarCarrinho();
    }, 100);
 });

 // Event listener para mudanças nos dados dos filhos (atualiza carrinho)
 document.addEventListener('change', function(event) {
    if (event.target.id && (event.target.id.startsWith('nome_filho_') || event.target.id.startsWith('serie_filho_'))) {
        console.log('Dados dos filhos alterados, atualizando carrinho...');
        setTimeout(() => {
            atualizarCarrinho();
        }, 100);
    }
 });
</script>

<!-- Modal de Pedido Automático -->
<div id="modal-pedido-automatico" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <svg class="modal-icon" viewBox="0 0 1233 865" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(0,865) scale(0.1,-0.1)" fill="#FF662B" stroke="none">
                    <path d="M6906 8388 c-44 -84 -127 -245 -186 -358 -257 -493 -466 -896 -472 -912 -6 -15 2 -20 45 -32 60 -17 251 -69 1692 -461 578 -158 1165 -318 1305 -356 140 -39 314 -86 385 -105 72 -20 202 -55 290 -79 88 -25 277 -76 420 -115 143 -39 267 -73 277 -76 13 -4 43 48 149 253 214 418 476 927 556 1081 41 79 72 146 69 149 -2 3 -218 60 -478 128 -855 223 -1854 484 -2228 582 -74 19 -304 79 -510 133 -206 54 -567 148 -802 209 -234 61 -428 111 -430 111 -2 0 -39 -69 -82 -152z"/>
                    <path d="M4370 8315 c-448 -119 -1408 -372 -2675 -706 -418 -111 -843 -223 -945 -250 -102 -27 -249 -66 -327 -86 -79 -20 -143 -39 -143 -42 0 -3 296 -302 658 -664 l658 -658 270 71 c148 39 343 91 434 115 91 24 311 83 490 130 179 48 433 115 565 150 228 60 634 168 1440 381 198 53 419 111 490 130 130 34 223 59 579 154 104 27 192 52 194 55 3 3 -12 24 -34 48 -324 341 -679 714 -759 797 -55 58 -146 152 -200 210 -55 58 -138 144 -185 191 l-85 86 -425 -112z"/>
                    <path d="M5765 6910 c-181 -48 -469 -125 -640 -170 -170 -45 -488 -129 -705 -186 -217 -58 -546 -145 -730 -194 -184 -49 -567 -150 -850 -225 -283 -75 -537 -142 -565 -150 -27 -8 -147 -39 -265 -70 -192 -51 -263 -75 -220 -75 8 0 75 -20 150 -44 74 -24 221 -71 325 -104 168 -54 696 -222 3205 -1023 343 -110 630 -197 637 -195 10 4 12 255 13 1225 0 1133 -2 1302 -19 1300 -3 0 -154 -40 -336 -89z"/>
                    <path d="M6220 5736 c0 -908 3 -1266 11 -1266 10 0 465 143 1179 370 124 40 259 82 300 95 41 13 269 85 505 160 237 75 471 150 520 165 121 38 200 62 995 315 377 119 707 224 734 232 27 8 45 18 40 22 -5 5 -616 173 -1359 375 -2128 580 -2889 787 -2907 792 -17 5 -18 -60 -18 -1260z"/>
                    <path d="M1430 5682 c-86 -64 -398 -297 -693 -517 -329 -244 -532 -402 -525 -406 7 -4 121 -41 253 -84 244 -78 1127 -362 2455 -790 1999 -644 1911 -616 1928 -603 71 58 1212 1082 1212 1088 0 3 -26 14 -57 24 -32 10 -175 55 -318 101 -143 46 -735 235 -1315 420 -580 185 -1441 460 -1913 611 -472 151 -861 274 -865 273 -4 0 -77 -53 -162 -117z"/>
                    <path d="M10325 5659 c-187 -60 -410 -132 -495 -158 -85 -27 -463 -147 -840 -266 -1258 -398 -1686 -534 -2197 -695 -279 -89 -509 -163 -511 -165 -10 -9 -48 25 1036 -943 l183 -164 202 65 c202 65 826 266 1417 457 173 56 362 117 420 135 58 18 400 129 760 245 360 116 916 294 1235 397 319 102 583 189 588 192 6 6 -748 542 -1354 965 -37 25 -75 46 -85 45 -11 -1 -172 -50 -359 -110z"/>
                    <path d="M5490 3719 c-338 -303 -620 -553 -627 -556 -6 -2 -242 70 -525 160 -282 91 -850 274 -1263 407 -1292 416 -1430 460 -1438 460 -4 0 -6 -586 -5 -1302 l3 -1303 630 -208 c807 -267 1208 -399 3400 -1120 242 -80 443 -143 448 -140 4 2 7 938 7 2079 0 1141 -3 2074 -7 2074 -5 0 -285 -248 -623 -551z"/>
                    <path d="M6220 2192 l0 -2080 133 43 c72 24 344 113 602 198 259 85 641 211 850 280 954 314 2090 688 2395 789 184 61 373 122 419 137 l83 25 -7 651 c-18 1701 -22 1935 -27 1940 -6 6 -172 -47 -2138 -681 -558 -180 -1025 -329 -1036 -331 -17 -4 -57 27 -176 134 -399 359 -1072 959 -1084 966 -12 7 -14 -310 -14 -2071z"/>
                </g>
            </svg>
            <h3>Pedido Automático</h3>
        </div>
        <div class="modal-body">
            <p>Ao inserir a série dos seus filhos, selecionamos automaticamente os produtos certos para eles.</p>
        </div>
        <div class="modal-footer">
            <button id="btn-modal-entendi" class="btn-modal-entendi">
                <i class="fas fa-check"></i>
                Ok. Entendi!
            </button>
        </div>
    </div>
</div>

<!-- Menu flutuante -->
<div class="menu-flutuante-container">
    <button id="btn-menu-flutuante" class="btn-menu-flutuante" title="Menu">
        <i class="fas fa-bars"></i>
    </button>
    <div class="menu-flutuante-opcoes">
        <a href="#" class="menu-opcao carrinho" id="btn-flutuante-carrinho" title="Carrinho">
            <span>Carrinho</span>
            <i class="fas fa-shopping-cart"></i>
        </a>
        <a href="ajuda/index" class="menu-opcao ajuda" title="Ajuda">
            <span>Ajuda</span>
            <i class="fas fa-headset"></i>
        </a>
        <a href="faq/index" class="menu-opcao faq" title="FAQ">
            <span>FAQ</span>
            <i class="fas fa-question-circle"></i>
        </a>
        <a href="pedidos/meus-pedidos" class="menu-opcao pedidos pedidos-destaque" title="Meus Pedidos">
            <span>Meus Pedidos</span>
            <i class="fas fa-box"></i>
        </a>
        <a href="https://wa.me/551142102216" target="_blank" class="menu-opcao whatsapp" title="WhatsApp">
            <span>WhatsApp</span>
    <i class="fab fa-whatsapp"></i>
</a>
        <a href="https://businesseducation.com.br" target="_blank" class="menu-opcao business" title="Site Business">
            <span>Site Business</span>
            <img src="../imagens/favicon-business.png" class="favicon-icon" alt="Business">
        </a>
    </div>
</div>

<script>
// Inicialização imediata do menu flutuante
(function() {
    // Controle do menu flutuante
    const btnMenuFlutuante = document.getElementById('btn-menu-flutuante');
    
    if (btnMenuFlutuante) {
        btnMenuFlutuante.addEventListener('click', function() {
            const menuContainer = document.querySelector('.menu-flutuante-container');
            const menuIcon = this.querySelector('i');
            
            menuContainer.classList.toggle('menu-aberto');
            
            // Alterna entre ícones de menu e fechar
            if (menuContainer.classList.contains('menu-aberto')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
    }

    // Função para fechar o menu
    function fecharMenu() {
        const menuContainer = document.querySelector('.menu-flutuante-container');
        const menuIcon = document.querySelector('#btn-menu-flutuante i');
        
        if (menuContainer && menuContainer.classList.contains('menu-aberto')) {
            menuContainer.classList.remove('menu-aberto');
            if (menuIcon) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        }
    }

    // Função do botão de carrinho
    const btnFlutuanteCarrinho = document.getElementById('btn-flutuante-carrinho');
    if (btnFlutuanteCarrinho) {
        btnFlutuanteCarrinho.onclick = function(e) {
            e.preventDefault();
    // Rola para o bloco unificado do pedido
    const quadroPedido = document.getElementById('quadro-pedido');
    
    if (quadroPedido) {
        quadroPedido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        quadroPedido.classList.add('highlight-carrinho');
        setTimeout(() => quadroPedido.classList.remove('highlight-carrinho'), 1200);
    }
            
            // Fecha o menu após clicar
            fecharMenu();
        };
    }

    // Adiciona evento para fechar menu ao clicar em qualquer opção
    const menuOpcoes = document.querySelectorAll('.menu-opcao');
    if (menuOpcoes.length > 0) {
        menuOpcoes.forEach(opcao => {
            if (opcao.id !== 'btn-flutuante-carrinho') { // Já tratamos o carrinho separadamente
                opcao.addEventListener('click', function() {
                    fecharMenu();
                });
            }
        });
    }
    
    // Adiciona funcionalidade ao botão de carrinho no header
    const headerBtnCarrinho = document.getElementById('header-btn-carrinho');
    if (headerBtnCarrinho) {
        headerBtnCarrinho.onclick = function(e) {
            e.preventDefault();
            // Rola para o bloco unificado do pedido
            const quadroPedido = document.getElementById('quadro-pedido');
            
            if (quadroPedido) {
                quadroPedido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                quadroPedido.classList.add('highlight-carrinho');
                setTimeout(() => quadroPedido.classList.remove('highlight-carrinho'), 1200);
            }
        };
    }
})();
</script>

<!-- Sistema de Cupons -->
<script src="js/coupon.js"></script>
<script>
// Sistema de cupons - se inicializa automaticamente
console.log('=== CARREGANDO SISTEMA DE CUPONS ===');
</script>

<!-- Sistema de Nuvens Infinitas -->
<script src="js/clouds-manager.js"></script>

<!-- Hero Slider Script -->
<script>
(function() {
    'use strict';
    
    // Detecta se é mobile
    const isMobile = window.innerWidth <= 768;
    
    const slider = {
        wrapper: document.querySelector('.slider-wrapper'),
        indicators: document.querySelectorAll('.indicator'),
        videos: document.querySelectorAll('.video-institucional'), // Todos os vídeos
        video: document.getElementById('hero-video'), // Vídeo principal (se existir)
        currentSlide: 0,
        totalSlides: 4, // Mobile e Desktop: 4 slides cada
        autoplayInterval: null,
        typewriterExecuted: {}, // Controla quais slides já tiveram animação executada
        slideTime: 6000, // 6 segundos para todos os slides
        isVideoPaused: false,
        isVideoPlaying: false,
        currentTranslate: 0,
        currentPosition: 0, // Posição em número de slides
        // Touch controls
        touchStartX: 0,
        touchEndX: 0,
        touchStartY: 0,
        touchEndY: 0,
        isTouching: false,
        minSwipeDistance: 50,
        isMobile: isMobile
    };
    
    if (!slider.wrapper || !slider.indicators.length) {
        return; // Sai se elementos não existem
    }
    
    // Função para ir para um slide específico
    function goToSlide(slideIndex, isManual = true) {
        if (slideIndex < 0 || slideIndex >= slider.totalSlides) return;
        
        // Para qualquer autoplay em execução
        stopAutoplay();
        
        slider.currentSlide = slideIndex;
        slider.currentPosition = slideIndex;
        
        // Move para a posição correta (cada slide = -100vw)
        const translateValue = -(slider.currentPosition * 100);
        
        // Remove todas as classes de transição
        slider.wrapper.classList.remove('no-transition', 'transitioning', 'auto-transitioning', 'manual-transitioning');
        
        // Aplica transição premium baseada no tipo
        if (isManual) {
            slider.wrapper.classList.add('manual-transitioning');
        } else {
            slider.wrapper.classList.add('auto-transitioning');
        }
        
        slider.wrapper.style.transform = `translateX(${translateValue}vw)`;
        
        // Atualiza indicadores com animação suave
        updateIndicatorsWithProgress();
        
        // Inicia typewriter do slide atual após transição (apenas se ainda não foi executado)
        setTimeout(() => {
            if (!slider.typewriterExecuted[slideIndex]) {
                const slideClass = slider.isMobile ? '.slide-mobile-only' : '.slide-desktop-only';
                const currentSlideElement = document.querySelector(`${slideClass}[data-slide="${slideIndex}"]`);
                if (currentSlideElement && currentSlideElement.querySelector('.typewriter-line[data-text]')) {
                    console.log(`Iniciando typewriter para slide ${slideIndex}`);
                    initTypewriterEffect(currentSlideElement);
                    slider.typewriterExecuted[slideIndex] = true;
                }
            }
        }, isManual ? 600 : 1200);
        
        // Inicia autoplay após transição (sempre retoma após movimento manual)
        setTimeout(() => {
            if (!slider.isVideoPaused && !slider.isVideoPlaying) {
                startAutoplay();
            }
        }, isManual ? 1000 : 2000); // Aguarda a transição terminar
        
        console.log(`Slider movido para slide ${slideIndex} (${isManual ? 'manual' : 'automático'})`);
    }
    
    // Função para atualizar indicadores
    function updateIndicators() {
        slider.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === slider.currentSlide);
        });
    }
    
    // Função premium para atualizar indicadores com animação de progresso
    function updateIndicatorsWithProgress() {
        slider.indicators.forEach((indicator, index) => {
            const isActive = index === slider.currentSlide;
            
            if (isActive && !indicator.classList.contains('active')) {
                // Adiciona classe ativa com delay para animação suave
                setTimeout(() => {
                    indicator.classList.add('active');
                }, 50);
            } else if (!isActive) {
                indicator.classList.remove('active');
            }
        });
        
        // Animação de pulso removida - sem efeitos de brilho
    }
    
    // Função para próximo slide com movimento unidirecional
    function nextSlideUnidirectional() {
        // Para o autoplay atual
        stopAutoplay();
        
        // Remove todas as classes de transição
        slider.wrapper.classList.remove('no-transition', 'transitioning', 'auto-transitioning', 'manual-transitioning');
        slider.wrapper.classList.add('auto-transitioning');
        
        // Move para o próximo slide (sempre avança 100vw)
        slider.currentPosition++;
        const translateValue = -(slider.currentPosition * 100);
        slider.wrapper.style.transform = `translateX(${translateValue}vw)`;
        
        // Atualiza o slide lógico
        slider.currentSlide = (slider.currentSlide + 1) % slider.totalSlides;
        updateIndicatorsWithProgress();
        
        // Quando chegar nos slides duplicados, reseta sem animação
        setTimeout(() => {
            if (slider.currentPosition >= slider.totalSlides) { // Chegou nos slides duplicados
                slider.wrapper.classList.remove('auto-transitioning');
                slider.wrapper.classList.add('no-transition');
                slider.currentPosition = 0; // Volta para o início
                slider.wrapper.style.transform = `translateX(0vw)`;
                
                // Reativa transições após um frame
                setTimeout(() => {
                    slider.wrapper.classList.remove('no-transition');
                    slider.wrapper.classList.add('auto-transitioning');
                }, 50);
            }
            
            // Inicia typewriter do slide atual se ainda não foi executado
            if (!slider.typewriterExecuted[slider.currentSlide]) {
                const slideClass = slider.isMobile ? '.slide-mobile-only' : '.slide-desktop-only';
                const currentSlideElement = document.querySelector(`${slideClass}[data-slide="${slider.currentSlide}"]`);
                if (currentSlideElement && currentSlideElement.querySelector('.typewriter-line[data-text]')) {
                    console.log(`Iniciando typewriter para slide ${slider.currentSlide}`);
                    initTypewriterEffect(currentSlideElement);
                    slider.typewriterExecuted[slider.currentSlide] = true;
                }
            }
            
            // Reinicia autoplay após transição
            setTimeout(() => {
                if (!slider.isVideoPaused && !slider.isVideoPlaying) {
                    startAutoplay();
                }
            }, 200);
        }, 1200); // Aguarda transição premium terminar
        
        console.log(`Slider movimento unidirecional - slide lógico: ${slider.currentSlide}, posição física: ${slider.currentPosition}`);
    }
    
    // Função para slide anterior com movimento unidirecional (espelhada de nextSlideUnidirectional)
    function prevSlideUnidirectional() {
        // Para o autoplay atual
        stopAutoplay();
        
        // Remove todas as classes de transição
        slider.wrapper.classList.remove('no-transition', 'transitioning', 'auto-transitioning', 'manual-transitioning');
        slider.wrapper.classList.add('auto-transitioning');
        
        // Move para o slide anterior (sempre retrocede 100vw)
        slider.currentPosition--;
        const translateValue = -(slider.currentPosition * 100);
        slider.wrapper.style.transform = `translateX(${translateValue}vw)`;
        
        // Atualiza o slide lógico (vai para trás)
        slider.currentSlide = (slider.currentSlide - 1 + slider.totalSlides) % slider.totalSlides;
        updateIndicatorsWithProgress();
        
        // Quando chegar no slide -1 (antes do primeiro), pula para o final sem animação
        setTimeout(() => {
            const needsReset = slider.currentPosition < 0;
            
            if (needsReset) { // Passou do primeiro slide
                slider.wrapper.classList.remove('auto-transitioning');
                slider.wrapper.classList.add('no-transition');
                slider.currentPosition = slider.totalSlides - 1; // Pula para o último dos originais
                slider.wrapper.style.transform = `translateX(-${(slider.totalSlides - 1) * 100}vw)`;
                
                // Reativa transições após um frame
                setTimeout(() => {
                    slider.wrapper.classList.remove('no-transition');
                    slider.wrapper.classList.add('auto-transitioning');
                }, 50);
            }
            
            // Inicializa elementos com delay mínimo se houve reset, ou normal se foi transição
            const initDelay = needsReset ? 100 : 1200;
            setTimeout(() => {
                // Inicia typewriter do slide atual se ainda não foi executado
                if (!slider.typewriterExecuted[slider.currentSlide]) {
                    const slideClass = slider.isMobile ? '.slide-mobile-only' : '.slide-desktop-only';
                    const currentSlideElement = document.querySelector(`${slideClass}[data-slide="${slider.currentSlide}"]`);
                    if (currentSlideElement && currentSlideElement.querySelector('.typewriter-line[data-text]')) {
                        console.log(`Iniciando typewriter para slide ${slider.currentSlide}`);
                        initTypewriterEffect(currentSlideElement);
                        slider.typewriterExecuted[slider.currentSlide] = true;
                    }
                }
                
                // Reinicia autoplay
                setTimeout(() => {
                    if (!slider.isVideoPaused && !slider.isVideoPlaying) {
                        startAutoplay();
                    }
                }, 200);
            }, initDelay);
        }, 50); // Delay mínimo para detectar se precisa reset
        
        console.log(`Slider movimento para trás - slide lógico: ${slider.currentSlide}, posição física: ${slider.currentPosition}`);
    }
    
    // Função para iniciar autoplay com tempo customizado
    function startAutoplay(customTime) {
        // Sempre limpa intervalo anterior para garantir retomada
        if (slider.autoplayInterval) {
            clearTimeout(slider.autoplayInterval);
            slider.autoplayInterval = null;
        }
        
        // Se é o slide com palavras rotativas (slide 4 = index 3 em ambos)
        const isRotatingSlide = slider.currentSlide === 3;
        
        // Tempo: 12.5s para slides com rotação (1 ciclo = 5 palavras x 2.5s), 5s para outros
        const time = isRotatingSlide ? 12500 : (customTime || 5000);
        
        slider.autoplayInterval = setTimeout(() => {
            if (!slider.isVideoPaused && !slider.isVideoPlaying) {
                nextSlideUnidirectional(); // Movimento sempre unidirecional
            }
        }, time);
        
        console.log(`Autoplay iniciado - slide ${slider.currentSlide}: ${time}ms`);
    }
    
    // Função para parar autoplay
    function stopAutoplay() {
        if (slider.autoplayInterval) {
            clearTimeout(slider.autoplayInterval);
            clearInterval(slider.autoplayInterval);
            slider.autoplayInterval = null;
            console.log('Autoplay pausado');
        }
    }
    
    // Função para retomar autoplay (usado após interações manuais)
    function resumeAutoplay() {
        stopAutoplay(); // Limpa qualquer intervalo pendente
        setTimeout(() => {
            if (!slider.isVideoPaused && !slider.isVideoPlaying) {
                startAutoplay();
            }
        }, 500); // Pequeno delay para garantir que a transição terminou
    }
    
    // Event listeners premium para os indicadores
    slider.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            // Bloqueia navegação se vídeo está tocando
            if (slider.isVideoPlaying) {
                console.log('Navegação bloqueada - vídeo está tocando');
                return;
            }
            // Navega manualmente com transição premium
            goToSlide(index, true);
            // Autoplay será retomado automaticamente em goToSlide
        });
        
        // Adiciona efeito hover premium
        indicator.addEventListener('mouseenter', () => {
            if (!indicator.classList.contains('active')) {
                indicator.style.transform = 'translateY(-1px) scale(1.05)';
            }
        });
        
        indicator.addEventListener('mouseleave', () => {
            if (!indicator.classList.contains('active')) {
                indicator.style.transform = '';
            }
        });
    });
    
    // Event listeners para TODOS os vídeos (desktop e mobile)
    slider.videos.forEach(video => {
        // Quando o vídeo é clicado/reproduzido
        video.addEventListener('play', () => {
            slider.isVideoPlaying = true;
            stopAutoplay();
            console.log('Vídeo iniciado - autoplay e navegação pausados');
        });
        
        // Quando o vídeo é pausado
        video.addEventListener('pause', () => {
            slider.isVideoPlaying = false;
            
            // Se não estamos no final do vídeo, reinicia autoplay do slide atual
            if (!video.ended && !slider.isVideoPaused) {
                setTimeout(() => {
                    if (!slider.isVideoPlaying && !slider.isVideoPaused) {
                        startAutoplay();
                    }
                }, 2000);
            }
            console.log('Vídeo pausado - navegação liberada');
        });
        
        // Quando o vídeo termina
        video.addEventListener('ended', () => {
            slider.isVideoPlaying = false;
            setTimeout(() => {
                nextSlideUnidirectional(); // Move sempre para o próximo slide unidirecionalmente
            }, 1000);
            console.log('Vídeo terminou - movendo para próximo slide');
        });
        
        // Detecta interação com o vídeo
        video.addEventListener('click', () => {
            slider.isVideoPaused = true;
            setTimeout(() => {
                slider.isVideoPaused = false;
            }, 10000); // 10 segundos de pausa na transição automática
        });
    });
    
    // Pausa autoplay quando a aba perde foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else if (!slider.isVideoPlaying && !slider.isVideoPaused) {
            // Reinicia o autoplay do slide atual quando volta para a aba
            startAutoplay();
        }
    });
    
    // ========== CONTROLES DE TOQUE ========== 
    
    // Detecta início do toque
    function handleTouchStart(e) {
        slider.isTouching = true;
        slider.touchStartX = e.touches[0].clientX;
        slider.touchStartY = e.touches[0].clientY;
        
        // Para o autoplay durante o toque
        stopAutoplay();
        
        console.log('Touch start:', slider.touchStartX);
    }
    
    // Detecta movimento do toque (opcional - para futuras melhorias)
    function handleTouchMove(e) {
        if (!slider.isTouching) return;
        
        // Previne scroll vertical se o movimento for mais horizontal
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - slider.touchStartX);
        const diffY = Math.abs(currentY - slider.touchStartY);
        
        if (diffX > diffY) {
            e.preventDefault(); // Previne scroll quando é swipe horizontal
        }
    }
    
    // Detecta fim do toque e calcula direção
    function handleTouchEnd(e) {
        if (!slider.isTouching) return;
        
        slider.isTouching = false;
        slider.touchEndX = e.changedTouches[0].clientX;
        slider.touchEndY = e.changedTouches[0].clientY;
        
        handleSwipe();
    }
    
    // Processa o gesto de swipe
    function handleSwipe() {
        // Bloqueia navegação se vídeo está tocando
        if (slider.isVideoPlaying) {
            console.log('Navegação bloqueada - vídeo está tocando');
            return;
        }
        
        const diffX = slider.touchStartX - slider.touchEndX;
        const diffY = Math.abs(slider.touchStartY - slider.touchEndY);
        
        // Só considera swipe se movimento horizontal for maior que vertical
        if (Math.abs(diffX) < diffY) {
            console.log('Movimento mais vertical que horizontal - ignorado');
            return;
        }
        
        // Só executa se a distância for suficiente
        if (Math.abs(diffX) < slider.minSwipeDistance) {
            console.log('Distância de swipe insuficiente:', Math.abs(diffX));
            return;
        }
        
        // Determina direção e executa ação
        if (diffX > 0) {
            // Swipe para esquerda (próximo slide)
            console.log('Swipe esquerda - próximo slide');
            nextSlideUnidirectional();
        } else {
            // Swipe para direita (slide anterior)
            console.log('Swipe direita - slide anterior');
            prevSlideUnidirectional();
        }
    }
    
    // Adiciona eventos de toque ao slider
    function addTouchEvents() {
        if (slider.wrapper) {
            // Ajusta distância mínima para mobile
            const isMobile = window.innerWidth <= 768;
            slider.minSwipeDistance = isMobile ? 30 : 50; // Menor distância no mobile
            
            // Eventos de toque
            slider.wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
            slider.wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            slider.wrapper.addEventListener('touchend', handleTouchEnd, { passive: false });
            
            // Previne conflitos com mouse events em dispositivos touch
            slider.wrapper.addEventListener('mousedown', (e) => {
                if (slider.isTouching) e.preventDefault();
            });
            
            // Adiciona estilo para indicar que é tocável
            slider.wrapper.style.touchAction = 'pan-y'; // Permite scroll vertical, bloqueia horizontal
            
            console.log(`Eventos de toque adicionados ao slider (mobile: ${isMobile}, minDistance: ${slider.minSwipeDistance}px)`);
        }
    }
    
    // Adiciona navegação por teclado (setas esquerda/direita)
    function addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Bloqueia navegação se vídeo está tocando
            if (slider.isVideoPlaying) {
                console.log('Navegação bloqueada - vídeo está tocando');
                return;
            }
            
            // Só ativa se o slider estiver visível na tela
            const sliderRect = slider.wrapper.getBoundingClientRect();
            const isVisible = sliderRect.top < window.innerHeight && sliderRect.bottom > 0;
            
            if (!isVisible) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                console.log('Tecla seta esquerda - slide anterior');
                prevSlideUnidirectional();
                // Autoplay será retomado automaticamente
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                console.log('Tecla seta direita - próximo slide');
                nextSlideUnidirectional();
                // Autoplay será retomado automaticamente
            }
        });
        
        console.log('Navegação por teclado ativada (setas esquerda/direita)');
    }
    
    // Inicializa o slider
    function initSlider() {
        // Inicializa na posição 0 com transição premium
        slider.currentSlide = 0;
        slider.currentPosition = 0;
        slider.wrapper.style.transform = 'translateX(0vw)';
        
        // Adiciona classe de transição inicial premium
        slider.wrapper.classList.remove('no-transition', 'transitioning', 'auto-transitioning', 'manual-transitioning');
        slider.wrapper.classList.add('auto-transitioning');
        
        // Atualiza indicadores com animação premium
        updateIndicatorsWithProgress();
        
        // Adiciona controles de toque premium
        addTouchEvents();
        
        // Adiciona navegação por teclado
        addKeyboardNavigation();
        
        // Inicia typewriter do primeiro slide (apenas uma vez)
        setTimeout(() => {
            // Seleciona o slide correto baseado no dispositivo
            const slideClass = slider.isMobile ? '.slide-mobile-only' : '.slide-desktop-only';
            const firstSlide = document.querySelector(`${slideClass}.active[data-slide="0"]`);
            console.log('Primeiro slide encontrado:', firstSlide, 'isMobile:', slider.isMobile);
            
            if (firstSlide) {
                const hasTypewriter = firstSlide.querySelector('.typewriter-line[data-text]');
                console.log('Tem typewriter?', hasTypewriter);
                
                if (hasTypewriter) {
                    initTypewriterEffect(firstSlide, () => {
                        // Callback quando animação terminar - inicia autoplay
                        if (!slider.isVideoPlaying) {
                            startAutoplay();
                        }
                    });
                    slider.typewriterExecuted[0] = true;
                } else {
                    // Sem animação, inicia autoplay com tempo padrão
                    setTimeout(() => {
                        if (!slider.isVideoPlaying) {
                            startAutoplay();
                        }
                    }, 3000);
                }
            }
        }, 300);
        
        console.log(`Hero slider premium inicializado - ${slider.totalSlides} slides com loop infinito bidirecional`);
    }
    
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();

// ========== ROTAÇÃO DE PALAVRAS ==========
(function() {
    'use strict';
    
    const rotationIntervals = new Map(); // Armazena intervalos por linha
    
    function initRotatingWords() {
        // Seleciona apenas slides VISÍVEIS (mobile OU desktop, não ambos)
        const isMobile = window.innerWidth <= 768;
        const slideClass = isMobile ? '.slide-mobile-only' : '.slide-desktop-only';
        const rotatingLines = document.querySelectorAll(`${slideClass} .rotating-word-line`);
        
        rotatingLines.forEach(line => {
            const words = line.querySelectorAll('.rotating-word');
            if (words.length <= 1) return;
            
            let currentIndex = 0;
            let cycleCount = 0;
            
            function rotateWord() {
                const currentWord = words[currentIndex];
                
                // Adiciona classe de saída (colapsa ao centro)
                currentWord.classList.add('exiting');
                
                // Aguarda animação de saída completar
                setTimeout(() => {
                    // Remove classes da palavra atual
                    currentWord.classList.remove('active', 'exiting');
                    
                    // Avança para próxima palavra
                    currentIndex = (currentIndex + 1) % words.length;
                    const nextWord = words[currentIndex];
                    
                    // Força reflow para garantir animação
                    void nextWord.offsetWidth;
                    
                    // Adiciona active (expande do centro)
                    nextWord.classList.add('active');
                    
                    // Incrementa contador de ciclos
                    if (currentIndex === 0) {
                        cycleCount++;
                        console.log(`Ciclo completo #${cycleCount} de palavras rotativas`);
                    }
                }, 50);
            }
            
            // Inicia rotação a cada 2.5 segundos
            const interval = setInterval(rotateWord, 2500);
            rotationIntervals.set(line, { interval, cycleCount: () => cycleCount });
        });
    }
    
    // Torna a função de checagem de ciclos disponível globalmente
    window.getRotationCycleCount = function() {
        let total = 0;
        rotationIntervals.forEach(value => {
            total += value.cycleCount();
        });
        return total;
    };
    
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRotatingWords);
    } else {
        initRotatingWords();
    }
})();

// ========== BANNER RESPONSIVO ========== 

(function() {
    'use strict';
    
    // Função para trocar as imagens do banner conforme o tamanho da tela
    function updateBannerImages() {
        const isMobile = window.innerWidth <= 768;
        const bannerImages = document.querySelectorAll('#banner-image-1, #banner-image-2');
        
        if (bannerImages.length) {
            const newSrc = isMobile ? 'imagens/banner-promocional-mobile.png' : 'imagens/banner-promocional.png';
            
            bannerImages.forEach(img => {
                if (img.src.indexOf(newSrc.split('/').pop()) === -1) {
                    // Transição suave ao trocar imagem
                    img.style.opacity = '0.7';
                    
                    setTimeout(() => {
                        img.src = newSrc;
                        img.style.opacity = '1';
                        console.log(`Banner atualizado para: ${isMobile ? 'mobile' : 'desktop'}`);
                    }, 100);
                }
            });
        }
    }
    
    // Função debounce para otimizar resize
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Inicializa banners responsivos
    function initResponsiveBanners() {
        // Atualiza na inicialização
        updateBannerImages();
        
        // Atualiza quando a tela é redimensionada (com debounce para performance)
        window.addEventListener('resize', debounce(updateBannerImages, 150));
        
        console.log('Sistema de banners responsivos inicializado');
    }
    
    // Inicializar loading do cupom
    function initCouponLoading() {
        console.log('🔄 Iniciando carregamento dos dados do cupom...');
        
        fetch('/cupons/public/coupon-usage.php')
            .then(response => {
                console.log('📡 Resposta recebida:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('📦 Dados recebidos:', data);
                
                if (data.success) {
                    const currentUsage = Number(data.coupon.current_usage) || 0;
                    const maxUsage = Number(data.coupon.max_usage) || 1000;
                    const apiRemaining = Number(data.coupon.remaining);
                    const percentage = Number(data.coupon.percentage) || (maxUsage > 0 ? (currentUsage / maxUsage) * 100 : 0);
                    
                    // NÚMERO DE CIMA: Usos restantes (disponíveis)
                    const remainingUsage = Number.isFinite(apiRemaining) ? apiRemaining : (maxUsage - currentUsage);
                    
                    console.log('✅ Cálculos:', {
                        maxUsage,
                        currentUsage,
                        remainingUsage,
                        percentage
                    });
                    
                    // Atualizar número no modal (apenas restantes)
                    const currentModalEl = document.getElementById('coupon-usage-current-modal');
                    
                    if (currentModalEl) {
                        currentModalEl.textContent = remainingUsage;
                        console.log('✅ Número atualizado no modal: Restam', remainingUsage, 'usos');
                    } else {
                        console.error('❌ Elemento do modal não encontrado no DOM');
                    }
                    
                    // Calcular stroke-dashoffset para animação da barra circular
                    const circumference = 2 * Math.PI * 45; // r = 45
                    const offset = circumference - (circumference * percentage / 100);
                    
                    // Atualizar barra de progresso no modal
                    const progressFillModal = document.querySelector('#coupon-modal .progress-fill');
                    if (progressFillModal) {
                        progressFillModal.style.strokeDashoffset = offset;
                        console.log('✅ Barra de progresso do modal atualizada:', offset);
                    } else {
                        console.error('❌ Elemento .progress-fill do modal não encontrado');
                    }
                    
                    // Remover shimmer após carregar dados
                    const modalContent = document.querySelector('.coupon-modal-content');
                    if (modalContent) {
                        setTimeout(() => {
                            modalContent.classList.remove('loading');
                        }, 400);
                    }
                } else {
                    console.error('❌ API retornou erro:', data.error);
                    // Remover shimmer mesmo com erro
                    const modalContent = document.querySelector('.coupon-modal-content');
                    if (modalContent) {
                        modalContent.classList.remove('loading');
                    }
                }
            })
            .catch(error => {
                console.error('❌ Erro ao carregar dados do cupom:', error);
                // Remover shimmer em caso de erro
                const modalContent = document.querySelector('.coupon-modal-content');
                if (modalContent) {
                    modalContent.classList.remove('loading');
                }
            });
    }
    
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initResponsiveBanners();
            initCouponLoading();
        });
    } else {
        initResponsiveBanners();
        initCouponLoading();
    }
})();
</script>

<!-- Modal Cupom CHEGUEIANTES -->
<div id="coupon-modal" class="coupon-modal">
    <div class="coupon-modal-overlay"></div>
    <div class="coupon-modal-content loading">
        <div class="coupon-modal-shimmer"></div>
        <button class="coupon-modal-close" onclick="closeCouponModal()">&times;</button>
        
        <div class="coupon-modal-header">
            <p class="modal-title-top">Promoção de</p>
            <h2 class="modal-title-main">
                <span class="title-compra">compra </span>
                <span class="title-antecipada">antecipada</span>
            </h2>
            <div class="modal-title-badge">
                <p>escolas parceiras</p>
            </div>
        </div>
        
        <div class="coupon-modal-body">
            <div class="coupon-progress-container">
                <svg class="circular-progress" viewBox="0 0 100 100">
                    <circle class="progress-track" cx="50" cy="50" r="45" fill="none" stroke="#282C4A" stroke-width="10"/>
                    <circle class="progress-fill" cx="50" cy="50" r="45" fill="none" stroke="url(#progressGradientModal)" stroke-width="10" stroke-dasharray="283" stroke-dashoffset="283"/>
                    <defs>
                        <linearGradient id="progressGradientModal" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#FF9933;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </svg>
                <div class="progress-content">
                    <div class="progress-inner-wrapper">
                        <div class="progress-top">Restam</div>
                        <div class="progress-main" id="coupon-usage-current-modal">...</div>
                        <div class="progress-label">usos</div>
                    </div>
                </div>
            </div>
            
            <div class="coupon-ticket">
                <img src="../imagens/Cupom CHEGUEIANTES.png" alt="Cupom CHEGUEIANTES">
            </div>
        </div>
        
        <div class="coupon-modal-footer">
            <p>Condições válidas somente para os primeiros 1.000 (mil) pedidos ou até 15/11/2025</p>
        </div>
    </div>
</div>

<script>
// Controle do Modal do Cupom
function closeCouponModal() {
    const modal = document.getElementById('coupon-modal');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
        }, 400);
    }
}

// Mostrar modal após 3 segundos (e após carregar dados)
let modalShown = false;

function showCouponModal() {
    if (modalShown) return;
    modalShown = true;
    
    const modal = document.getElementById('coupon-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Aguardar 3 segundos após o carregamento
setTimeout(showCouponModal, 3000);

// Fechar modal ao clicar no overlay
document.addEventListener('click', (e) => {
    const modal = document.getElementById('coupon-modal');
    if (e.target.classList.contains('coupon-modal-overlay')) {
        closeCouponModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCouponModal();
    }
});
</script>

</body>
</html>

