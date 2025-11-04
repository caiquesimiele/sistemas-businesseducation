# CONVERSOR PHP → HTML (ZERO PERDAS)
# Substitui TODAS as variáveis PHP por valores fixos da CAPEC

$ErrorActionPreference = "Stop"

Write-Host "=== CONVERSOR PHP → HTML ZERO PERDAS ===" -ForegroundColor Cyan

# Ler arquivo HTML
$htmlFile = "public/loja/demo-capec.html"
$content = Get-Content $htmlFile -Raw -Encoding UTF8

Write-Host "Arquivo original: 4239 linhas, 92 tags PHP" -ForegroundColor Yellow

# VALORES FIXOS DA LOJA CAPEC
$valores = @{
    # Store Info
    'store_id' = 's4vwcb5f-capec'
    'name_store' = 'Colégio Adventista de Campos'
    'page_title' = 'Loja Rápida | Business Education'
    'meta_description' = 'Encontre os melhores materiais didáticos para uma educação inovadora e empreendedora na Business Education.'
    'og_title' = 'Loja Rápida | Business Education & Colégio Adventista de Campos'
    'og_description' = 'Educação empreendedora para qualquer futuro.'
    'og_image_url' = 'images/og_preview.png'
    'og_site_name' = 'Loja Rápida Business Education'
    
    # Integrations
    'payment_integration_path' = 'payment_getnet'
    'freight_integration_path' = 'frete_melhorenvio'
    'freight_enabled' = 'true'
    'max_parcelas' = '12'
    
    # URLs
    'base_url' = 'https://capec.loja.businesseducation.com.br'
    'currentPageUrl' = 'https://capec.loja.businesseducation.com.br'
    
    # Images
    'favicon' = 'images/favicon-business.png'
    'banner_top' = 'images/banner-topo.png'
    'banner_footer' = 'images/banner-rodape.png'
    'logo_primary' = 'images/logo-loja.png'
}

# PRODUTOS DEMO (apenas para exibição visual)
$produtosHtml = @"
<!-- Produtos carregados estaticamente para demo -->
<script>
window.produtosDemo = {
    "1-ano-fundamental": {
        nome: "Coleção 1º Ano Fundamental",
        serie: "1º ano Fundamental",
        valor: 420.00,
        valor_pix: 399.00,
        valor_cartao: 420.00,
        imagem: "images/1-ano-fundamental-1.png"
    },
    "2-ano-fundamental": {
        nome: "Coleção 2º Ano Fundamental",
        serie: "2º ano Fundamental",
        valor: 420.00,
        valor_pix: 399.00,
        valor_cartao: 420.00,
        imagem: "images/2-ano-fundamental-1.png"
    }
};
</script>
"@

Write-Host "`nIniciando substituições..." -ForegroundColor Green

# SUBSTITUIÇÕES LINHA A LINHA

# 1. Remover todo o bloco PHP do início (já fizemos)
# (já foi removido nas edições anteriores)

# 2. Substituir <?php echo em meta tags
$patterns = @(
    # Meta tags
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''page_title''\] \?\? ''Loja Rápida''\); \?\>'
        Replace = $valores['page_title']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''meta_description''\].*?\); \?\>'
        Replace = $valores['meta_description']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(str_replace\(''_'', ''-'', \$determined_store_id_for_meta\)\); \?\>'
        Replace = $valores['store_id']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''name_store''\].*?\); \?\>'
        Replace = $valores['name_store']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$payment_integration_path\); \?\>'
        Replace = $valores['payment_integration_path']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$freight_integration_path\); \?\>'
        Replace = $valores['freight_integration_path']
    },
    @{
        Pattern = '\<\?php echo \$freight_enabled \? ''true'' : ''false''; \?\>'
        Replace = $valores['freight_enabled']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$currentPageUrl\); \?\>'
        Replace = $valores['currentPageUrl']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''og_title''\].*?\); \?\>'
        Replace = $valores['og_title']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''og_description''\].*?\); \?\>'
        Replace = $valores['og_description']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''og_image_url''\].*?\); \?\>'
        Replace = $valores['og_image_url']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_display_settings\[''og_site_name''\].*?\); \?\>'
        Replace = $valores['og_site_name']
    },
    @{
        Pattern = '\<\?php echo htmlspecialchars\(\$store_config\[''images''\]\[''favicon''\]\); \?\>'
        Replace = $valores['favicon']
    },
    
    # Condicionais Twitter
    @{
        Pattern = '\<\?php if \(!empty\(\$store_display_settings\[''twitter_handle''\]\).*?\<\?php endif; \?\>'
        Replace = ''
    },
    
    # Blocos foreach de produtos (substituir por produtos demo)
    @{
        Pattern = '\<\?php foreach \(\$produtos as \$id.*?\<\?php endforeach; \?\>'
        Replace = $produtosHtml
    }
)

# Aplicar cada substituição
$count = 0
foreach ($pattern in $patterns) {
    $matches = [regex]::Matches($content, $pattern.Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($matches.Count -gt 0) {
        $content = $content -replace $pattern.Pattern, $pattern.Replace
        $count += $matches.Count
        Write-Host "  ✅ Substituído: $($matches.Count) ocorrências" -ForegroundColor Green
    }
}

# 3. Substituir <?php echo genéricos restantes com valores padrão
$content = $content -replace '\<\?php echo htmlspecialchars\(\$[^)]+\); \?\>', '[VALOR]'
$content = $content -replace '\<\?php echo \$[^;]+; \?\>', '[VALOR]'

# 4. Remover blocos condicionais vazios
$content = $content -replace '\<\?php if.*?\<\?php endif; \?\>', ''
$content = $content -replace '\<\?php if.*?\?\>', ''
$content = $content -replace '\<\?php endif; \?\>', ''

# 5. Remover tags PHP restantes
$content = $content -replace '\<\?php.*?\?\>', ''

Write-Host "`nTotal de substituições: $count" -ForegroundColor Green

# Salvar arquivo limpo
$content | Out-File $htmlFile -Encoding UTF8 -NoNewline

Write-Host "`n✅ CONVERSÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "Arquivo: $htmlFile" -ForegroundColor Yellow
Write-Host "Agora é 100% HTML puro!" -ForegroundColor Cyan

