// Dashboard Charts JavaScript
// Configurações e implementação dos gráficos do dashboard

// Função utilitária global para tachar texto (Unicode U+0336)
function strikethrough(text) {
    return text.split('').map(c => c + '\u0336').join('');
}

// Plugin para legendas HTML customizadas
const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const legendContainer = chart.canvas.parentNode.querySelector('.custom-legend');
        if (!legendContainer) return;

        // Limpar legendas antigas
        legendContainer.innerHTML = '';

        // Gerar legendas usando o gerador built-in do Chart.js
        const items = chart.options.plugins.legend.labels.generateLabels(chart);
        
        items.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                margin: 6px 0;
                padding: 8px 12px;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                min-height: 40px;
                background: ${item.hidden ? 'rgba(153, 153, 153, 0.1)' : 'transparent'};
                opacity: ${item.hidden ? '0.5' : '1'};
                border-left: ${item.hidden ? '3px solid #999999' : '3px solid transparent'};
            `;

            // Caixa de cor
            const colorBox = document.createElement('span');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = item.fillStyle;
            
            // Texto da legenda
            const textSpan = document.createElement('span');
            textSpan.style.cssText = `
                flex: 1;
                font-size: 15px;
                font-weight: 500;
                color: ${item.hidden ? '#999999' : '#121F4B'};
                line-height: 1.4;
                word-wrap: break-word;
                word-break: break-word;
                text-decoration: ${item.hidden ? 'line-through' : 'none'};
            `;
            
            // Calcular valor e percentual
            const dataset = chart.data.datasets[0];
            const value = dataset.data[index];
            const total = dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            
            // Aplicar quebra de linha inteligente baseada no espaço disponível
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1200;
            const maxLength = isMobile ? 30 : (isTablet ? 40 : 45);
            let displayText = item.text;
            
            if (displayText.length > maxLength) {
                const words = displayText.split(' ');
                const lines = [];
                let currentLine = '';
                
                for (const word of words) {
                    if ((currentLine + word).length <= maxLength) {
                        currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                    }
                }
                if (currentLine) lines.push(currentLine);
                displayText = lines.join('\n');
            }
            
            // Adicionar valor e percentual em linha separada
            displayText += `\n(${value} - ${percentage}%)`;
            
            // Aplicar tachado se necessário
            if (item.hidden) {
                displayText = strikethrough(displayText);
            }
            
            textSpan.textContent = displayText;
            textSpan.style.whiteSpace = 'pre-line';

            // Hover effect
            legendItem.addEventListener('mouseenter', () => {
                if (!item.hidden) {
                    legendItem.style.backgroundColor = 'rgba(18, 31, 75, 0.08)';
                    legendItem.style.transform = 'translateX(2px)';
                }
            });

            legendItem.addEventListener('mouseleave', () => {
                legendItem.style.backgroundColor = item.hidden ? 'rgba(153, 153, 153, 0.1)' : 'transparent';
                legendItem.style.transform = 'translateX(0)';
            });

            // Click handler
            legendItem.addEventListener('click', () => {
                const {type} = chart.config;
                if (type === 'pie' || type === 'doughnut') {
                    chart.toggleDataVisibility(item.index);
                } else {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                }
                chart.update();
            });

            legendItem.appendChild(colorBox);
            legendItem.appendChild(textSpan);
            legendContainer.appendChild(legendItem);
        });
        
        // Sistema inteligente de detecção de legendas grandes
        // Removido para evitar loops de renderização. O CSS cuidará do layout.
    }
};

// Função de Debounce e adjustChartToLegendSize removidas.
// O layout será gerenciado por CSS Flexbox para maior estabilidade.

// Registro do plugin DataLabels para Chart.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
        
        // Configuração global para evitar corte de datalabels
        Chart.defaults.plugins.datalabels = Chart.defaults.plugins.datalabels || {};
        Chart.defaults.plugins.datalabels.clip = false;
        Chart.defaults.layout.autoPadding = true;
        
        console.log('✅ Plugin DataLabels registrado com sucesso e configurado para evitar cortes');
    } else {
        console.warn('⚠️ Chart.js ou DataLabels plugin não encontrado durante o registro inicial');
        // Tentar novamente após um delay
        setTimeout(() => {
            if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
                Chart.register(ChartDataLabels);
                
                // Configuração global para evitar corte de datalabels
                Chart.defaults.plugins.datalabels = Chart.defaults.plugins.datalabels || {};
                Chart.defaults.plugins.datalabels.clip = false;
                Chart.defaults.layout.autoPadding = true;
                
                console.log('✅ Plugin DataLabels registrado com sucesso (segunda tentativa) e configurado para evitar cortes');
            }
        }, 500);
    }
});

class SmartLayoutManager {
    constructor() {
        this.breakpoints = {
            mobile: 576,
            tablet: 768,
            desktop: 992,
            large: 1200
        };
        this.init();
    }

    init() {
        this.monitorResize();
        this.detectEmptySpaces();
    }

    getScreenCategory() {
        const width = window.innerWidth;
        if (width < this.breakpoints.mobile) return 'mobile';
        if (width < this.breakpoints.tablet) return 'tablet';
        if (width < this.breakpoints.desktop) return 'desktop';
        return 'large';
    }

    getOptimalChartType(containerWidth, containerHeight, dataSize) {
        const aspectRatio = containerWidth / containerHeight;
        const category = this.getScreenCategory();

        // Lógica inteligente para escolha do tipo de gráfico
        if (category === 'mobile' || aspectRatio > 1.8) {
            return 'horizontalBar';
        }
        if (containerWidth < 300 || dataSize > 6) {
            return 'horizontalBar';
        }
        return 'doughnut';
    }

    calculateOptimalSize(container) {
        const rect = container.getBoundingClientRect();
        const parentRect = container.parentElement.getBoundingClientRect();
        
        // Detectar espaço vazio
        const usedSpace = rect.height;
        const availableSpace = parentRect.height - 100; // Margem para outros elementos
        const emptySpace = availableSpace - usedSpace;
        
        return {
            width: rect.width,
            height: Math.min(rect.height + Math.max(0, emptySpace * 0.7), availableSpace),
            hasEmptySpace: emptySpace > 50,
            emptySpace: emptySpace
        };
    }

    monitorResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.adaptLayout();
            }, 150);
        });
    }

    adaptLayout() {
        const containers = document.querySelectorAll('.chart-container');
        containers.forEach(container => {
            const canvas = container.querySelector('canvas');
            if (canvas && window.dashboardCharts) {
                const chartId = canvas.id;
                this.adaptChartToContainer(chartId, container);
            }
        });
    }

    adaptChartToContainer(chartId, container) {
        const optimal = this.calculateOptimalSize(container);
        const currentChart = Chart.getChart(chartId);
        
        if (currentChart && optimal.hasEmptySpace) {
            // Redimensionar para usar espaço vazio
            container.style.height = optimal.height + 'px';
            currentChart.resize();
            console.log(`📐 Adaptado ${chartId}: +${optimal.emptySpace}px de espaço aproveitado`);
        }
    }

    detectEmptySpaces() {
        setTimeout(() => {
            const containers = document.querySelectorAll('.chart-container-pie, .chart-container-bar');
            containers.forEach(container => {
                const optimal = this.calculateOptimalSize(container);
                if (optimal.hasEmptySpace > 100) {
                    console.log(`🔍 Espaço vazio detectado em ${container.className}: ${optimal.emptySpace}px`);
                    this.adaptChartToContainer(container.querySelector('canvas')?.id, container);
                }
            });
        }, 2000);
    }
}

class DashboardCharts {
    constructor(dados) {
        this.dados = dados;
        this.corPrimaria = '#FF692B';
        
        // Paletas base para pesquisas (laranja)
        this.coresLaranja = [
            '#FF692B', '#FF7943', '#FF8A5B', '#FF9B73', '#FFAC8B',
            '#FFBDA3', '#FFCEBB', '#FFDFD3', '#FFDBCB'
        ];
        
        // Cores azuis para loja (não usadas em pesquisas)
        this.coresAzul = [
            '#056BF1', '#1A78F2', '#2E85F3', '#4292F4', '#569FF5',
            '#6AACF6', '#7EB9F7', '#92C6F8', '#A6D3F9'
        ];
        
        this.smartLayout = new SmartLayoutManager();
        this.init();
    }

    /**
     * Gera uma paleta de cores inteligente baseada no número de itens
     * @param {number} numItems - Número de itens para colorir
     * @param {string} tipo - 'pesquisa' para tons de laranja, 'loja' para tons de azul
     * @returns {Array} Array de cores otimizadas
     */
    gerarPaletaInteligente(numItems, tipo = 'pesquisa') {
        const coresBase = tipo === 'pesquisa' ? this.coresLaranja : this.coresAzul;
        
        if (numItems <= 1) {
            return [coresBase[0]];
        }
        
        let indices = [];
        
        if (numItems === 2) {
            // Duas opções: usar cores extremas (máximo contraste)
            indices = [0, coresBase.length - 1];
        } else if (numItems === 3) {
            // Três opções: extremas e mediana
            const meio = Math.floor(coresBase.length / 2);
            indices = [0, meio, coresBase.length - 1];
        } else if (numItems === 4) {
            // Quatro opções: distribuição 25/25/25/25
            indices = [0, 2, 5, coresBase.length - 1];
        } else {
            // Para 5 ou mais itens: distribuição uniforme
            const step = (coresBase.length - 1) / (numItems - 1);
            indices = Array.from({length: numItems}, (_, i) => Math.round(i * step));
        }
        
        // Garantir que não temos índices duplicados e que estão dentro do range
        indices = [...new Set(indices)].map(i => Math.min(i, coresBase.length - 1));
        
        // Se ainda não temos cores suficientes, preencher com cores intermediárias
        while (indices.length < numItems && indices.length < coresBase.length) {
            for (let i = 0; i < indices.length - 1 && indices.length < numItems; i++) {
                const meio = Math.floor((indices[i] + indices[i + 1]) / 2);
                if (meio !== indices[i] && meio !== indices[i + 1]) {
                    indices.splice(i + 1, 0, meio);
                }
            }
        }
        
        return indices.slice(0, numItems).map(i => coresBase[i]);
    }

    init() {
        console.log('🚀 Dashboard Charts Iniciando...');
        
        // Verificar se Chart.js está carregado
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js não encontrado! Verifique se a biblioteca foi carregada.');
            return;
        }
        
        console.log('✅ Chart.js versão:', Chart.version);
        
        // Verificar se há dados
        if (!this.dados) {
            console.error('❌ Dados não encontrados!');
            return;
        }
        
        console.log('✅ Dados carregados:', Object.keys(this.dados));
        
        // Marcar containers como carregando
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.add('chart-loading');
        });
        
        this.createAllCharts();
        console.log('✅ Dashboard Charts inicializado com sucesso');
        
        // Adaptar layout após criação e verificar se todos os gráficos foram criados
        setTimeout(() => {
            this.smartLayout.adaptLayout();
            this.verificarGraficosCarregados();
            // CORREÇÃO ADICIONAL: Verificar e corrigir dimensões após carregamento completo
            this.fixAllBarChartsAfterLoad();
        }, 1000);
    }

    // Configuração universal de legenda usando HTML customizado
    getLegendConfig() {
        return {
            display: false, // Desabilitar legenda canvas nativa
        };
    }

    // Configurações adaptativas para gráficos pizza
    getConfigPizza() {
        const screenCategory = this.smartLayout.getScreenCategory();
        const isMobile = screenCategory === 'mobile';
        
        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            interaction: {
                mode: 'nearest',
                intersect: true
            },
            layout: {
                padding: {
                    top: isMobile ? 15 : 30,
                    right: isMobile ? 10 : 25,
                    bottom: isMobile ? 60 : 40,
                    left: isMobile ? 10 : 25
                }
            },
            plugins: {
                legend: this.getLegendConfig(),
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    titleColor: '#FF692B',
                    bodyColor: '#121F4B',
                    borderColor: '#056BF1',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: true,
                    titleFont: { size: isMobile ? 10 : 14, weight: '700' },
                    bodyFont: { size: isMobile ? 9 : 12, weight: '500' },
                    padding: isMobile ? 6 : 10,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        weight: '700',
                        size: isMobile ? 8 : 13,
                        family: 'Poppins'
                    },
                    formatter: function(value, context) {
                        if (value <= 0) return '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return isMobile ? `${value}` : `${value}\n(${percentage}%)`;
                    },
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    clip: false,
                    backgroundColor: function(context) {
                        return isMobile ? 'rgba(0, 0, 0, 0.8)' : 'rgba(18, 31, 75, 0.8)';
                    },
                    borderRadius: isMobile ? 2 : 4,
                    padding: {
                        top: isMobile ? 1 : 4,
                        bottom: isMobile ? 1 : 4,
                        left: isMobile ? 3 : 8,
                        right: isMobile ? 3 : 8
                    },
                    textAlign: 'center'
                }
            }
        };
    }

    // Configuração para barras horizontais (alternativa inteligente)
    getConfigHorizontalBar() {
        const screenCategory = this.smartLayout.getScreenCategory();
        const isMobile = screenCategory === 'mobile';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Barras horizontais
            interaction: {
                mode: 'nearest',
                intersect: true
            },
            layout: {
                padding: {
                    top: 50,
                    right: 15,
                    bottom: 30,
                    left: 15
                }
            },
            plugins: {
                legend: { 
                    display: false // Economizar espaço
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    titleColor: '#FF692B',
                    bodyColor: '#121F4B',
                    borderColor: '#056BF1',
                    borderWidth: 2,
                    cornerRadius: 8,
                    titleFont: { size: 14, weight: '700' },
                    bodyFont: { size: 12, weight: '500' },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed.x;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `Quantidade: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        weight: '700',
                        size: 13,
                        family: 'Poppins'
                    },
                    formatter: function(value, context) {
                        if (value <= 0) return '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${value} (${percentage}%)`;
                    },
                    anchor: 'end',
                    clip: false,
                    backgroundColor: 'rgba(18, 31, 75, 0.9)',
                    borderRadius: 6,
                    padding: {
                        top: 5,
                        bottom: 5,
                        left: 8,
                        right: 8
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    display: false,
                    grid: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: { 
                        color: '#121F4B', 
                        font: { size: isMobile ? 10 : 11, weight: '500' }
                    }
                }
            }
        };
    }

    // Configurações adaptativas para gráficos de barras pequenos
    getConfigBarras() {
        const screenCategory = this.smartLayout.getScreenCategory();
        const isMobile = screenCategory === 'mobile';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: true
            },
            layout: {
                padding: {
                    top: isMobile ? 35 : 60,
                    right: isMobile ? 5 : 15,
                    bottom: isMobile ? 30 : 45,
                    left: isMobile ? 5 : 15
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    titleColor: '#FF692B',
                    bodyColor: '#121F4B',
                    borderColor: '#056BF1',
                    borderWidth: 2,
                    cornerRadius: 8,
                    titleFont: { size: isMobile ? 10 : 14, weight: '700' },
                    bodyFont: { size: isMobile ? 9 : 12, weight: '500' },
                    padding: isMobile ? 6 : 10,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `Quantidade: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        weight: '700',
                        size: isMobile ? 8 : 13,
                        family: 'Poppins'
                    },
                    formatter: function(value, context) {
                        if (value <= 0) return '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return isMobile ? `${value}` : `${value}\n(${percentage}%)`;
                    },
                    anchor: 'end',
                    align: 'top',
                    offset: isMobile ? 6 : 10,
                    clip: false,
                    backgroundColor: 'rgba(18, 31, 75, 0.9)',
                    borderRadius: isMobile ? 3 : 6,
                    padding: {
                        top: isMobile ? 2 : 6,
                        bottom: isMobile ? 2 : 6,
                        left: isMobile ? 4 : 10,
                        right: isMobile ? 4 : 10
                    },
                    textAlign: 'center'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    display: false,
                    grid: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: '#121F4B', 
                        font: { size: isMobile ? 9 : 13, weight: '600' },
                        maxRotation: isMobile ? 30 : 45,
                        maxTicksLimit: isMobile ? 4 : 10
                    }
                }
            }
        };
    }

    // Configurações adaptativas para gráficos de barras largos
    getConfigBarrasLargos() {
        const screenCategory = this.smartLayout.getScreenCategory();
        const isMobile = screenCategory === 'mobile';
        

        
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: true
            },
            layout: {
                padding: {
                    top: isMobile ? 40 : 65,
                    right: isMobile ? 5 : 20,
                    bottom: isMobile ? 35 : 50,
                    left: isMobile ? 5 : 20
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    titleColor: '#FF692B',
                    bodyColor: '#121F4B',
                    borderColor: '#056BF1',
                    borderWidth: 2,
                    cornerRadius: 8,
                    titleFont: { size: isMobile ? 10 : 14, weight: '700' },
                    bodyFont: { size: isMobile ? 9 : 12, weight: '500' },
                    padding: isMobile ? 6 : 10,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `Quantidade: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        weight: '700',
                        size: isMobile ? 8 : 13,
                        family: 'Poppins'
                    },
                    formatter: function(value, context) {
                        if (value <= 0) return '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return isMobile ? `${value}` : `${value}\n(${percentage}%)`;
                    },
                    anchor: 'end',
                    align: 'top',
                    offset: isMobile ? 6 : 12,
                    clip: false,
                    backgroundColor: 'rgba(18, 31, 75, 0.9)',
                    borderRadius: isMobile ? 3 : 6,
                    padding: {
                        top: isMobile ? 2 : 6,
                        bottom: isMobile ? 2 : 6,
                        left: isMobile ? 4 : 10,
                        right: isMobile ? 4 : 10
                    },
                    textAlign: 'center'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    display: false,
                    grid: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: '#121F4B', 
                        font: { size: isMobile ? 9 : 13, weight: '600' },
                        maxRotation: isMobile ? 30 : 45,
                        maxTicksLimit: isMobile ? 5 : 12
                    }
                }
            }
        };
    }

    // Função inteligente para criar gráficos
    criarGrafico(elementId, config) {
        console.log(`🎯 Criando gráfico: ${elementId}`);
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                console.error(`❌ Elemento ${elementId} não encontrado no DOM`);
                return null;
            }
            console.log(`✅ Elemento ${elementId} encontrado:`, element);

            const container = element.closest('.chart-container');
            if (container) {
                container.classList.add('chart-loading');
            }

            // Antes de criar um novo gráfico, destruir o antigo
            if (window.dashboardCharts && window.dashboardCharts[elementId]) {
                try { window.dashboardCharts[elementId].destroy(); } catch(e) {}
            }

            // Registrar DataLabels de forma segura, preservando plugins existentes
            if (typeof ChartDataLabels !== 'undefined') {
                if (!config.plugins) {
                    config.plugins = [];
                }
                if (Array.isArray(config.plugins)) {
                    if (!config.plugins.includes(ChartDataLabels)) {
                        config.plugins.push(ChartDataLabels);
                    }
                } else {
                    config.plugins = [ChartDataLabels];
                }
            }
            
            // Adicionar plugin HTML para gráficos pizza/doughnut
            if (config.type === 'pie' || config.type === 'doughnut') {
                if (!config.plugins) config.plugins = [];
                config.plugins.push(htmlLegendPlugin);
                
                // Criar container para legenda HTML se não existir
                let legendContainer = container.querySelector('.custom-legend');
                if (!legendContainer) {
                    legendContainer = document.createElement('div');
                    legendContainer.className = 'custom-legend';
                    // Inserir antes do final do container, mas após o canvas
                    const canvas = container.querySelector('canvas');
                    if (canvas && canvas.nextSibling) {
                        container.insertBefore(legendContainer, canvas.nextSibling);
                    } else {
                        container.appendChild(legendContainer);
                    }
                }
            }

            console.log(`🔧 Configuração final para ${elementId}:`, config);
            const chart = new Chart(element, config);
            console.log(`🎉 Chart.js criado para ${elementId}:`, chart);
            
            requestAnimationFrame(() => {
                if (container) {
                    container.classList.remove('chart-loading');
                    container.classList.add('chart-loaded');
                }
                
                // CORREÇÃO AGRESSIVA: Forçar dimensões corretas para prevenir achatamento
                if (config.type === 'bar' && container && container.classList.contains('chart-container-bar-wide')) {
                    this.forceCorrectBarChartDimensions(chart, container, element);
                }
                
                chart.resize();
                
                // Verificação inteligente para evitar corte de datalabels
                this.checkDataLabelsVisibility(chart, container, elementId);
                
                // Plugin HTML cuidará das legendas automaticamente
                
                console.log(`✅ Gráfico ${elementId} criado com sucesso`);
            });
            
            return chart;
        } catch (error) {
            console.error(`❌ Erro ao criar gráfico ${elementId}:`, error);
            
            const element = document.getElementById(elementId);
            const container = element?.closest('.chart-container');
            if (container) {
                container.classList.remove('chart-loading');
                container.classList.add('chart-error');
            }
            
            return null;
        }
    }

    // Função para forçar dimensões corretas em gráficos de barras e evitar achatamento
    forceCorrectBarChartDimensions(chart, container, canvas) {
        try {
            console.log(`🔧 Forçando dimensões corretas para gráfico de barras...`);
            
            // Garantir que o container tenha altura mínima adequada
            const minHeight = window.innerWidth <= 768 ? 360 : 400;
            container.style.minHeight = `${minHeight}px`;
            container.style.height = `${minHeight}px`;
            
            // Forçar dimensões do canvas
            const canvasWidth = container.offsetWidth - 40; // Considerar padding
            const canvasHeight = minHeight - 160; // Espaço para título e labels
            
            canvas.style.maxHeight = `${canvasHeight}px`;
            canvas.style.height = `${canvasHeight}px`;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.maxWidth = `${canvasWidth}px`;
            
            // Forçar aspectRatio correto via Chart.js
            if (chart.options) {
                chart.options.maintainAspectRatio = false;
                chart.options.responsive = true;
                if (chart.options.aspectRatio) {
                    delete chart.options.aspectRatio;
                }
            }
            
            // Aplicar resize forçado após pequeno delay
            setTimeout(() => {
                chart.resize();
                chart.update('none'); // Update sem animação
                console.log(`✅ Dimensões forçadas aplicadas com sucesso`);
            }, 100);
            
        } catch (error) {
            console.error(`❌ Erro ao forçar dimensões do gráfico:`, error);
        }
    }

    // Função inteligente para verificar se datalabels estão sendo cortados
    checkDataLabelsVisibility(chart, container, elementId) {
        setTimeout(() => {
            try {
                const canvas = chart.canvas;
                const chartArea = chart.chartArea;
                
                // Verifica se é um gráfico de barras
                if (chart.config.type === 'bar' && chartArea) {
                    const containerRect = container.getBoundingClientRect();
                    const canvasRect = canvas.getBoundingClientRect();
                    
                    // Calcula espaço necessário para datalabels no topo
                    const neededTopSpace = 50; // Espaço mínimo necessário
                    const currentTopSpace = chartArea.top;
                    
                    console.log(`📊 ${elementId} - Espaço superior atual: ${currentTopSpace}px, necessário: ${neededTopSpace}px`);
                    
                    // Se não há espaço suficiente, ajusta o container
                    if (currentTopSpace < neededTopSpace) {
                        const extraHeight = neededTopSpace - currentTopSpace + 20;
                        const currentHeight = containerRect.height;
                        const newHeight = currentHeight + extraHeight;
                        
                        console.log(`🔧 ${elementId} - Ajustando altura de ${currentHeight}px para ${newHeight}px`);
                        
                        container.style.height = `${newHeight}px`;
                        container.style.minHeight = `${newHeight}px`;
                        
                        // Força recálculo do Chart.js
                        setTimeout(() => {
                            chart.resize();
                            console.log(`✅ ${elementId} - Container ajustado para evitar corte`);
                        }, 100);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao verificar visibilidade dos datalabels em ${elementId}:`, error);
            }
        }, 500); // Aguarda renderização completa
    }

    verificarGraficosCarregados() {
        const graficos = [
            'relevanciaChart', 'palestrantesChart', 
            'horarioChart', 'sugestoesChart', 'kitsChart',
            'guiasChart', 'facilidadeChart', 'envolvimentoChart',
            'continuidadeChart'
        ];
        
        const carregados = [];
        const falhas = [];
        
        graficos.forEach(id => {
            const container = document.getElementById(id)?.closest('.chart-container');
            if (container) {
                if (container.classList.contains('chart-loaded')) {
                    carregados.push(id);
                } else if (container.classList.contains('chart-error')) {
                    falhas.push(id);
                } else {
                    console.warn(`⚠️ Gráfico ${id} ainda carregando...`);
                }
            } else {
                console.error(`❌ Container não encontrado para ${id}`);
            }
        });
        
        console.log(`📊 Status dos gráficos:`);
        console.log(`✅ Carregados: ${carregados.length} - ${carregados.join(', ')}`);
        console.log(`❌ Falhas: ${falhas.length} - ${falhas.join(', ')}`);
        
        if (falhas.length > 0) {
            console.error(`🔄 Tentando recriar gráficos com falha...`);
            falhas.forEach(id => {
                const methodName = 'create' + id.charAt(0).toUpperCase() + id.slice(1).replace('Chart', 'Chart');
                if (this[methodName]) {
                    console.log(`🔄 Recriando ${id}...`);
                    this[methodName]();
                }
            });
        }
    }

    createAllCharts() {
        console.log('🚀 Iniciando criação dos gráficos...');
        console.log('📊 Dados disponíveis:', this.dados);
        console.log('🎨 Cores configuradas:', this.coresLaranja);
        
        try {
            // Encontro Pedagógico
            console.log('📈 Criando gráficos do Encontro Pedagógico...');
            this.createRelevanciaChart();
            this.createPalestrantesChart();
            this.createHorarioChart();
            this.createSugestoesChart();

            // Programa de Empreendedorismo
            console.log('📈 Criando gráficos do Programa de Empreendedorismo...');
            this.createKitsChart();
            this.createGuiasChart();
            this.createFacilidadeChart();
            this.createEnvolvimentoChart();
            this.createContinuidadeChart();

            console.log('✅ Todos os gráficos foram processados com sucesso');
        } catch (error) {
            console.error('❌ Erro na criação dos gráficos:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    // Gráficos individuais
    createRelevanciaChart() {
        const labels = Object.keys(this.dados.pergunta_1_relevancia);
        const cores = this.gerarPaletaInteligente(labels.length, 'pesquisa');
        
        this.criarGrafico('relevanciaChart', {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: Object.values(this.dados.pergunta_1_relevancia),
                    backgroundColor: cores,
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: this.getConfigPizza()
        });
    }

    createPalestrantesChart() {
        this.criarGrafico('palestrantesChart', {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [{
                    label: 'Quantidade de Respostas',
                    data: Object.values(this.dados.pergunta_2),
                    backgroundColor: this.corPrimaria,
                    borderRadius: 8,
                    hoverBackgroundColor: '#ff7943'
                }]
            },
            options: this.getConfigBarrasLargos()
        });
    }

    createHorarioChart() {
        const labels = Object.keys(this.dados.pergunta_3_horario);
        const cores = this.gerarPaletaInteligente(labels.length, 'pesquisa');
        
        this.criarGrafico('horarioChart', {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: Object.values(this.dados.pergunta_3_horario),
                    backgroundColor: cores,
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: this.getConfigPizza()
        });
    }

    createSugestoesChart() {
        // Filtrar apenas horários com votos para otimizar o espaço
        const horarios = Object.entries(this.dados.pergunta_3_sugestoes)
            .filter(([horario, votos]) => votos > 0)
            .sort(([,a], [,b]) => b - a) // Ordenar por número de votos (maior para menor)
            .slice(0, 10); // Top 10 horários mais votados
        
        // Se não há dados, mostrar todos os horários
        const labels = horarios.length > 0 ? horarios.map(([horario]) => horario) : Object.keys(this.dados.pergunta_3_sugestoes);
        const data = horarios.length > 0 ? horarios.map(([, votos]) => votos) : Object.values(this.dados.pergunta_3_sugestoes);
        
        this.criarGrafico('sugestoesChart', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Número de Votos',
                    data: data,
                    backgroundColor: this.corPrimaria,
                    borderRadius: 8,
                    hoverBackgroundColor: '#ff7943'
                }]
            },
            options: this.getConfigBarrasLargos()
        });
    }

    createKitsChart() {
        this.criarGrafico('kitsChart', {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [{
                    label: 'Qualidade dos Kits',
                    data: Object.values(this.dados.pergunta_4),
                    backgroundColor: this.corPrimaria,
                    borderRadius: 8,
                    hoverBackgroundColor: '#ff7943'
                }]
            },
            options: this.getConfigBarrasLargos()
        });
    }

    createGuiasChart() {
        this.criarGrafico('guiasChart', {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [{
                    label: 'Qualidade dos Guias',
                    data: Object.values(this.dados.pergunta_5),
                    backgroundColor: this.corPrimaria,
                    borderRadius: 8,
                    hoverBackgroundColor: '#ff7943'
                }]
            },
            options: this.getConfigBarrasLargos()
        });
    }

    createFacilidadeChart() {
        this.criarGrafico('facilidadeChart', {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [{
                    label: 'Facilidade do Programa',
                    data: Object.values(this.dados.pergunta_6),
                    backgroundColor: this.corPrimaria,
                    borderRadius: 8,
                    hoverBackgroundColor: '#ff7943'
                }]
            },
            options: this.getConfigBarrasLargos()
        });
    }

    createEnvolvimentoChart() {
        const labels = Object.keys(this.dados.pergunta_7);
        const cores = this.gerarPaletaInteligente(labels.length, 'pesquisa');
        
        this.criarGrafico('envolvimentoChart', {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: Object.values(this.dados.pergunta_7),
                    backgroundColor: cores,
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: this.getConfigPizza()
        });
    }

    createContinuidadeChart() {
        const labels = Object.keys(this.dados.pergunta_10);
        const cores = this.gerarPaletaInteligente(labels.length, 'pesquisa');
        
        this.criarGrafico('continuidadeChart', {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: Object.values(this.dados.pergunta_10),
                    backgroundColor: cores,
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: this.getConfigPizza()
        });
    }

    // Função para corrigir todos os gráficos de barras após carregamento completo
    fixAllBarChartsAfterLoad() {
        console.log('🔧 Verificando e corrigindo dimensões de todos os gráficos de barras...');
        
        const barChartIds = [
            'palestrantesChart',
            'sugestoesChart', 
            'kitsChart',
            'guiasChart',
            'facilidadeChart'
        ];
        
        barChartIds.forEach(chartId => {
            const container = document.querySelector(`#${chartId}`)?.closest('.chart-container-bar-wide');
            const canvas = document.getElementById(chartId);
            
            if (container && canvas) {
                // Aplicar correções agressivas de dimensão
                this.forceCorrectBarChartDimensions(null, container, canvas);
                
                // Se o gráfico Chart.js existe, aplicar resize
                if (window.Chart && window.Chart.getChart) {
                    const chart = window.Chart.getChart(canvas);
                    if (chart) {
                        setTimeout(() => {
                            chart.resize();
                            chart.update('none');
                        }, 200);
                    }
                }
            }
        });
        
        console.log('✅ Verificação e correção de gráficos de barras concluída');
    }
}

// Função para forçar sticky no desktop
function forceStickyDesktop() {
    if (window.innerWidth > 768) {
        const sidebarSticky = document.querySelector('.sidebar-sticky');
        if (sidebarSticky) {
            // LIMPAR qualquer inline style que possa interferir
            sidebarSticky.style.transform = '';
            sidebarSticky.style.opacity = '';
            sidebarSticky.style.display = '';
            
            // FORÇAR sticky
            sidebarSticky.style.position = 'sticky';
            sidebarSticky.style.top = '20px';
            sidebarSticky.style.zIndex = '999';
            
            console.log('🔒 Sticky aplicado no desktop');
        }
    }
}

// Inicialização quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM carregado, inicializando dashboard...');
    
    // APLICAR STICKY IMEDIATAMENTE
    forceStickyDesktop();
    
    // Aguardar mais tempo para garantir que todos os scripts e DOM estejam prontos
    setTimeout(() => {
        initializeDashboard();
        forceStickyDesktop(); // Garantir novamente após inicialização
    }, 500);
});

