/* Gerenciador de Nuvens Infinitas - New Store */
/* Sistema baseado nas páginas de menu com nuvens infinitas */

document.addEventListener('DOMContentLoaded', function() {
    // Configuração das nuvens com 3 camadas de profundidade e distribuição otimizada
    // Camadas: front (rápida), mid (normal), back (lenta)
    const cloudsConfig = [
        // CAMADA SUPERIOR (0-20%) - 7 nuvens bem distribuídas
        { type: 'cloud-1', top: '2%', width: '140px', height: '93px', delay: -1, flipped: false, layer: 'back' },
        { type: 'cloud-2', top: '7%', width: '330px', height: '220px', delay: -7, flipped: true, layer: 'front' },
        { type: 'cloud-3', top: '12%', width: '200px', height: '133px', delay: -13, flipped: false, layer: 'mid' },
        { type: 'cloud-1', top: '17%', width: '280px', height: '187px', delay: -19, flipped: true, layer: 'mid' },
        { type: 'cloud-2', top: '4%', width: '150px', height: '100px', delay: -25, flipped: false, layer: 'back' },
        { type: 'cloud-3', top: '10%', width: '310px', height: '207px', delay: -31, flipped: false, layer: 'front' },
        { type: 'cloud-1', top: '15%', width: '170px', height: '113px', delay: -37, flipped: true, layer: 'back' },
        
        // CAMADA MÉDIA-SUPERIOR (22-45%) - 8 nuvens intercaladas
        { type: 'cloud-2', top: '23%', width: '145px', height: '97px', delay: -2, flipped: true, layer: 'back' },
        { type: 'cloud-1', top: '28%', width: '350px', height: '233px', delay: -8, flipped: false, layer: 'front' },
        { type: 'cloud-3', top: '33%', width: '180px', height: '120px', delay: -14, flipped: false, layer: 'back' },
        { type: 'cloud-1', top: '38%', width: '260px', height: '173px', delay: -20, flipped: true, layer: 'mid' },
        { type: 'cloud-2', top: '25%', width: '190px', height: '127px', delay: -26, flipped: false, layer: 'mid' },
        { type: 'cloud-3', top: '42%', width: '320px', height: '213px', delay: -32, flipped: true, layer: 'front' },
        { type: 'cloud-1', top: '30%', width: '155px', height: '103px', delay: -38, flipped: false, layer: 'back' },
        { type: 'cloud-2', top: '36%', width: '240px', height: '160px', delay: -4, flipped: true, layer: 'mid' },
        
        // CAMADA MÉDIA-INFERIOR (48-70%) - 7 nuvens estrategicamente posicionadas
        { type: 'cloud-1', top: '50%', width: '290px', height: '193px', delay: -5, flipped: false, layer: 'mid' },
        { type: 'cloud-2', top: '55%', width: '160px', height: '107px', delay: -11, flipped: true, layer: 'back' },
        { type: 'cloud-3', top: '60%', width: '340px', height: '227px', delay: -17, flipped: false, layer: 'front' },
        { type: 'cloud-1', top: '65%', width: '185px', height: '123px', delay: -23, flipped: true, layer: 'back' },
        { type: 'cloud-2', top: '52%', width: '300px', height: '200px', delay: -29, flipped: false, layer: 'front' },
        { type: 'cloud-3', top: '58%', width: '220px', height: '147px', delay: -35, flipped: true, layer: 'mid' },
        { type: 'cloud-1', top: '68%', width: '170px', height: '113px', delay: -41, flipped: false, layer: 'back' },
        
        // CAMADA INFERIOR (73-82%) - 6 nuvens, PARAM ANTES DO FIM para criar margem de ausência
        { type: 'cloud-2', top: '73%', width: '250px', height: '167px', delay: -3, flipped: true, layer: 'mid' },
        { type: 'cloud-3', top: '76%', width: '140px', height: '93px', delay: -9, flipped: false, layer: 'back' },
        { type: 'cloud-1', top: '79%', width: '315px', height: '210px', delay: -15, flipped: true, layer: 'front' },
        { type: 'cloud-2', top: '74%', width: '195px', height: '130px', delay: -21, flipped: false, layer: 'mid' },
        { type: 'cloud-3', top: '82%', width: '270px', height: '180px', delay: -27, flipped: false, layer: 'front' },
        { type: 'cloud-1', top: '77%', width: '165px', height: '110px', delay: -33, flipped: true, layer: 'back' }
    ];

    // Nuvens extras para a área do banner do checkout (85-145% da altura)
    const checkoutExtraClouds = [
        { type: 'cloud-2', top: '88%', width: '260px', height: '173px', delay: -43, flipped: false, layer: 'mid' },
        { type: 'cloud-1', top: '95%', width: '180px', height: '120px', delay: -45, flipped: true, layer: 'back' },
        { type: 'cloud-3', top: '102%', width: '320px', height: '213px', delay: -47, flipped: false, layer: 'front' },
        { type: 'cloud-2', top: '110%', width: '200px', height: '133px', delay: -49, flipped: true, layer: 'mid' },
        { type: 'cloud-1', top: '118%', width: '290px', height: '193px', delay: -51, flipped: false, layer: 'front' },
        { type: 'cloud-3', top: '125%', width: '165px', height: '110px', delay: -53, flipped: true, layer: 'back' },
        { type: 'cloud-2', top: '132%', width: '240px', height: '160px', delay: -55, flipped: false, layer: 'mid' },
        { type: 'cloud-1', top: '140%', width: '215px', height: '143px', delay: -57, flipped: true, layer: 'back' }
    ];
    
    // Wrappers/seções que receberão UM container de nuvens cada
    const targetSections = [
        '.hero-clouds-wrapper', // UM único pattern para hero + extensão + metade do banner
        '.checkout-section'     // Pattern separado para checkout
    ];

    // Função para criar uma nuvem com camada de profundidade
    function createCloud(config, index) {
        const cloud = document.createElement('div');
        cloud.className = `cloud ${config.type}${config.flipped ? ' flipped' : ''} layer-${config.layer}`;
        cloud.style.top = config.top;
        cloud.style.left = '-300px'; // Posição base sempre a mesma
        cloud.style.width = config.width;
        cloud.style.height = config.height;
        
        // Expandir distribuição de delays para cobrir um ciclo completo (60s)
        // Delays originais vão de -1 a -41, expandir para -0 a -60
        // Fator de expansão: 60/41 ≈ 1.46
        const expandedDelay = config.delay * 1.5; // Espalha delays por todo o ciclo
        cloud.style.animationDelay = `${expandedDelay}s`;
        
        cloud.dataset.layer = config.layer; // Armazenar camada para ajustes
        cloud.dataset.index = index; // Índice para controle mobile
        return cloud;
    }

    // Função para criar container de nuvens
    function createCloudsContainer(isCheckout = false) {
        const container = document.createElement('div');
        container.className = 'clouds-container';
        
        // Nuvens base
        let allClouds = [...cloudsConfig];
        
        // Se for checkout, adicionar nuvens extras para cobrir área do banner
        if (isCheckout) {
            allClouds = [...allClouds, ...checkoutExtraClouds];
        }
        
        // Detectar se é mobile (<=768px)
        const isMobile = window.innerWidth <= 768;
        
        // Índices de nuvens a remover no mobile (aproximadamente 25%, distribuídas uniformemente)
        // Total: 36 base + 8 checkout = 44 nuvens. Remover ~11 = 25%
        const mobileSkipIndices = [1, 4, 7, 10, 14, 18, 22, 26, 30, 34, 38];
        
        // Adicionar nuvens (pulando algumas no mobile)
        allClouds.forEach((config, index) => {
            // Se for mobile e índice estiver na lista de pular, não criar
            if (isMobile && mobileSkipIndices.includes(index)) {
                return; // Pula esta nuvem
            }
            
            const cloud = createCloud(config, index);
            container.appendChild(cloud);
        });
        
        return container;
    }

    // Adicionar nuvens a cada seção target
    targetSections.forEach(selector => {
        const sections = document.querySelectorAll(selector);
        const isCheckout = selector === '.checkout-section';
        sections.forEach(section => {
            // Verificar se já não tem container de nuvens
            if (!section.querySelector('.clouds-container')) {
                const cloudsContainer = createCloudsContainer(isCheckout);
                section.insertBefore(cloudsContainer, section.firstChild);
            }
        });
    });

    // Função para ajustar velocidade, filtros e camadas baseado no tamanho da tela
    function adjustCloudsForScreenSize() {
        const clouds = document.querySelectorAll('.cloud');
        const screenWidth = window.innerWidth;
        
        clouds.forEach(cloud => {
            const isFlipped = cloud.classList.contains('flipped');
            const baseTransform = isFlipped ? 'scaleX(-1)' : 'scale(1)';
            const layer = cloud.dataset.layer || 'mid';
            
            // Multiplicadores de velocidade por camada
            const layerSpeedMultipliers = {
                'front': 0.85,  // 15% mais rápida (profundidade próxima)
                'mid': 1.0,     // velocidade base
                'back': 1.2     // 20% mais lenta (profundidade distante)
            };
            
            const speedMultiplier = layerSpeedMultipliers[layer];
            
            // Filtros por camada para criar sensação de profundidade
            const layerFilters = {
                'front': 'brightness(0.62) contrast(0.77) saturate(0.65) grayscale(0.25)', // Mais nítida
                'mid': 'brightness(0.6) contrast(0.75) saturate(0.6) grayscale(0.3)',      // Normal
                'back': 'brightness(0.58) contrast(0.73) saturate(0.55) grayscale(0.35)'   // Mais desbotada
            };
            
            if (screenWidth <= 480) {
                cloud.style.animationDuration = `${40 * speedMultiplier}s`; // Reduzido 30% velocidade: 28s -> 40s
                cloud.style.filter = 'brightness(0.5) contrast(0.7) saturate(0.5) grayscale(0.4)';
                cloud.style.transform = isFlipped ? 'scale(0.4) scaleX(-1)' : 'scale(0.4)';
            } else if (screenWidth <= 768) {
                cloud.style.animationDuration = `${50 * speedMultiplier}s`; // Reduzido 30% velocidade: 35s -> 50s
                cloud.style.filter = 'brightness(0.55) contrast(0.72) saturate(0.55) grayscale(0.35)';
                cloud.style.transform = isFlipped ? 'scale(0.6) scaleX(-1)' : 'scale(0.6)';
            } else if (screenWidth <= 1200) {
                cloud.style.animationDuration = `${56 * speedMultiplier}s`; // Reduzido 30% velocidade: 39s -> 56s
                cloud.style.filter = 'brightness(0.58) contrast(0.74) saturate(0.58) grayscale(0.32)';
                cloud.style.transform = isFlipped ? 'scale(0.8) scaleX(-1)' : 'scale(0.8)';
            } else {
                cloud.style.animationDuration = `${60 * speedMultiplier}s`; // Reduzido 30% velocidade: 42s -> 60s
                cloud.style.filter = layerFilters[layer]; // Filtro específico por camada no desktop
                cloud.style.transform = baseTransform;
            }
        });
    }

    // Aplicar ajustes iniciais
    adjustCloudsForScreenSize();

    // Reagir a mudanças de tamanho da tela
    window.addEventListener('resize', adjustCloudsForScreenSize);
});