// Função de inicialização principal
function initializeDashboard() {
    console.log('🚀 Iniciando sistema de dashboard...');
    
    // Verificar dependências
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js não carregado!');
        // Tentar novamente após delay
        setTimeout(initializeDashboard, 500);
        return;
    }
    
    // Verificar containers HTML primeiro
    const containers = document.querySelectorAll('.chart-container canvas');
    console.log(`📦 Encontrados ${containers.length} containers de gráficos:`, 
               Array.from(containers).map(c => c.id));
    console.log(`📋 Esperados: relevanciaChart, palestrantesChart, horarioChart, sugestoesChart, kitsChart, guiasChart, facilidadeChart, envolvimentoChart, continuidadeChart`);
    
    if (containers.length === 0) {
        console.error('❌ Nenhum container de gráfico encontrado no DOM!');
        return;
    }
    
    // Verificar se dados foram definidos
    if (typeof dadosDashboard === 'undefined' || dadosDashboard === null) {
        console.error('❌ Dados do dashboard não encontrados!');
        console.log('📊 Variáveis disponíveis:', Object.keys(window).filter(key => key.toLowerCase().includes('dados')));
        
        // Tentar encontrar dados alternativos
        const possibleDataNames = ['dados', 'dadosGraficos', 'chartData', 'data'];
        let foundData = null;
        
        for (const name of possibleDataNames) {
            if (typeof window[name] !== 'undefined') {
                foundData = window[name];
                console.log(`✅ Dados encontrados como: ${name}`);
                break;
            }
        }
        
        if (!foundData) {
            console.error('❌ Nenhum dado encontrado. Dashboard não pode ser inicializado.');
            return;
        }
        
        window.dadosDashboard = foundData;
    }
    
    console.log('✅ Dados do dashboard encontrados:', window.dadosDashboard || dadosDashboard);
    
    // Registrar plugin se necessário de forma mais robusta
    try {
        if (typeof ChartDataLabels !== 'undefined') {
            // Verificar se já está registrado antes de registrar novamente
            if (!Chart.registry.plugins.get('datalabels')) {
                Chart.register(ChartDataLabels);
                console.log('✅ Plugin DataLabels registrado');
            } else {
                console.log('✅ Plugin DataLabels já estava registrado');
            }
        } else {
            console.warn('⚠️ Plugin DataLabels não encontrado');
        }
    } catch (error) {
        console.warn('⚠️ Erro ao registrar plugin DataLabels:', error);
    }
    
    try {
        // Criar instância e expor globalmente
        const dashboardInstance = new DashboardCharts(window.dadosDashboard || dadosDashboard);
        window.dashboardCharts = dashboardInstance;
        
        console.log('🎉 Dashboard inicializado com sucesso!');
        console.log('🧠 Sistema inteligente de layout ativado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        console.error('Stack trace:', error.stack);
        
        // Mostrar informações de debug
        console.log('🔍 Debug info:');
        console.log('- Chart.js version:', Chart.version);
        console.log('- Dados disponíveis:', Object.keys(window.dadosDashboard || dadosDashboard || {}));
        console.log('- Containers encontrados:', document.querySelectorAll('.chart-container').length);
    }
}

// Função para controlar o filtro mobile - CORRIGIDA PARA NÃO INTERFERIR COM STICKY
function toggleFilters() {
    const filterSidebar = document.querySelector('.col-md-3');
    const body = document.body;
    const html = document.documentElement;
    
    if (!filterSidebar) {
        console.error('Sidebar de filtros não encontrada');
        return;
    }
    
    // APENAS EM MOBILE: verificar largura da tela
    if (window.innerWidth > 768) {
        console.log('🖥️ Desktop detectado - filtro sempre visível, sticky ativo');
        return;
    }
    
    const isVisible = filterSidebar.classList.contains('show');
    
    if (isVisible) {
        // Fechar filtro (APENAS MOBILE)
        filterSidebar.classList.remove('show');
        
        // REMOVER transformações que interferem com sticky
        filterSidebar.style.transform = '';
        filterSidebar.style.opacity = '';
        
        // Restaurar scroll normalmente
        body.style.overflow = 'auto';
        body.style.overflowX = 'hidden';
        html.style.overflow = 'auto';
        html.style.overflowX = 'hidden';
        
        // MOBILE: ocultar após animação
        setTimeout(() => {
            if (!filterSidebar.classList.contains('show')) {
                filterSidebar.style.display = 'none';
            }
        }, 300);
    } else {
        // Abrir filtro (APENAS MOBILE)
        filterSidebar.style.display = 'block';
        filterSidebar.classList.add('show');
        
        // Bloquear scroll completamente
        body.style.overflow = 'hidden';
        body.style.overflowX = 'hidden';
        html.style.overflow = 'hidden';
        html.style.overflowX = 'hidden';
        
        // NÃO aplicar transformações que quebram sticky
        filterSidebar.style.transform = '';
        filterSidebar.style.opacity = '';
    }
}

// Fechar filtro ao clicar fora (mobile)
document.addEventListener('click', function(event) {
    const filterSidebar = document.querySelector('.col-md-3');
    const filterToggle = document.querySelector('.mobile-filter-toggle');
    const isClickInsideFilter = filterSidebar && filterSidebar.contains(event.target);
    const isClickOnToggle = filterToggle && filterToggle.contains(event.target);
    
    // Se clicar fora do filtro e não no botão toggle, fechar o filtro
    if (window.innerWidth <= 768 && filterSidebar && filterSidebar.classList.contains('show') && !isClickInsideFilter && !isClickOnToggle) {
        toggleFilters();
    }
});

// Fechar filtro mobile ao redimensionar para desktop - PRESERVA STICKY
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const filterSidebar = document.querySelector('.col-md-3');
        const sidebarSticky = document.querySelector('.sidebar-sticky');
        const body = document.body;
        const html = document.documentElement;
        
        if (filterSidebar && filterSidebar.classList.contains('show')) {
            filterSidebar.classList.remove('show');
            filterSidebar.style.display = '';
            filterSidebar.style.transform = '';
            filterSidebar.style.opacity = '';
            body.style.overflow = 'auto';
            body.style.overflowX = 'hidden';
            html.style.overflow = 'auto';
            html.style.overflowX = 'hidden';
        }
        
        // FORÇAR STICKY NO DESKTOP
        if (sidebarSticky) {
            sidebarSticky.style.position = 'sticky';
            sidebarSticky.style.top = '20px';
            sidebarSticky.style.zIndex = '999';
            console.log('🖥️ Sticky forçado no desktop');
        }
    }
});

