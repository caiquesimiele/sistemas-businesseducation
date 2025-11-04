/**
 * Sistema de Frete Dinâmico - Loja Rápida
 * Integração com Melhor Envio via AJAX - VERSÃO 3.0
 * REFORMADO: Usa dados oficiais da API via ServiceManager
 */

class FreteManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentApiOptions = [];
        this.officialServices = {}; // NOVO: Dados oficiais da API
        this.selectedOption = null;
        this.cepDestino = null;
        
        // NOVO: Taxa adicional para custos extras e embalagens
        this.taxaEmbalagem = 6.90;
        
        // NOVO: Controles anti-duplicação
        this.isCalculating = false;
        this.lastCalculationTime = 0;
        this.calculationDebounceTime = 500; // 500ms entre cálculos
        this.pendingCalculation = null;
        
        // Lê configuração dinâmica das meta tags
        const freightIntegrationPath = document.querySelector('meta[name="freight-integration-path"]')?.content || 'frete_melhorenvio';
        
        // URLs dos endpoints - usando configuração dinâmica
        this.endpoints = {
            calculate: `/${freightIntegrationPath}/public/calcular.php`,
            status: `/${freightIntegrationPath}/public/status.php`,
            services: `/${freightIntegrationPath}/public/services.php`,
            authorize: `/${freightIntegrationPath}/public/authorize.php`
        };
        
        // Mapeamento LEGACY atualizado com IDs corretos da API
        this.fallbackCompanyMapping = {
            // Correios
            '1': { name: 'Correios', service: 'PAC' },
            '2': { name: 'Correios', service: 'SEDEX' },
            '17': { name: 'Correios', service: 'Mini Envios' },
            
            // Jadlog
            '3': { name: 'Jadlog', service: '.Package' },
            '4': { name: 'Jadlog', service: '.Com' },
            '27': { name: 'Jadlog', service: '.Package Centralizado' },
            
            // LATAM Cargo (antigo eFácil)
            '12': { name: 'LATAM Cargo', service: 'éFácil' },
            
            // Azul Cargo Express
            '15': { name: 'Azul Cargo Express', service: 'Expresso' },
            '16': { name: 'Azul Cargo Express', service: 'e-commerce' },
            
            // Buslog
            '22': { name: 'Buslog', service: 'Rodoviário' },
            
            // Loggi
            '31': { name: 'Loggi', service: 'Express' },
            '32': { name: 'Loggi', service: 'Coleta' },
            '34': { name: 'Loggi', service: 'Loggi Ponto' },
            
            // JeT
            '33': { name: 'JeT', service: 'Standard' }
        };
        
        this.init();
    }
    
    /**
     * Obtém Store ID da meta tag
     */
    getStoreId() {
        const storeId = document.querySelector('meta[name="store-id"]')?.content;
        // Fallback dinâmico: tentar extrair do caminho da URL se não encontrar na meta tag
        if (!storeId) {
            const pathMatch = window.location.pathname.match(/\/stores\/([^\/]+)/);
            if (pathMatch && pathMatch[1]) {
                return pathMatch[1];
            }
        }
        return storeId || 'unknown_store'; // fallback genérico
    }
    
    /**
     * Inicialização - REFORMADA
     */
    async init() {
        console.log('FreteManager 3.0: Inicializando sistema com dados oficiais...');
        console.log(`FreteManager: Taxa de embalagem para fretes da integração: R$ ${this.taxaEmbalagem.toFixed(2)}`);
        
        // 1. Carregar dados oficiais dos serviços
        await this.loadOfficialServices();
        
        // 2. Configura event listeners
        this.setupEventListeners();
        
        // 3. Inicializa estado inicial
        this.initializeInitialState();
        
        // 4. Verifica status da integração
        this.checkIntegrationStatus();
        
        // 5. Atualiza estado inicial baseado em produtos
        this.onProductQuantityChange();
    }
    
    /**
     * NOVO: Carrega dados oficiais dos serviços da API
     * CORRIGIDO: Indexa por ID real em vez de índice do array
     */
    async loadOfficialServices() {
        try {
            console.log('FreteManager: Carregando dados oficiais dos serviços...');
            
            const response = await fetch(this.endpoints.services);
            const data = await response.json();
            
            if (data.success && data.services) {
                // CORREÇÃO: Reorganizar array por ID real para facilitar acesso
                this.officialServices = {};
                
                if (Array.isArray(data.services)) {
                    // Se for array, indexar pelo ID real
                    data.services.forEach(service => {
                        if (service.id) {
                            this.officialServices[service.id.toString()] = service;
                        }
                    });
                } else {
                    // Se for objeto, usar diretamente
                    this.officialServices = data.services;
                }
                
                console.log('FreteManager: Dados oficiais carregados:', Object.keys(this.officialServices).length, 'serviços');
                console.log('FreteManager: IDs disponíveis:', Object.keys(this.officialServices));
                
                // Log detalhado dos serviços para debug
                Object.entries(this.officialServices).forEach(([id, service]) => {
                    console.log(`Serviço ${id}: ${service.company_name} - ${service.name}`);
                });
                
            } else {
                console.warn('FreteManager: Não foi possível carregar dados oficiais, usando fallback');
                this.officialServices = {};
            }
            
        } catch (error) {
            console.error('FreteManager: Erro ao carregar dados oficiais:', error);
            this.officialServices = {};
        }
    }
    
    /**
     * Inicializa estado inicial - com 6 blocos fixos (1 escola + 5 skeleton)
     */
    initializeInitialState() {
        // Remove qualquer seleção padrão
        document.querySelectorAll('.bloco-opcao-frete').forEach(el => {
            el.classList.remove('selecionado');
            el.classList.add('disabled', 'placeholder');
        });
        
        // NOVO: Verificar se retirada na escola está habilitada
        const retiradaEscolaEnabled = window.freteConfig?.retiradaEscola?.enabled ?? true;
        
        // Inicializa "Retirada na Escola" como disabled até selecionar produtos
        const opcaoEscola = document.getElementById('opcao-retirada-escola');
        if (opcaoEscola) {
            if (retiradaEscolaEnabled) {
                // Se habilitada, comportamento padrão
                opcaoEscola.classList.add('disabled', 'placeholder');
                this.updateTooltip(opcaoEscola, 'Selecione produtos para calcular o frete');
                
                // Atualiza visualmente
                const iconEl = opcaoEscola.querySelector('i');
                const precoEl = document.getElementById('preco-retirada-escola');
                const prazoEl = opcaoEscola.querySelector('.frete-prazo');
                
                if (iconEl) iconEl.style.color = '#6c757d';
                if (precoEl) precoEl.textContent = '-';
                if (prazoEl) prazoEl.textContent = 'Selecione produtos';
            } else {
                // Se desabilitada, ocultar o bloco
                opcaoEscola.style.display = 'none';
                console.log('FreteManager: Retirada na escola desabilitada no estado inicial');
            }
        }
        
        // NOVO: Ajustar quantidade de blocos skeleton baseado na configuração
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            const numSkeletonBlocks = retiradaEscolaEnabled ? 5 : 6; // Se escola desabilitada, criar 6 blocos
            
            for (let i = 0; i < numSkeletonBlocks; i++) {
                const skeletonBlock = this.createPlaceholderBlock(`initial-placeholder-${i}`);
                const empresaEl = skeletonBlock.querySelector('.frete-empresa');
                const prazoEl = skeletonBlock.querySelector('.frete-prazo');
                if (empresaEl) empresaEl.textContent = 'Aguardando seleção';
                if (prazoEl) prazoEl.textContent = 'Selecione produtos';
                container.appendChild(skeletonBlock);
            }
        }
        
        // ✅ CORREÇÃO: Configura botão fixo no estado normal inicial
        setTimeout(() => {
            this.updateFixedButton('normal', 0);
            console.log('FreteManager: Botão fixo inicializado no estado normal');
        }, 100);
        
        // Limpa seleção
        this.selectedOption = null;
        this.updateHiddenFields();
        
        console.log('FreteManager: Estado inicial - 1 escola + 5 placeholders + botão Ver mais');
    }
    
    /**
     * Configura todos os event listeners necessários
     */
    setupEventListeners() {
        // Event listener para botões de quantidade (delegação)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-quantidade')) {
                console.log('FreteManager: Produto quantidade mudou');
                setTimeout(() => {
                    this.onProductQuantityChange();
                }, 100);
            }
        });
        
        // Campo CEP (se existir) - MELHORADO com mais eventos
        const cepInput = document.getElementById('entrega_cep');
        if (cepInput) {
            console.log('FreteManager: Campo CEP encontrado, configurando listeners');
            
            // Captura CEP em múltiplos eventos
            const capturarCep = (e) => {
                const cep = e.target.value.replace(/\D/g, '');
                console.log('FreteManager: CEP digitado:', e.target.value, '→ Limpo:', cep);
                
                if (cep.length === 8) {
                    this.cepDestino = cep;
                    console.log('FreteManager: ✅ CEP válido capturado:', cep);
                    this.onProductQuantityChange();
                } else if (cep.length > 0) {
                    console.log('FreteManager: ⚠️ CEP incompleto:', cep, `(${cep.length}/8 dígitos)`);
                }
            };
            
            // Múltiplos eventos para garantir captura
            cepInput.addEventListener('blur', capturarCep);
            cepInput.addEventListener('input', capturarCep);
            cepInput.addEventListener('change', capturarCep);
            
            // Captura CEP inicial se já preenchido
            if (cepInput.value) {
                const cepInicial = cepInput.value.replace(/\D/g, '');
                if (cepInicial.length === 8) {
                    this.cepDestino = cepInicial;
                    console.log('FreteManager: ✅ CEP inicial capturado:', cepInicial);
                }
            }
        } else {
            console.warn('FreteManager: ⚠️ Campo entrega_cep não encontrado no DOM');
        }
        
        // ✅ Event listener para botão fixo será adicionado automaticamente pelo updateFixedButton
        
        console.log('FreteManager: Event listeners configurados');
    }
    
    /**
     * Verifica status da integração OAuth2
     */
    async checkIntegrationStatus() {
        try {
            const response = await fetch(this.endpoints.status);
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = data.status.authenticated;
                console.log(`FreteManager: Autenticado = ${this.isAuthenticated}`);
                console.log('FreteManager: Status completo:', data.status);
                
                // Se não autenticado, mostra link de integração
                if (!this.isAuthenticated && data.status.authorization_url) {
                    this.showIntegrationPrompt(data.status.authorization_url);
                }
            }
        } catch (error) {
            console.error('FreteManager: Erro ao verificar status:', error);
            this.showApiError();
        }
    }
    
    /**
     * Handler para mudança de quantidade de produtos
     * MELHORADO: Mantém seleção de frete quando possível
     * ANTI-DUPLICAÇÃO: Controla múltiplas chamadas simultâneas
     */
    onProductQuantityChange() {
        // NOVO: Cancela cálculo pendente se existir
        if (this.pendingCalculation) {
            clearTimeout(this.pendingCalculation);
            this.pendingCalculation = null;
        }
        
        // NOVO: Verifica se já está calculando
        if (this.isCalculating) {
            console.log('FreteManager: Cálculo já em andamento, ignorando nova solicitação');
            return;
        }
        
        // NOVO: Controle de debounce baseado em tempo
        const now = Date.now();
        const timeSinceLastCalculation = now - this.lastCalculationTime;
        
        if (timeSinceLastCalculation < this.calculationDebounceTime) {
            const remainingTime = this.calculationDebounceTime - timeSinceLastCalculation;
            console.log(`FreteManager: Aguardando ${remainingTime}ms antes do próximo cálculo`);
            
            this.pendingCalculation = setTimeout(() => {
                this.pendingCalculation = null;
                this.onProductQuantityChange();
            }, remainingTime);
            return;
        }
        
        clearTimeout(this.quantityChangeTimeout);
        this.quantityChangeTimeout = setTimeout(() => {
            const products = this.getSelectedProducts();
            
            console.log('FreteManager: Recalculando para', products.length, 'produtos');
            
            // Salva seleção atual para tentar restaurar depois
            const previousSelection = this.selectedOption ? {
                id: this.selectedOption.id,
                price: this.selectedOption.price,
                name: this.selectedOption.name
            } : null;
            
            if (products.length === 0) {
                // Sem produtos - desabilita API, "Retirada na Escola" disabled
                this.updateNoProductsState();
            } else {
                // Com produtos - habilita opções, calcula preços
                this.updateWithProductsState(products, previousSelection);
            }
        }, 200);
    }
    
    /**
     * Estado: sem produtos selecionados
     */
    updateNoProductsState() {
        // Atualiza "Retirada na Escola" para disabled
        this.updateRetiradaEscola(0, true);
        
        // Limpa opções da API
        this.clearApiOptions();
        
        // Se havia seleção, remove
        if (this.selectedOption) {
            this.selectedOption = null;
            this.updateHiddenFields();
            this.updateTotals();
        }
    }
    
    /**
     * Estado: com produtos selecionados
     * MELHORADO: Restaura seleção anterior após carregamento das opções
     */
    async updateWithProductsState(products, previousSelection) {
        // Atualiza "Retirada na Escola" com preço
        this.updateRetiradaEscola(products, false);
        
        // Calcula frete da API se autenticado
        if (this.isAuthenticated) {
            // Aguarda o carregamento das opções da API
            await this.calculateFreightForProducts(products);
            
            // Restaura seleção anterior se possível após carregar as opções
            if (previousSelection) {
                console.log('FreteManager: Tentando restaurar seleção anterior:', previousSelection);
                
                setTimeout(() => {
                    // Verifica se a opção ainda está disponível
                    const optionElement = previousSelection.id === 'retirada_escola' 
                        ? document.getElementById('opcao-retirada-escola')
                        : document.querySelector(`[data-option-id="${previousSelection.id}"]`);
                    
                    if (optionElement && !optionElement.classList.contains('disabled')) {
                        // Recalcula preço para "Retirada na Escola" com nova quantidade
                        if (previousSelection.id === 'retirada_escola') {
                            const totalItems = products.reduce((total, product) => total + product.quantity, 0);
                            const basePrice = window.freteConfig?.basePrice || 0.00;
                            const additionalPercentage = window.freteConfig?.additionalPercentage || 0.25;
                            const newPrice = basePrice + (basePrice * (additionalPercentage / 100) * (totalItems - 1));
                            
                            // CORREÇÃO: Força seleção sem toggle
                            this.forceSelectOption(previousSelection.id, newPrice, previousSelection.name);
                            console.log('FreteManager: ✅ Seleção "Retirada na Escola" restaurada com novo preço:', newPrice);
                        } else {
                            // Para opções da API, usa dados da resposta atual
                            const apiOption = this.currentApiOptions.find(opt => 
                                opt.id?.toString() === previousSelection.id?.toString()
                            );
                            
                            if (apiOption) {
                                // CORREÇÃO: Aplicar taxa de embalagem no preço da restauração
                                const basePrice = apiOption.custom_price || apiOption.price;
                                const newPrice = basePrice + this.taxaEmbalagem;
                                console.log(`FreteManager: Restauração com taxa aplicada: R$ ${basePrice.toFixed(2)} → R$ ${newPrice.toFixed(2)}`);
                                
                                // CORREÇÃO: Força seleção sem toggle
                                this.forceSelectOption(previousSelection.id, newPrice, previousSelection.name);
                                console.log('FreteManager: ✅ Seleção da API restaurada com novo preço:', newPrice);
                            } else {
                                console.log('FreteManager: ⚠️ Opção da API não encontrada, seleção não restaurada');
                            }
                        }
                    } else {
                        console.log('FreteManager: ⚠️ Opção anterior não está mais disponível, seleção não restaurada');
                    }
                }, 500);
            }
        } else {
            this.showCalculatingState();
        }
    }
    
    /**
     * Atualiza "Retirada na Escola"
     * ATUALIZADO: Agora usa estrutura HTML padronizada
     */
    updateRetiradaEscola(products, isDisabled) {
        const opcaoEl = document.getElementById('opcao-retirada-escola');
        const precoEl = document.getElementById('preco-retirada-escola');
        const empresaEl = opcaoEl?.querySelector('.frete-empresa');
        const modalidadeEl = opcaoEl?.querySelector('.frete-modalidade');
        const prazoEl = opcaoEl?.querySelector('.frete-prazo');
        const iconEl = opcaoEl?.querySelector('i');
        
        if (!opcaoEl || !precoEl) return;
        
        // NOVO: Verificar se retirada na escola está habilitada na configuração
        const retiradaEscolaEnabled = window.freteConfig?.retiradaEscola?.enabled ?? true;
        
        if (!retiradaEscolaEnabled) {
            // Se retirada na escola estiver desabilitada, ocultar o bloco
            opcaoEl.style.display = 'none';
            console.log('FreteManager: Retirada na escola desabilitada na configuração');
            return;
        }
        
        // Garantir que o bloco está visível se habilitado
        opcaoEl.style.display = '';
        
        if (isDisabled) {
            // Estado desabilitado - sem produtos selecionados
            opcaoEl.classList.add('disabled', 'placeholder');
            opcaoEl.classList.remove('selecionado');
            
            if (empresaEl) empresaEl.textContent = 'Retirada na Escola';
            if (modalidadeEl) modalidadeEl.textContent = 'Retire no local';
            precoEl.textContent = '-';
            if (prazoEl) prazoEl.textContent = 'Selecione produtos';
            if (iconEl) iconEl.style.color = '#6c757d';
            
            this.updateTooltip(opcaoEl, 'Selecione produtos para calcular o frete');
            console.log('FreteManager: Retirada na Escola desabilitada (sem produtos)');
        } else {
            // Estado ativo - produtos selecionados, calcular preço
            const totalQuantity = this.getTotalQuantity(products);
            const price = this.calculateSchoolPrice(totalQuantity);
            
            opcaoEl.classList.remove('disabled', 'placeholder');
            
            if (empresaEl) empresaEl.textContent = 'Retirada na Escola';
            if (modalidadeEl) modalidadeEl.textContent = 'Retire no local';
            precoEl.textContent = this.formatPrice(price, true);
            if (prazoEl) prazoEl.textContent = window.freteConfig?.deliveryTime || 'até 7 dias';
            if (iconEl) iconEl.style.color = '#121F4B';
            
            this.updateTooltip(opcaoEl, 'Clique para selecionar esta opção');
            console.log(`FreteManager: Retirada na Escola ativa - Qtd: ${totalQuantity}, Preço: R$ ${price.toFixed(2)}`);
        }
    }
    
    /**
     * Mostra estado "calculando"
     * MELHORADO: Preserva altura para evitar tremida
     */
    showCalculatingState() {
        console.log('FreteManager: Mostrando estado calculando...');
        
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            // 🎯 ANTI-TREMIDA: Preserva altura atual se não há altura mínima definida
            if (!container.style.minHeight) {
                const currentHeight = container.offsetHeight;
                if (currentHeight > 0) {
                    console.log(`FreteManager: Preservando altura durante carregamento: ${currentHeight}px`);
                    container.style.minHeight = `${currentHeight}px`;
                    container.style.transition = 'min-height 0.3s ease';
                }
            }
        }
        
        // Limpa opções existentes da API - sem usar calculating-placeholder
        this.clearApiOptions();
        
        // ✅ REMOVIDO: calculating-placeholder que causava bloco extra
        console.log('FreteManager: Estado de carregamento ativado - aguardando resposta da API');
    }
    
    /**
     * Limpa opções da API e prepara para recálculo
     * CORRIGIDO: Transição direta sem remover todos os blocos (evita layout shift)
     */
    clearApiOptions() {
        // NOVO: Verificar se deve preservar estado expandido
        const shouldPreserveExpanded = this.isExtraOptionSelected();
        const savedState = this.saveExtraOptionsState();
        
        console.log('FreteManager: Preservar estado expandido?', shouldPreserveExpanded);
        
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            // 🎯 ANTI-TREMIDA: Altura mais dinâmica
            const currentHeight = container.offsetHeight;
            const minHeight = Math.max(200, currentHeight * 0.6);
            console.log(`FreteManager: Preservando altura mínima: ${minHeight}px durante recálculo`);
            
            // Aplica altura mínima mais baixa para evitar muito espaço vazio
            container.style.minHeight = `${minHeight}px`;
            container.style.transition = 'min-height 0.3s ease';
            container.classList.add('preserving-height');
            
            // ✅ TRANSIÇÃO DIRETA: Substitui blocos API existentes por skeleton blocks
            // Isso evita qualquer momento em que não há blocos visíveis
            const apiBlocks = container.querySelectorAll('[data-api-option="true"], [data-skeleton="true"], [data-placeholder="true"]');
            console.log(`FreteManager: Encontrados ${apiBlocks.length} blocos para converter em skeleton`);
            
            // Converte cada bloco existente em skeleton (mantém posição no DOM)
            apiBlocks.forEach((block, index) => {
                // Cria novo skeleton block
                const skeletonBlock = this.createSkeletonBlock(`skeleton-transition-${index}`);
                
                // Substitui o bloco existente pelo skeleton
                block.replaceWith(skeletonBlock);
                console.log(`FreteManager: Bloco ${index} convertido em skeleton`);
            });
            
            // Se não tiver 5 skeleton blocks, adiciona os faltantes
            const currentSkeletons = container.querySelectorAll('[data-skeleton="true"]');
            for (let i = currentSkeletons.length; i < 5; i++) {
                const skeletonBlock = this.createSkeletonBlock(`skeleton-extra-${i}`);
                container.appendChild(skeletonBlock);
                console.log(`FreteManager: Skeleton extra ${i} adicionado`);
            }
        }
        
        // NOVO: Converte opções extras em skeleton blocks se devem ser preservadas
        const extraContainer = document.getElementById('opcoes-extras-grid-fixo');
        if (extraContainer && shouldPreserveExpanded && savedState.extraCount > 0) {
            console.log(`FreteManager: Convertendo ${savedState.extraCount} opções extras em skeleton blocks`);
            
            // Limpa container
            extraContainer.innerHTML = '';
            
            // Cria skeleton blocks para as opções extras baseado na quantidade salva
            for (let i = 0; i < savedState.extraCount; i++) {
                const skeletonBlock = this.createSkeletonBlock(`skeleton-extra-${i}`);
                extraContainer.appendChild(skeletonBlock);
            }
            
            console.log(`FreteManager: ${savedState.extraCount} skeleton blocks criados para opções extras`);
        } else if (extraContainer && !shouldPreserveExpanded) {
            // Comportamento original: limpa completamente
            extraContainer.innerHTML = '';
        }
        
        // MODIFICADO: Só recolhe container de extras se NÃO deve preservar estado
        const extraContainerMain = document.getElementById('opcoes-extras-fixo');
        if (extraContainerMain && !shouldPreserveExpanded) {
            extraContainerMain.classList.remove('expandido');
        }
        
        // Salva o estado para restaurar depois
        this.savedExtraState = shouldPreserveExpanded ? savedState : null;
        
        // Atualiza botão fixo para estado loading
        this.updateFixedButton('loading');
        
        console.log('FreteManager: Transição direta concluída - sem layout shift');
        
        // Ajusta o layout após limpar blocos
        this.adjustFreightLayout();
    }
    
    /**
     * Calcula frete para produtos selecionados
     */
    async calculateFreightForProducts(products) {
        // NOVO: Controle anti-duplicação
        if (this.isCalculating) {
            console.log('FreteManager: Cálculo já em andamento, ignorando nova solicitação');
            return;
        }
        
        this.isCalculating = true;
        this.lastCalculationTime = Date.now();
        
        this.showCalculatingState();
        
        // NOVO: Força captura do CEP antes de calcular
        if (!this.forceCaptureCep()) {
            console.error('FreteManager: Não foi possível capturar CEP válido');
            this.showApiError();
            this.isCalculating = false; // Libera para próxima tentativa
            return;
        }
        
        try {
            const data = this.buildApiPayload(products);
            
            // VALIDAÇÃO CRÍTICA: Se não conseguiu construir payload (CEP inválido), mostrar erro
            if (!data) {
                console.error('FreteManager: Não foi possível construir payload - CEP de destino obrigatório');
                this.showApiError();
                return;
            }
            
            console.log('FreteManager: Enviando payload para API:', data);
            
            const response = await fetch(this.endpoints.calculate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('FreteManager: Status da resposta:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('FreteManager: Resposta da API:', result);
            
            if (result.success && result.options) {
                this.currentApiOptions = result.options;
                this.createDynamicApiBlocks(result.options);
                console.log('FreteManager: Opções da API carregadas:', result.options);
            } else if (result.success && result.api_authenticated === false) {
                // API não autenticada - apenas mostra "Retirada na Escola"
                console.log('FreteManager: API não autenticada - apenas opções locais');
                this.clearApiOptions();
            } else {
                console.error('FreteManager: Erro na resposta:', result.error || 'Resposta inválida');
                this.showApiError();
            }
            
        } catch (error) {
            console.error('FreteManager: Erro no cálculo:', error);
            console.error('FreteManager: Detalhes do erro:', {
                message: error.message,
                endpoint: this.endpoints.calculate,
                stack: error.stack
            });
            this.showApiError();
        } finally {
            // NOVO: Sempre libera o lock de cálculo
            this.isCalculating = false;
            console.log('FreteManager: Cálculo finalizado, lock liberado');
        }
    }
    
    /**
     * Cria blocos dinâmicos para opções da API
     * CORRIGIDO: Evita duplicação e melhora lógica de distribuição
     */
    createDynamicApiBlocks(apiOptions) {
        const container = document.getElementById('opcoes-frete-container');
        if (!container) return;
        
        console.log('FreteManager: Criando blocos dinâmicos para', apiOptions.length, 'opções da API');
        
        // NOVO: Aplicar limitação de preços se configurada
        const processedOptions = this.applyPriceLimitation(apiOptions);
        
        // Identifica opções válidas e ordena por preço
        const validOptions = processedOptions.filter(option => this.isOptionAvailable(option));
        const invalidOptions = processedOptions.filter(option => !this.isOptionAvailable(option));
        
        console.log(`FreteManager: ${validOptions.length} opções válidas, ${invalidOptions.length} inválidas`);
        
        // Ordena válidas por preço (incluindo taxa de embalagem)
        validOptions.sort((a, b) => {
            const priceA = (a.custom_price || a.price || 0) + this.taxaEmbalagem;
            const priceB = (b.custom_price || b.price || 0) + this.taxaEmbalagem;
            return priceA - priceB;
        });
        
        // NOVO: Verificar se retirada na escola está habilitada
        const retiradaEscolaEnabled = window.freteConfig?.retiradaEscola?.enabled ?? true;
        
        // CORREÇÃO: Calcular slots disponíveis considerando retirada na escola
        const maxMainSlots = retiradaEscolaEnabled ? 5 : 6; // Se escola habilitada: 5 slots API + 1 escola, senão: 6 slots API
        
        // NOVO: Se retirada na escola estiver desabilitada, promover uma opção da API para o primeiro bloco
        if (!retiradaEscolaEnabled && validOptions.length > 0) {
            const opcaoEscola = document.getElementById('opcao-retirada-escola');
            if (opcaoEscola) {
                // Converte o bloco da escola para exibir a melhor opção da API
                const bestOption = validOptions[0];
                this.convertSchoolBlockToApiOption(opcaoEscola, bestOption);
                
                // Remove a primeira opção da lista para não duplicar
                validOptions.shift();
                console.log('FreteManager: Opção da API promovida para o bloco da escola (desabilitada)');
            }
        }
        
        // CORREÇÃO: Dividir opções de forma inteligente
        const mainOptions = validOptions.slice(0, maxMainSlots);
        const extraOptions = validOptions.slice(maxMainSlots);
        
        console.log(`FreteManager: ${mainOptions.length} opções principais (máximo ${maxMainSlots}), ${extraOptions.length} opções extras`);
        
        // Cria blocos para opções principais
        const existingApiBlocks = container.querySelectorAll('[data-api-option="true"], [data-skeleton="true"], [data-placeholder="true"]');
        
        // LIMPEZA EFICIENTE: Remove apenas blocos desnecessários
        if (existingApiBlocks.length > maxMainSlots) {
            for (let i = maxMainSlots; i < existingApiBlocks.length; i++) {
                if (existingApiBlocks[i]) {
                    existingApiBlocks[i].remove();
                }
            }
        }
        
        // ATUALIZAÇÃO INTELIGENTE: Atualiza ou cria blocos conforme necessário
        for (let i = 0; i < maxMainSlots; i++) {
            const targetBlock = existingApiBlocks[i];
            
            if (i < mainOptions.length) {
                // Tem opção válida para este slot
                const option = mainOptions[i];
                const blockId = `main-option-${i}`;
                
                if (targetBlock) {
                    // Substitui bloco existente
                    const newBlock = this.createFreightBlock(option, blockId);
                    targetBlock.replaceWith(newBlock);
                } else {
                    // Cria novo bloco
                    const newBlock = this.createFreightBlock(option, blockId);
                    container.appendChild(newBlock);
                }
                
                console.log(`FreteManager: Bloco principal ${i} criado/atualizado com ${option.company || option.name}`);
            } else {
                // Slot vazio - criar placeholder
                const placeholderBlock = this.createPlaceholderBlock(`placeholder-${i}`);
                
                if (targetBlock) {
                    targetBlock.replaceWith(placeholderBlock);
                } else {
                    container.appendChild(placeholderBlock);
                }
                
                console.log(`FreteManager: Placeholder ${i} criado/atualizado`);
            }
        }
        
        // Salva opções atuais da API para uso em seleções
        this.currentApiOptions = processedOptions;
        
        // CORREÇÃO: Gerencia botão "Ver mais opções" e opções extras
        const extraContainer = document.getElementById('opcoes-extras-grid-fixo');
        
        if (extraOptions.length > 0) {
            console.log(`FreteManager: Criando ${extraOptions.length} opções extras`);
            
            // Limpa container de extras
            if (extraContainer) {
                extraContainer.innerHTML = '';
                
                // Cria blocos para opções extras com IDs únicos
                extraOptions.forEach((option, index) => {
                    const extraBlock = this.createFreightBlock(option, `extra-option-${index}`);
                    extraContainer.appendChild(extraBlock);
                });
            }
            
            // Atualiza botão fixo para estado normal
            this.updateFixedButton('normal', extraOptions.length);
            
            // NOVO: Restaurar estado expandido se havia antes
            if (this.savedExtraState && this.savedExtraState.wasExpanded) {
                console.log('FreteManager: Restaurando estado expandido das opções extras');
                this.restoreExtraOptionsState(this.savedExtraState, extraOptions.length);
                this.savedExtraState = null; // Limpa estado salvo
            }
        } else {
            // CORREÇÃO: Não há opções extras - ajustar botão conforme o caso
            console.log('FreteManager: Sem opções extras disponíveis');
            
            if (extraContainer) {
                extraContainer.innerHTML = '';
            }
            
            if (validOptions.length > 0) {
                // ✅ NOVA LÓGICA: Tem opções, mas todas cabem na área principal
                console.log('FreteManager: Todas as opções cabem na área principal, ocultando botão');
                this.updateFixedButton('hidden', 0);
            } else {
                // Não tem opções válidas
                console.log('FreteManager: Nenhuma opção válida disponível');
                this.updateFixedButton('empty', 0);
            }
        }
        
        // ✅ CORREÇÃO: Remove altura preservada após criação
        this.clearMinHeight();
        
        console.log('FreteManager: ✅ Blocos dinâmicos criados com sucesso - Duplicação evitada');
    }
    
    /**
     * NOVO: Aplica limitação de preços baseada na configuração
     */
    applyPriceLimitation(apiOptions) {
        const priceLimit = window.freteConfig?.priceLimit;
        
        if (!priceLimit?.enabled) {
            return apiOptions;
        }
        
        const limitValue = priceLimit.limitValue || 18.90;
        const maxOriginalPrice = priceLimit.maxOriginalPrice || 26.00;
        const appliesAfterPackaging = priceLimit.appliesAfterPackaging !== false;
        
        console.log('FreteManager: Aplicando limitação de preços:', {
            limitValue,
            maxOriginalPrice,
            appliesAfterPackaging
        });
        
        return apiOptions.map(option => {
            const originalPrice = option.custom_price || option.price || 0;
            let finalPrice = originalPrice;
            
            if (appliesAfterPackaging) {
                // Verifica limitação após somar taxa de embalagem
                const priceWithPackaging = originalPrice + this.taxaEmbalagem;
                if (priceWithPackaging <= maxOriginalPrice) {
                    finalPrice = Math.min(limitValue - this.taxaEmbalagem, originalPrice);
                }
            } else {
                // Verifica limitação no preço original (sem embalagem)
                if (originalPrice <= maxOriginalPrice) {
                    finalPrice = Math.min(limitValue, originalPrice);
                }
            }
            
            // Log apenas se houve limitação
            if (finalPrice < originalPrice) {
                console.log(`FreteManager: Preço limitado - ${option.company?.name || option.name}: R$ ${originalPrice.toFixed(2)} → R$ ${finalPrice.toFixed(2)}`);
            }
            
            return {
                ...option,
                price: finalPrice,
                original_price: originalPrice
            };
        });
    }
    
    /**
     * NOVO: Converte o bloco da escola para exibir uma opção da API
     * ATUALIZADO: Estrutura HTML padronizada
     */
    convertSchoolBlockToApiOption(schoolBlock, apiOption) {
        const companyInfo = this.getCompanyInfo(apiOption);
        const finalPrice = (apiOption.custom_price || apiOption.price || 0) + this.taxaEmbalagem;
        
        // Atualiza atributos do bloco
        schoolBlock.setAttribute('data-option-id', apiOption.id);
        schoolBlock.setAttribute('data-api-promoted', 'true');
        schoolBlock.onclick = () => this.selectFreightOption(
            apiOption.id, 
            finalPrice, 
            companyInfo.displayName
        );
        
        // ✅ ESTRUTURA HTML PADRONIZADA - Idêntica aos outros blocos
        schoolBlock.innerHTML = `
            <div class="frete-imagem">
                <i class="${this.getDefaultIcon(companyInfo.company)}" style="font-size: 2rem; color: #121F4B;"></i>
            </div>
            <div class="frete-info">
                <div class="frete-empresa">${companyInfo.company || 'Transportadora'}</div>
                <div class="frete-modalidade">${companyInfo.service || 'Serviço Padrão'}</div>
                <div class="frete-preco">${this.formatPrice(finalPrice, true)}</div>
                <div class="frete-prazo">${this.formatDeliveryTime(apiOption.custom_delivery_time || apiOption.delivery_time || 0, true)}</div>
            </div>
        `;
        
        // Remove classes de desabilitado
        schoolBlock.classList.remove('disabled', 'placeholder');
        this.updateTooltip(schoolBlock, 'Clique para selecionar esta opção');
        
        console.log(`FreteManager: Bloco da escola convertido para ${companyInfo.displayName}`);
    }
    
    /**
     * NOVO: Remove altura mínima do container após calcular fretes
     */
    clearMinHeight() {
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            setTimeout(() => {
                container.style.minHeight = '';
                container.classList.remove('preserving-height');
                console.log('FreteManager: Altura mínima removida - layout ajustado');
            }, 500); // Pequeno delay para transição suave
        }
    }
    
    /**
     * NOVO: Identifica opções prioritárias baseado nas regras do usuário
     * ATUALIZADO: Agora seleciona 5 opções para totalizar 6 blocos com "Retirada na Escola"
     */
    identifyPriorityOptions(validOptions) {
        const priorityList = [];
        const usedIds = new Set();
        
        // 1. Correios PAC
        const correiosPac = validOptions.find(opt => {
            const companyInfo = this.getCompanyInfo(opt);
            return companyInfo.company.toLowerCase().includes('correios') && 
                   companyInfo.service.toLowerCase().includes('pac');
        });
        if (correiosPac && !usedIds.has(correiosPac.id)) {
            priorityList.push(correiosPac);
            usedIds.add(correiosPac.id);
        }
        
        // 2. Correios SEDEX
        const correiosSedex = validOptions.find(opt => {
            const companyInfo = this.getCompanyInfo(opt);
            return companyInfo.company.toLowerCase().includes('correios') && 
                   companyInfo.service.toLowerCase().includes('sedex');
        });
        if (correiosSedex && !usedIds.has(correiosSedex.id)) {
            priorityList.push(correiosSedex);
            usedIds.add(correiosSedex.id);
        }
        
        // 3. Opção mais barata (que não seja Correios já incluído)
        const cheapestOption = validOptions.find(opt => !usedIds.has(opt.id));
        if (cheapestOption) {
            priorityList.push(cheapestOption);
            usedIds.add(cheapestOption.id);
        }
        
        // 4. Opção mais rápida (que não seja já incluída)
        const fastestOption = validOptions
            .filter(opt => !usedIds.has(opt.id))
            .sort((a, b) => {
                const timeA = a.custom_delivery_time || a.delivery_time || 999;
                const timeB = b.custom_delivery_time || b.delivery_time || 999;
                return timeA - timeB;
            })[0];
        
        if (fastestOption) {
            priorityList.push(fastestOption);
            usedIds.add(fastestOption.id);
        }
        
        // 5. NOVO: Próximo frete mais barato na ordem (segunda opção mais barata)
        const secondCheapestOption = validOptions
            .filter(opt => !usedIds.has(opt.id))
            .sort((a, b) => {
                const priceA = a.custom_price || a.price || 0;
                const priceB = b.custom_price || b.price || 0;
                return priceA - priceB;
            })[0];
        
        if (secondCheapestOption) {
            priorityList.push(secondCheapestOption);
            usedIds.add(secondCheapestOption.id);
        }
        
        // NOVO: Ordenar por preço (mais barato primeiro)
        priorityList.sort((a, b) => {
            const priceA = (a.custom_price || a.price || 0) + this.taxaEmbalagem;
            const priceB = (b.custom_price || b.price || 0) + this.taxaEmbalagem;
            return priceA - priceB;
        });
        
        console.log('FreteManager: Opções prioritárias identificadas e ordenadas por preço:', priorityList.map(opt => {
            const info = this.getCompanyInfo(opt);
            const finalPrice = (opt.custom_price || opt.price || 0) + this.taxaEmbalagem;
            return `${info.displayName} - R$ ${finalPrice.toFixed(2)}`;
        }));
        
        return priorityList;
    }
    
    /**
     * NOVO: Cria botão "Ver mais opções" 
     */
    createShowMoreButton(container, extraCount) {
        // Remove botão existente se houver
        const existingButton = container.querySelector('.ver-mais-opcoes-container');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Cria container do botão
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ver-mais-opcoes-container';
        buttonContainer.innerHTML = `
            <button class="btn-ver-mais-opcoes" type="button">
                <span class="btn-text">Ver mais opções (${extraCount})</span>
                <div class="btn-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </button>
        `;
        
        // Cria container para as opções extras (similar ao banner do rodapé)
        const extraOptionsContainer = document.createElement('div');
        extraOptionsContainer.className = 'opcoes-extras-container';
        extraOptionsContainer.innerHTML = `
            <div class="opcoes-extras-grid" id="opcoes-extras-grid">
                <!-- Opções extras serão movidas para cá -->
            </div>
        `;
        
        // Adiciona botão e container ao DOM
        container.appendChild(buttonContainer);
        container.appendChild(extraOptionsContainer);
        
        // Move as opções extras para o container específico
        const extraOptions = container.querySelectorAll('.frete-opcao-extra');
        const extraGrid = extraOptionsContainer.querySelector('#opcoes-extras-grid');
        
        extraOptions.forEach(option => {
            option.style.display = 'flex'; // Restaura display
            extraGrid.appendChild(option);
        });
        
        // Adiciona event listener para toggle
        const button = buttonContainer.querySelector('.btn-ver-mais-opcoes');
        let isExpanded = false;
        
        button.addEventListener('click', (e) => {
            e.preventDefault(); // CORREÇÃO: Previne reload da página
            e.stopPropagation();
            
            const buttonText = button.querySelector('.btn-text');
            
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                // Expande opções
                button.classList.add('expandido');
                extraOptionsContainer.classList.add('expandido');
                buttonText.textContent = 'Ver menos opções';
                
                console.log('FreteManager: Opções extras expandidas');
            } else {
                // Recolhe opções
                button.classList.remove('expandido');
                extraOptionsContainer.classList.remove('expandido');
                buttonText.textContent = `Ver mais opções (${extraCount})`;
                
                console.log('FreteManager: Opções extras recolhidas');
            }
        });
        
        console.log(`FreteManager: Botão "Ver mais opções" criado com ${extraCount} opções extras`);
    }

    /**
     * NOVO: Cria botão "Ver mais opções" em estado de loading (sempre visível)
     */
    createShowMoreButtonLoading(container) {
        // Remove botão existente se houver
        const existingButton = container.querySelector('.ver-mais-opcoes-container');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Cria container do botão em estado loading
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ver-mais-opcoes-container loading';
        buttonContainer.innerHTML = `
            <button class="btn-ver-mais-opcoes loading" type="button" disabled>
                <span class="btn-text">Carregando opções</span>
                <div class="btn-arrow">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </button>
        `;
        
        container.appendChild(buttonContainer);
        
        console.log('FreteManager: Botão "Ver mais opções" criado em estado loading');
    }

    /**
     * NOVO: Cria botão "Ver mais opções" sem ação (quando não há opções extras)
     */
    createShowMoreButtonEmpty(container) {
        // Remove botão existente se houver
        const existingButton = container.querySelector('.ver-mais-opcoes-container');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Cria container do botão inativo
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ver-mais-opcoes-container empty';
        buttonContainer.innerHTML = `
            <button class="btn-ver-mais-opcoes empty" type="button" disabled>
                <span class="btn-text">Todas as opções exibidas</span>
                <div class="btn-arrow">
                    <i class="fas fa-check"></i>
                </div>
            </button>
        `;
        
        container.appendChild(buttonContainer);
        
        console.log('FreteManager: Botão "Ver mais opções" criado sem ação (todas opções exibidas)');
    }

    /**
     * NOVO: Gerencia o botão fixo "Ver mais opções"
     */
    updateFixedButton(state, extraCount = 0) {
        const button = document.getElementById('btn-ver-mais-opcoes-fixo');
        const buttonContainer = document.getElementById('ver-mais-opcoes-fixo');
        const buttonText = button?.querySelector('.btn-text');
        const buttonArrow = button?.querySelector('.btn-arrow i');
        
        if (!button || !buttonText || !buttonArrow || !buttonContainer) {
            console.error('FreteManager: Elementos do botão fixo não encontrados:', {
                button: !!button,
                buttonContainer: !!buttonContainer,
                buttonText: !!buttonText, 
                buttonArrow: !!buttonArrow
            });
            return;
        }
        
        // SEMPRE adiciona event listener se não existir (para todos os estados)
        if (!button.hasAttribute('data-listener-added')) {
            button.addEventListener('click', () => this.toggleFixedExtraOptions());
            button.setAttribute('data-listener-added', 'true');
            console.log('FreteManager: Event listener adicionado ao botão fixo');
        }
        
        // Remove todas as classes de estado
        button.classList.remove('loading', 'empty', 'active');
        buttonContainer.classList.remove('hidden');
        button.disabled = false;
        
        switch (state) {
            case 'loading':
                button.classList.add('loading');
                button.disabled = true;
                buttonText.textContent = 'Carregando opções';
                buttonArrow.className = 'fas fa-spinner fa-spin';
                break;
                
            case 'empty':
                button.classList.add('empty');
                button.disabled = true;
                buttonText.textContent = 'Todas as opções exibidas';
                buttonArrow.className = 'fas fa-check';
                break;
                
            case 'hidden':
                // NOVO: Estado oculto - mantém botão mas oculta completamente
                buttonContainer.classList.add('hidden');
                button.disabled = true;
                break;
                
            case 'active':
                button.classList.add('active');
                buttonText.textContent = 'Recolher opções';
                buttonArrow.className = 'fas fa-chevron-up';
                break;
                
            case 'normal':
            default:
                button.disabled = false;
                buttonText.textContent = extraCount > 0 ? `Ver mais ${extraCount} opções` : 'Ver mais opções';
                buttonArrow.className = 'fas fa-chevron-down';
                break;
        }
        
        console.log(`FreteManager: Botão fixo atualizado para estado: ${state}, extraCount: ${extraCount}`);
    }

    /**
     * NOVO: Toggle das opções extras do botão fixo
     */
    toggleFixedExtraOptions() {
        const button = document.getElementById('btn-ver-mais-opcoes-fixo');
        const container = document.getElementById('opcoes-extras-fixo');
        
        if (!button || !container) {
            console.error('FreteManager: Elementos do botão fixo não encontrados');
            return;
        }
        
        const isExpanded = container.classList.contains('expandido');
        const extraOptions = container.querySelectorAll('.bloco-opcao-frete');
        const extraCount = extraOptions.length;
        
        console.log('FreteManager: Toggle extras - Estado atual:', isExpanded ? 'expandido' : 'recolhido', `- ${extraCount} opções`);
        
        if (isExpanded) {
            // Recolher
            container.classList.remove('expandido');
            button.classList.remove('active');
            
            // Atualizar para estado normal
            this.updateFixedButton('normal', extraCount);
            
            console.log('FreteManager: Opções extras recolhidas');
        } else {
            // Expandir - só se houver opções extras
            if (extraCount > 0) {
                container.classList.add('expandido');
                button.classList.add('active');
                
                // Atualizar para estado ativo
                this.updateFixedButton('active', extraCount);
                
                console.log('FreteManager: Opções extras expandidas');
            } else {
                // Não há opções extras para expandir
                this.updateFixedButton('empty', 0);
                console.log('FreteManager: Nenhuma opção extra disponível');
            }
        }
    }

    /**
     * Cria um bloco de frete individual
     * REFORMADO: Estrutura HTML padronizada para altura consistente
     */
    createFreightBlock(option, blockId) {
        // Obtém informações da empresa (agora com dados oficiais)
        const companyInfo = this.getCompanyInfo(option);
        
        // Verifica se a opção está disponível
        const isAvailable = this.isOptionAvailable(option);
        
        // Cria elemento principal
        const block = document.createElement('div');
        block.className = `bloco-opcao-frete ${isAvailable ? '' : 'disabled'}`;
        block.id = blockId;
        block.setAttribute('data-option-id', option.id || 'unknown');
        block.setAttribute('data-api-option', 'true');
        block.setAttribute('data-official', companyInfo.isOfficial ? 'true' : 'false');
        
        if (isAvailable) {
            const finalPrice = (option.custom_price || option.price || 0) + this.taxaEmbalagem;
            console.log(`FreteManager: Aplicando taxa de embalagem na integração - Serviço ${option.id}: R$ ${(option.custom_price || option.price || 0).toFixed(2)} → R$ ${finalPrice.toFixed(2)}`);
            
            block.onclick = () => this.selectFreightOption(
                option.id || 'unknown', 
                finalPrice, 
                companyInfo.company || companyInfo.displayName
            );
            this.updateTooltip(block, 'Clique para selecionar esta opção');
        } else {
            this.updateTooltip(block, option.error || 'Frete indisponível para este destino');
        }
        
        // ✅ ESTRUTURA HTML PADRONIZADA - Sempre 4 linhas para altura consistente
        block.innerHTML = `
            <div class="frete-imagem">
                <i class="fas fa-truck" style="font-size: 2rem; color: ${isAvailable ? '#121F4B' : '#6c757d'};"></i>
            </div>
            <div class="frete-info">
                <div class="frete-empresa">${companyInfo.company || 'Transportadora'}</div>
                <div class="frete-modalidade">${companyInfo.service || 'Serviço Padrão'}</div>
                <div class="frete-preco">${this.formatPrice((option.custom_price || option.price || 0) + this.taxaEmbalagem, isAvailable)}</div>
                <div class="frete-prazo">${this.formatDeliveryTime(option.custom_delivery_time || option.delivery_time || 0, isAvailable)}</div>
            </div>
        `;
        
        return block;
    }
    
    /**
     * Cria bloco placeholder para manter layout consistente
     * ATUALIZADO: Estrutura HTML idêntica aos blocos reais
     */
    createPlaceholderBlock(blockId) {
        const block = document.createElement('div');
        block.className = 'bloco-opcao-frete disabled placeholder';
        block.id = blockId;
        block.setAttribute('data-api-option', 'true');
        block.setAttribute('data-placeholder', 'true');
        block.style.opacity = '0.3';
        block.style.pointerEvents = 'none';
        
        // ✅ ESTRUTURA HTML IDÊNTICA - Sempre 4 linhas
        block.innerHTML = `
            <div class="frete-imagem">
                <i class="fas fa-ellipsis-h" style="font-size: 1.5rem; color: #6c757d;"></i>
            </div>
            <div class="frete-info">
                <div class="frete-empresa">Aguardando seleção</div>
                <div class="frete-modalidade">Selecione produtos</div>
                <div class="frete-preco">-</div>
                <div class="frete-prazo">Aguarde</div>
            </div>
        `;
        
        return block;
    }

    /**
     * NOVO: Cria bloco skeleton com loader animado
     * ATUALIZADO: Estrutura HTML idêntica aos blocos reais
     */
    createSkeletonBlock(blockId) {
        const block = document.createElement('div');
        block.className = 'bloco-opcao-frete disabled skeleton-loading';
        block.id = blockId;
        block.setAttribute('data-skeleton', 'true');
        
        // ✅ ESTRUTURA HTML IDÊNTICA - Sempre 4 linhas
        block.innerHTML = `
            <div class="frete-imagem">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #6c757d;"></i>
            </div>
            <div class="frete-info">
                <div class="frete-empresa">Carregando...</div>
                <div class="frete-modalidade">Calculando opções</div>
                <div class="frete-preco">-</div>
                <div class="frete-prazo">Aguarde</div>
            </div>
        `;
        
        this.updateTooltip(block, 'Carregando opções de frete');
        
        return block;
    }
    
    /**
     * Obtém informações da empresa baseado nos dados oficiais da API
     * REFORMADO: Separar empresa e serviço claramente
     */
    getCompanyInfo(option) {
        const serviceId = option.id?.toString();
        
        // PRIORIDADE 1: Usar dados oficiais da API
        if (this.officialServices[serviceId]) {
            const officialData = this.officialServices[serviceId];
            
            return {
                company: officialData.company_name || 'Transportadora',
                service: officialData.name || '',
                displayName: `${officialData.company_name} - ${officialData.name}`.trim(),
                isOfficial: true,
                active: officialData.active
            };
        }
        
        // PRIORIDADE 2: Usar mapeamento legacy como fallback
        const legacyMapping = this.fallbackCompanyMapping[serviceId];
        if (legacyMapping) {
            console.warn(`FreteManager: Usando mapeamento legacy para serviço ${serviceId}`);
            return {
                company: legacyMapping.name,
                service: legacyMapping.service,
                displayName: `${legacyMapping.name} - ${legacyMapping.service}`,
                isOfficial: false,
                active: true
            };
        }
        
        // PRIORIDADE 3: Extrair da resposta da API de cotação
        let companyName = 'Transportadora';
        if (option.company) {
            if (typeof option.company === 'string') {
                companyName = option.company;
            } else if (option.company.name) {
                companyName = option.company.name;
            }
        }
        
        const service = option.name || option.service || '';
        
        console.warn(`FreteManager: Dados não encontrados para serviço ${serviceId}, extraindo da resposta`);
        return {
            company: companyName,
            service: service === 'undefined' ? '' : service, // Remove "undefined"
            displayName: service && service !== 'undefined' ? `${companyName} - ${service}` : companyName,
            isOfficial: false,
            active: true
        };
    }
    
    /**
     * Obtém ícone padrão baseado no nome da empresa
     */
    getDefaultIcon(company) {
        // CORRIGIDO: Verifica se company é string antes de usar toLowerCase
        if (!company || typeof company !== 'string') {
            return 'fas fa-truck'; // Ícone padrão se company não for string válida
        }
        
        const lowerCompany = company.toLowerCase();
        
        if (lowerCompany.includes('correios')) return 'fas fa-mail-bulk';
        if (lowerCompany.includes('jadlog')) return 'fas fa-truck-fast';
        if (lowerCompany.includes('azul')) return 'fas fa-plane';
        if (lowerCompany.includes('braspress')) return 'fas fa-truck';
        if (lowerCompany.includes('viabrasil')) return 'fas fa-truck-moving';
        
        return 'fas fa-truck'; // Ícone padrão
    }
    
    /**
     * Verifica se uma opção está disponível
     * MELHORADO: Considera dados oficiais
     */
    isOptionAvailable(option) {
        // Verificar se há erro na resposta da cotação
        if (option.error) {
            return false;
        }
        
        // CONFORME DOCUMENTAÇÃO OFICIAL: custom_price e custom_delivery_time são recomendados
        const hasValidPrice = (option.custom_price !== undefined && option.custom_price !== null && option.custom_price > 0) ||
                            (option.price !== undefined && option.price !== null && option.price > 0);
        
        // Verificar se serviço está ativo nos dados oficiais
        const serviceId = option.id?.toString();
        if (this.officialServices[serviceId]) {
            const isActive = this.officialServices[serviceId].active;
            if (!isActive) {
                console.log(`FreteManager: Serviço ${serviceId} inativo nos dados oficiais`);
                return false;
            }
        }
        
        return hasValidPrice;
    }
    
    /**
     * Formata preço para exibição
     */
    formatPrice(price, isAvailable) {
        if (!isAvailable) return 'Indisponível';
        if (!price || price <= 0) return 'Grátis';
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    /**
     * Formata tempo de entrega
     */
    formatDeliveryTime(days, isAvailable) {
        if (!isAvailable) return 'Indisponível';
        if (!days || days <= 0) return 'Consulte prazo';
        
        // Adiciona +2 dias úteis para separação em todos os fretes
        const totalDays = parseInt(days) + 2;
        
        return totalDays === 1 ? '1 dia útil' : `${totalDays} dias úteis`;
    }
    
    /**
     * Seleciona opção de frete (com TOGGLE e validações)
     * CORREÇÃO CRÍTICA: Garantir que dados sejam sempre salvos
     */
    selectFreightOption(optionId, price = 0, name = '') {
        console.log('FreteManager: Tentando selecionar opção:', optionId, 'Preço:', price);
        
        // CORREÇÃO: Busca elemento de forma mais específica para evitar conflitos
        let optionElement;
        if (optionId === 'retirada_escola') {
            optionElement = document.getElementById('opcao-retirada-escola');
        } else {
            // NOVO: Busca primeiro nos blocos principais, depois nos extras
            optionElement = document.querySelector(`#opcoes-frete-container [data-option-id="${optionId}"]`) ||
                           document.querySelector(`#opcoes-extras-grid-fixo [data-option-id="${optionId}"]`);
        }
        
        // Validação 1: Verifica se elemento existe e não está disabled
        if (!optionElement || optionElement.classList.contains('disabled')) {
            console.log('FreteManager: Opção disabled ou não encontrada, ignorando clique');
            return;
        }
        
        // NOVO: Log do elemento selecionado para debug
        const isMainBlock = optionElement.closest('#opcoes-frete-container') !== null;
        const isExtraBlock = optionElement.closest('#opcoes-extras-grid-fixo') !== null;
        console.log(`FreteManager: Elemento encontrado - Principal: ${isMainBlock}, Extra: ${isExtraBlock}, ID: ${optionElement.id}`);
        
        // Validação 2: Verifica se tem preço válido (exceto Retirada na Escola)
        if (optionId !== 'retirada_escola' && (!price || price <= 0)) {
            // Para opções da API, busca preço nos dados E APLICA TAXA DE EMBALAGEM
            const apiOption = this.currentApiOptions.find(opt => opt.id?.toString() === optionId?.toString());
            if (!apiOption || (apiOption.custom_price === undefined && apiOption.price === undefined)) {
                console.log('FreteManager: Preço não disponível para esta opção');
                return;
            }
            // CORREÇÃO: Aplicar taxa de embalagem no preço final
            const basePrice = apiOption.custom_price || apiOption.price;
            price = basePrice + this.taxaEmbalagem;
            name = name || this.getCompanyInfo(apiOption).displayName;
            console.log(`FreteManager: Preço com taxa aplicada: R$ ${basePrice.toFixed(2)} → R$ ${price.toFixed(2)}`);
        }
        
        // TOGGLE: Se já está selecionada, desseleciona
        if (this.selectedOption && this.selectedOption.id === optionId) {
            console.log('FreteManager: Desselecionando opção:', optionId);
            
            // CORREÇÃO: Remove seleção visual de TODOS os blocos (principais + extras)
            document.querySelectorAll('.bloco-opcao-frete').forEach(el => {
                el.classList.remove('selecionado');
            });
            
            // Limpa seleção
            this.selectedOption = null;
            this.updateHiddenFields();
            this.updateTotals();
            
            console.log('FreteManager: ✅ Seleção removida e campos atualizados');
            return;
        }
        
        // Seleciona nova opção
        console.log('FreteManager: Selecionando opção:', optionId, 'Preço:', price);
        
        // CORREÇÃO: Remove seleção anterior de TODOS os blocos (principais + extras)
        document.querySelectorAll('.bloco-opcao-frete').forEach(el => {
            el.classList.remove('selecionado');
        });
        
        // CORREÇÃO: Adiciona seleção apenas ao elemento clicado
        optionElement.classList.add('selecionado');
        
        // CORREÇÃO CRÍTICA: Capturar todos os dados necessários
        let optionDetails = null;
        
        if (optionId === 'retirada_escola') {
            optionDetails = {
                company: 'Escola',
                service: 'Retirada Local',
                display_name: 'Retirada na Escola',
                delivery_time: 0,
                delivery_range: window.freteConfig?.deliveryTime || 'até 7 dias',
                melhor_envio_id: null
            };
        } else {
            // Buscar dados completos da API
            const apiOption = this.currentApiOptions.find(opt => 
                opt.id?.toString() === optionId?.toString()
            );
            
            if (apiOption) {
                const companyInfo = this.getCompanyInfo(apiOption);
                
                // Extrair company e service do displayName
                let companyName = '';
                let serviceName = '';
                
                if (companyInfo && companyInfo.displayName) {
                    const parts = companyInfo.displayName.split(' - ');
                    if (parts.length >= 2) {
                        companyName = parts[0].trim();
                        serviceName = parts[1].trim();
                    } else {
                        companyName = companyInfo.displayName;
                        serviceName = apiOption.name || 'Serviço Padrão';
                    }
                } else {
                    // Fallback
                    companyName = apiOption.company?.name || apiOption.company || 'Transportadora';
                    serviceName = apiOption.name || 'Serviço';
                }
                
                optionDetails = {
                    company: companyName,
                    service: serviceName,
                    display_name: companyInfo?.displayName || `${companyName} - ${serviceName}`,
                    delivery_time: apiOption.custom_delivery_time || apiOption.delivery_time || 0,
                    delivery_range: this.formatDeliveryTime(
                        apiOption.custom_delivery_time || apiOption.delivery_time || 0, 
                        true
                    ),
                    melhor_envio_id: apiOption.id
                };
            }
        }
        
        this.selectedOption = {
            id: optionId,
            price: price,
            name: name || 'Frete selecionado',
            details: optionDetails  // NOVO: Salvar detalhes completos
        };
        
        // CRÍTICO: Forçar atualização imediata dos campos
        this.updateHiddenFields();
        this.updateTotals();
        
        // Log detalhado para debug
        console.log('FreteManager: ✅ Opção selecionada com sucesso:', {
            id: this.selectedOption.id,
            price: this.selectedOption.price,
            details: this.selectedOption.details,
            selectedElement: optionElement.id,
            isMainBlock,
            isExtraBlock,
            fields_updated: true
        });
        
        // VALIDAÇÃO ADICIONAL: Verificar se campos foram preenchidos
        setTimeout(() => {
            const freteOpcaoInput = document.getElementById('frete_opcao');
            const freteMelhorEnvioIdInput = document.getElementById('frete_melhor_envio_id');
            
            if (freteOpcaoInput && !freteOpcaoInput.value) {
                console.error('FreteManager: ❌ Campo frete_opcao não foi preenchido!');
            }
            
            if (optionId !== 'retirada_escola' && freteMelhorEnvioIdInput && !freteMelhorEnvioIdInput.value) {
                console.error('FreteManager: ❌ Campo frete_melhor_envio_id não foi preenchido!');
            }
            
            console.log('FreteManager: Validação final dos campos hidden:', {
                frete_opcao: freteOpcaoInput?.value,
                frete_melhor_envio_id: freteMelhorEnvioIdInput?.value,
                all_fields_ok: !!(freteOpcaoInput?.value && (optionId === 'retirada_escola' || freteMelhorEnvioIdInput?.value))
            });
            
            // NOVA: Salvar dados após seleção de frete
            if (typeof saveFormData === 'function') {
                console.log('FreteManager: Salvando dados após seleção de frete...');
                saveFormData();
            }
        }, 100);
    }
    
    /**
     * NOVA: Consolida volumes com empilhamento inteligente
     * Regras: Base = maior produto, máximo 4 unidades por volume
     */
    consolidateVolumes(products) {
        console.log('FreteManager: Iniciando consolidação inteligente de volumes');
        console.log('FreteManager: Produtos para consolidar:', products);
        
        // Validação inicial
        if (!products || products.length === 0) {
            console.warn('FreteManager: Nenhum produto para consolidar');
            return [];
        }
        
        // Expandir produtos com quantity > 1 em itens individuais
        const expandedProducts = [];
        products.forEach(product => {
            const productConfig = window.produtosConfig?.[product.id];
            if (!productConfig || !productConfig.dimensions) {
                console.warn(`FreteManager: Configuração ou dimensões não encontradas para produto ${product.id}`);
                return;
            }
            
            const dimensions = {
                width: productConfig.dimensions.width || 21,
                height: productConfig.dimensions.height || 28,
                length: productConfig.dimensions.length || 2,
                weight: productConfig.dimensions.weight || 0.8
            };
            
            // Validação de dimensões
            if (dimensions.width <= 0 || dimensions.height <= 0 || dimensions.length <= 0 || dimensions.weight <= 0) {
                console.warn(`FreteManager: Dimensões inválidas para produto ${product.id}:`, dimensions);
                return;
            }
            
            // Criar uma entrada para cada unidade
            for (let i = 0; i < product.quantity; i++) {
                expandedProducts.push({
                    id: product.id,
                    price: product.price || 0,
                    dimensions: dimensions,
                    area: dimensions.width * dimensions.length // Área da base
                });
            }
        });
        
        console.log(`FreteManager: ${expandedProducts.length} unidades individuais para consolidar`);
        
        // Validação: se não há produtos válidos, retornar array vazio
        if (expandedProducts.length === 0) {
            console.warn('FreteManager: Nenhum produto válido para consolidar após validações');
            return [];
        }
        
        // Ordenar por área da base (maior primeiro) para otimizar empilhamento
        expandedProducts.sort((a, b) => b.area - a.area);
        
        const volumes = [];
        const itemsPerVolume = 4; // Máximo 4 unidades por volume
        
        // Agrupar em volumes de até 4 unidades
        for (let i = 0; i < expandedProducts.length; i += itemsPerVolume) {
            const volumeItems = expandedProducts.slice(i, i + itemsPerVolume);
            
            // Calcular dimensões do volume
            const maxWidth = Math.max(...volumeItems.map(item => item.dimensions.width));
            const maxLength = Math.max(...volumeItems.map(item => item.dimensions.length));
            const totalHeight = volumeItems.reduce((sum, item) => sum + item.dimensions.height, 0);
            const totalWeight = volumeItems.reduce((sum, item) => sum + item.dimensions.weight, 0);
            const totalInsurance = volumeItems.reduce((sum, item) => sum + item.price, 0);
            
            console.log(`FreteManager: Volume ${volumes.length + 1}:`, {
                items: volumeItems.length,
                width: maxWidth,
                length: maxLength,
                height: totalHeight,
                weight: totalWeight,
                baseArea: maxWidth * maxLength
            });
            
            volumes.push({
                id: `volume_${volumes.length + 1}`,
                width: maxWidth,
                height: totalHeight,
                length: maxLength,
                weight: totalWeight,
                insurance_value: totalInsurance,
                quantity: 1 // Cada volume é uma unidade para a API
            });
        }
        
        console.log(`FreteManager: ✅ Consolidação concluída: ${volumes.length} volume(s) criado(s)`);
        
        // Debug: Log detalhado da consolidação para verificação
        volumes.forEach((volume, index) => {
            console.log(`FreteManager: Volume ${index + 1} - ${volume.width}x${volume.length}x${volume.height}cm, ${volume.weight}kg, R$${volume.insurance_value.toFixed(2)}`);
        });
        
        return volumes;
    }

    /**
     * Constrói payload para API Melhor Envio
     * REFORMADO: Usa consolidação inteligente de volumes
     */
    buildApiPayload(products) {
        // CORREÇÃO CRÍTICA: Usar CEP real do cliente para cotação precisa
        // A cotação deve ser feita com o CEP real para evitar discrepâncias de preço
        const fromCep = window.freteConfig?.originCep || "01310100"; // São Paulo (CEP da empresa)
        const toCep = this.cepDestino; // CEP REAL do cliente - OBRIGATÓRIO para preços corretos
        
        console.log('FreteManager: Construindo payload da API...');
        console.log('FreteManager: CEP origem:', fromCep);
        console.log('FreteManager: CEP destino:', toCep);
        console.log('FreteManager: this.cepDestino atual:', this.cepDestino);
        
        // DEBUG: Verificar campo CEP no DOM
        const cepInput = document.getElementById('entrega_cep');
        if (cepInput) {
            console.log('FreteManager: Campo CEP no DOM:', cepInput.value);
            console.log('FreteManager: Campo CEP limpo:', cepInput.value.replace(/\D/g, ''));
        } else {
            console.error('FreteManager: ❌ Campo entrega_cep não encontrado no DOM!');
        }
        
        // VALIDAÇÃO: Se não tem CEP do cliente, não pode calcular frete
        if (!toCep) {
            console.error('FreteManager: ❌ CEP de destino obrigatório para cotação precisa');
            console.error('FreteManager: Estado atual:', {
                cepDestino: this.cepDestino,
                cepInputValue: cepInput?.value,
                cepInputExists: !!cepInput
            });
            return null;
        }
        
        console.log(`FreteManager: ✅ Calculando frete de ${fromCep} para ${toCep}`);
        
        // NOVA: Usar consolidação inteligente de volumes
        const consolidatedVolumes = this.consolidateVolumes(products);
        
        // Validação: se a consolidação falhou, retornar null
        if (!consolidatedVolumes || consolidatedVolumes.length === 0) {
            console.error('FreteManager: ❌ Consolidação de volumes falhou - nenhum volume válido criado');
            return null;
        }
        
        console.log(`FreteManager: ✅ Payload criado com ${consolidatedVolumes.length} volume(s) consolidado(s)`);
        
        return {
            from: {
                postal_code: fromCep
            },
            to: {
                postal_code: toCep
            },
            products: consolidatedVolumes
        };
    }
    
    /**
     * Mostra erro da API
     * MELHORADO: Apenas limpa skeleton blocks, não mostra mensagem de erro
     */
    showApiError() {
        // Limpa skeleton blocks
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            const skeletonBlocks = container.querySelectorAll('[data-skeleton="true"]');
            skeletonBlocks.forEach(block => block.remove());
            console.log(`FreteManager: ${skeletonBlocks.length} blocos skeleton removidos`);
        }
        
        this.clearApiOptions();
        
        if (container) {
            // 🎯 ANTI-TREMIDA: Remove altura fixa
            setTimeout(() => {
                console.log('FreteManager: Removendo altura fixa');
                container.style.minHeight = '';
                container.style.transition = '';
                container.classList.remove('preserving-height');
            }, 300);
        }
        
        console.log('FreteManager: Limpeza concluída (sem exibir erro)');
    }
    
    /**
     * Atualiza tooltip de um elemento
     */
    updateTooltip(element, text) {
        if (element) {
            element.title = text;
        }
    }
    
    /**
     * Obtém produtos selecionados
     */
    getSelectedProducts() {
        const products = [];
        const quantityInputs = document.querySelectorAll('input[name^="quantidade"]');
        
        quantityInputs.forEach(input => {
            const quantity = parseInt(input.value) || 0;
            if (quantity > 0) {
                const produtoId = input.name.match(/quantidade\[(.+)\]/)[1];
                const productConfig = window.produtosConfig[produtoId];
                
                if (productConfig) {
                    products.push({
                        id: produtoId,
                        quantity: quantity,
                        price: productConfig.valorPix || productConfig.valorOriginal || 0
                    });
                }
            }
        });
        
        return products;
    }
    
    /**
     * Atualiza campos hidden com dados da seleção
     * SIMPLIFICADO v3.3: Usa detalhes já capturados na seleção
     */
    updateHiddenFields() {
        // Obtém ou cria campos hidden
        const freteValorInput = this.getOrCreateHiddenInput('frete_valor');
        const freteOpcaoInput = this.getOrCreateHiddenInput('frete_opcao');
        const freteCompanyInput = this.getOrCreateHiddenInput('frete_company');
        const freteServiceInput = this.getOrCreateHiddenInput('frete_service');
        const freteNomeCompletoInput = this.getOrCreateHiddenInput('frete_nome_completo');
        const freteDeliveryTimeInput = this.getOrCreateHiddenInput('frete_delivery_time');
        const freteDeliveryRangeInput = this.getOrCreateHiddenInput('frete_delivery_range');
        const freteMelhorEnvioIdInput = this.getOrCreateHiddenInput('frete_melhor_envio_id');
        
        if (this.selectedOption && this.selectedOption.details) {
            // Usar dados já capturados durante a seleção
            const details = this.selectedOption.details;
            
            // Campos básicos
            freteValorInput.value = this.selectedOption.price || 0;
            freteOpcaoInput.value = this.selectedOption.id || '';
            
            // Campos detalhados - usar dados já processados
            freteCompanyInput.value = details.company || '';
            freteServiceInput.value = details.service || '';
            freteNomeCompletoInput.value = details.display_name || '';
            freteDeliveryTimeInput.value = details.delivery_time || 0;
            freteDeliveryRangeInput.value = details.delivery_range || '';
            freteMelhorEnvioIdInput.value = details.melhor_envio_id || '';
            
            console.log('FreteManager: ✅ Campos hidden atualizados com dados já capturados:', {
                frete_valor: freteValorInput.value,
                frete_opcao: freteOpcaoInput.value,
                frete_company: freteCompanyInput.value,
                frete_service: freteServiceInput.value,
                frete_nome_completo: freteNomeCompletoInput.value,
                frete_delivery_time: freteDeliveryTimeInput.value,
                frete_delivery_range: freteDeliveryRangeInput.value,
                frete_melhor_envio_id: freteMelhorEnvioIdInput.value
            });
            
        } else if (this.selectedOption) {
            // Fallback se não tem detalhes (não deveria acontecer mais)
            console.warn('FreteManager: ⚠️ Seleção sem detalhes - usando dados básicos');
            
            freteValorInput.value = this.selectedOption.price || 0;
            freteOpcaoInput.value = this.selectedOption.id || '';
            
            // Limpar campos detalhados
            freteCompanyInput.value = '';
            freteServiceInput.value = '';
            freteNomeCompletoInput.value = '';
            freteDeliveryTimeInput.value = '';
            freteDeliveryRangeInput.value = '';
            freteMelhorEnvioIdInput.value = '';
            
        } else {
            // Limpar todos os campos quando não há seleção
            freteValorInput.value = 0;
            freteOpcaoInput.value = '';
            freteCompanyInput.value = '';
            freteServiceInput.value = '';
            freteNomeCompletoInput.value = '';
            freteDeliveryTimeInput.value = '';
            freteDeliveryRangeInput.value = '';
            freteMelhorEnvioIdInput.value = '';
            
            console.log('FreteManager: 🧹 Todos os campos hidden limpos (sem seleção)');
        }
    }
    
    /**
     * Obtém ou cria campo hidden
     * CORREÇÃO URGENTE v3.4: Garantir que campos existam no formulário correto
     */
    getOrCreateHiddenInput(fieldName) {
        let input = document.getElementById(fieldName);
        
        if (!input) {
            // Criar campo hidden se não existir
            input = document.createElement('input');
            input.type = 'hidden';
            input.id = fieldName;
            input.name = fieldName;
            
            // CORREÇÃO URGENTE: Buscar formulário por ID específico primeiro
            let form = document.getElementById('form-pagamento');
            if (!form) {
                form = document.querySelector('form');
            }
            
            if (form) {
                form.appendChild(input);
                console.log(`FreteManager: ✅ Campo hidden '${fieldName}' criado no formulário correto`);
            } else {
                console.error(`FreteManager: ❌ CRÍTICO - Formulário não encontrado! Campo '${fieldName}' não será capturado`);
                // EMERGÊNCIA: Criar form se não existir
                form = document.createElement('form');
                form.id = 'form-pagamento-emergency';
                form.style.display = 'none';
                document.body.appendChild(form);
                form.appendChild(input);
                console.log(`FreteManager: 🚨 Formulário emergencial criado para '${fieldName}'`);
            }
        }
        
        return input;
    }
    
    /**
     * Atualiza totais (integração com sistema existente)
     */
    updateTotals() {
        // Dispara evento para o sistema principal atualizar os totais
        const event = new CustomEvent('freteChanged', {
            detail: {
                value: this.selectedOption?.price || 0,
                option: this.selectedOption?.id || ''
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Mostra prompt de integração
     */
    showIntegrationPrompt(authUrl) {
        const container = document.getElementById('opcoes-frete-container');
        if (container) {
            // Cria bloco de integração
            const integrationBlock = document.createElement('div');
            integrationBlock.className = 'bloco-opcao-frete disabled';
            integrationBlock.setAttribute('data-api-option', 'true');
            integrationBlock.style.opacity = '0.9';
            integrationBlock.style.cursor = 'pointer';
            integrationBlock.onclick = () => window.open(authUrl, '_blank');
            integrationBlock.innerHTML = `
                <div class="frete-imagem">
                    <i class="fas fa-link" style="font-size: 2rem; color: #007bff;"></i>
                </div>
                <div class="frete-info">
                    <div class="frete-empresa">Integrar Melhor Envio</div>
                <div class="frete-modalidade">Clique para configurar</div>
                    <div class="frete-preco">Clique aqui</div>
                    <div class="frete-prazo">Para habilitar fretes automáticos</div>
                </div>
            `;
            
            container.appendChild(integrationBlock);
        }
    }
    
    /**
     * Ajusta o layout dos blocos de frete dinamicamente
     */
    adjustFreightLayout() {
        const container = document.getElementById('opcoes-frete-container');
        if (!container) return;
        
        // Considera apenas blocos prioritários (não incluindo opções extras)
        const blocks = container.querySelectorAll('.bloco-opcao-frete:not(#calculating-placeholder):not(.frete-opcao-extra)');
        const count = blocks.length;
        
        // Remove classes de layout anterior
        blocks.forEach(block => {
            block.style.maxWidth = '';
            block.style.flex = '';
        });
        
        // Aplica novo layout baseado na quantidade de blocos prioritários
        blocks.forEach(block => {
            if (count === 1) {
                // 1 bloco: ocupa toda a largura
                block.style.flex = '1 1 100%';
                block.style.maxWidth = 'none';
            } else if (count === 2) {
                // 2 blocos: cada um ocupa ~50%
                block.style.flex = '1 1 calc(50% - 10px)';
                block.style.maxWidth = 'none';
            } else {
                // 3+ blocos: tamanho fixo para uniformidade
                block.style.flex = '1 1 calc(50% - 10px)';
                block.style.maxWidth = '400px';
            }
        });
        
        console.log(`FreteManager: Layout ajustado para ${count} blocos prioritários`);
    }
    
    /**
     * Força seleção de opção de frete sem toggle (para restauração)
     * NOVO: Versão sem toggle para uso em restauração automática
     */
    forceSelectOption(optionId, price = 0, name = '') {
        console.log('FreteManager: Forçando seleção (sem toggle):', optionId, 'Preço:', price);
        
        // Busca elemento (pode ser API ou Retirada na Escola)
        let optionElement;
        if (optionId === 'retirada_escola') {
            optionElement = document.getElementById('opcao-retirada-escola');
        } else {
            optionElement = document.querySelector(`[data-option-id="${optionId}"]`);
        }
        
        // Validação: Verifica se elemento existe e não está disabled
        if (!optionElement || optionElement.classList.contains('disabled')) {
            console.log('FreteManager: Opção disabled ou não encontrada, ignorando forceSelect');
            return;
        }
        
        // Validação: Verifica se tem preço válido (exceto Retirada na Escola)
        if (optionId !== 'retirada_escola' && (!price || price <= 0)) {
            // Para opções da API, busca preço nos dados E APLICA TAXA DE EMBALAGEM
            const apiOption = this.currentApiOptions.find(opt => opt.id?.toString() === optionId?.toString());
            if (!apiOption || (apiOption.custom_price === undefined && apiOption.price === undefined)) {
                console.log('FreteManager: Preço não disponível para esta opção');
                return;
            }
            // CORREÇÃO: Aplicar taxa de embalagem no preço final
            const basePrice = apiOption.custom_price || apiOption.price;
            price = basePrice + this.taxaEmbalagem;
            name = name || this.getCompanyInfo(apiOption).displayName;
            console.log(`FreteManager: Preço com taxa aplicada: R$ ${basePrice.toFixed(2)} → R$ ${price.toFixed(2)}`);
        }
        
        // Remove seleção anterior
        document.querySelectorAll('.bloco-opcao-frete').forEach(el => {
            el.classList.remove('selecionado');
        });
        
        // Adiciona seleção atual
        optionElement.classList.add('selecionado');
        
        // Capturar todos os dados necessários
        let optionDetails = null;
        
        if (optionId === 'retirada_escola') {
            optionDetails = {
                company: 'Escola',
                service: 'Retirada Local',
                delivery_time: 0,
                delivery_range: window.freteConfig?.deliveryTime || 'até 7 dias',
                melhor_envio_id: null
            };
        } else {
            // Buscar dados completos da API
            const apiOption = this.currentApiOptions.find(opt => 
                opt.id?.toString() === optionId?.toString()
            );
            
            if (apiOption) {
                const companyInfo = this.getCompanyInfo(apiOption);
                
                // Extrair company e service do displayName
                let companyName = '';
                let serviceName = '';
                
                if (companyInfo && companyInfo.displayName) {
                    const parts = companyInfo.displayName.split(' - ');
                    if (parts.length >= 2) {
                        companyName = parts[0].trim();
                        serviceName = parts[1].trim();
                    } else {
                        companyName = companyInfo.displayName;
                        serviceName = apiOption.name || 'Serviço Padrão';
                    }
                } else {
                    // Fallback
                    companyName = apiOption.company?.name || apiOption.company || 'Transportadora';
                    serviceName = apiOption.name || 'Serviço';
                }
                
                optionDetails = {
                    company: companyName,
                    service: serviceName,
                    delivery_time: apiOption.custom_delivery_time || apiOption.delivery_time || 0,
                    delivery_range: this.formatDeliveryTime(
                        apiOption.custom_delivery_time || apiOption.delivery_time || 0, 
                        true
                    ),
                    melhor_envio_id: apiOption.id
                };
            }
        }
        
        this.selectedOption = {
            id: optionId,
            price: price,
            name: name || 'Frete selecionado',
            details: optionDetails
        };
        
        // Forçar atualização imediata dos campos
        this.updateHiddenFields();
        this.updateTotals();
        
        console.log('FreteManager: ✅ Seleção forçada com sucesso:', {
            id: this.selectedOption.id,
            price: this.selectedOption.price,
            details: this.selectedOption.details
        });
    }

    /**
     * NOVO: Verifica se uma opção extra (não principal) está selecionada
     * CORRIGIDO: Verifica se a opção selecionada DEVERIA estar nas extras após recálculo
     */
    isExtraOptionSelected() {
        if (!this.selectedOption) {
            return false;
        }
        
        // Se é "Retirada na Escola", não é opção extra
        if (this.selectedOption.id === 'retirada_escola') {
            return false;
        }
        
        // NOVO: Verifica se há uma opção selecionada que não seja "Retirada na Escola"
        // Isso indica que uma opção da API está selecionada, independente de onde ela estará após o recálculo
        const hasApiOptionSelected = this.selectedOption.id !== 'retirada_escola';
        
        if (hasApiOptionSelected) {
            // Verifica se a aba estava expandida antes do recálculo
            const container = document.getElementById('opcoes-extras-fixo');
            const wasExpanded = container ? container.classList.contains('expandido') : false;
            
            // Se estava expandida OU se a opção está atualmente nas extras, deve manter expandida
            if (wasExpanded) {
                console.log('FreteManager: Aba estava expandida, mantendo estado para opção:', this.selectedOption.id);
                return true;
            }
            
            // Verifica se está atualmente nas opções extras
            const extraContainer = document.getElementById('opcoes-extras-grid-fixo');
            if (extraContainer) {
                const extraOption = extraContainer.querySelector(`[data-option-id="${this.selectedOption.id}"]`);
                if (extraOption) {
                    console.log('FreteManager: Opção extra está selecionada:', this.selectedOption.id);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * NOVO: Salva o estado atual do container de opções extras
     */
    saveExtraOptionsState() {
        const container = document.getElementById('opcoes-extras-fixo');
        const button = document.getElementById('btn-ver-mais-opcoes-fixo');
        const extraContainer = document.getElementById('opcoes-extras-grid-fixo');
        
        // Conta quantas opções extras existem atualmente
        const extraCount = extraContainer ? extraContainer.querySelectorAll('.bloco-opcao-frete').length : 0;
        
        return {
            wasExpanded: container ? container.classList.contains('expandido') : false,
            buttonWasActive: button ? button.classList.contains('active') : false,
            extraCount: extraCount
        };
    }

    /**
     * NOVO: Restaura o estado do container de opções extras
     * MELHORADO: Mantém aberta se há opção da API selecionada, mesmo que tenha mudado de posição
     */
    restoreExtraOptionsState(savedState, extraCount = 0) {
        const container = document.getElementById('opcoes-extras-fixo');
        const button = document.getElementById('btn-ver-mais-opcoes-fixo');
        
        // NOVO: Verifica se há uma opção da API selecionada (não "Retirada na Escola")
        const hasApiOptionSelected = this.selectedOption && this.selectedOption.id !== 'retirada_escola';
        
        // Mantém expandida se:
        // 1. Estava expandida antes OU
        // 2. Há uma opção da API selecionada (independente de onde ela está agora)
        const shouldExpand = savedState.wasExpanded || hasApiOptionSelected;
        
        if (shouldExpand && container && button && extraCount > 0) {
            // Aguarda um pouco para garantir que as opções extras foram criadas
            setTimeout(() => {
                container.classList.add('expandido');
                button.classList.add('active');
                this.updateFixedButton('active', extraCount);
                
                if (hasApiOptionSelected) {
                    console.log('FreteManager: ✅ Aba mantida aberta - opção da API selecionada:', this.selectedOption.id);
                } else {
                    console.log('FreteManager: Estado expandido restaurado com', extraCount, 'opções extras');
                }
            }, 100);
        } else if (!shouldExpand) {
            console.log('FreteManager: Aba não expandida - nenhuma opção da API selecionada');
        }
    }

    /**
     * Força captura do CEP do campo se ainda não foi capturado
     */
    forceCaptureCep() {
        if (!this.cepDestino) {
            const cepInput = document.getElementById('entrega_cep');
            if (cepInput && cepInput.value) {
                const cep = cepInput.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    this.cepDestino = cep;
                    console.log('FreteManager: ✅ CEP capturado forçadamente:', cep);
                    return true;
                } else {
                    console.log('FreteManager: ⚠️ CEP no campo é inválido:', cep);
                }
            } else {
                console.log('FreteManager: ⚠️ Campo CEP vazio ou não encontrado');
            }
            return false;
        }
        return true; // Já tem CEP
    }
    
    /**
     * NOVO: Calcula quantidade total de produtos
     */
    getTotalQuantity(products) {
        if (!products || !Array.isArray(products)) return 0;
        return products.reduce((total, product) => total + (product.quantity || 0), 0);
    }
    
    /**
     * NOVO: Calcula preço da retirada na escola baseado na quantidade
     */
    calculateSchoolPrice(totalQuantity) {
        const basePrice = window.freteConfig?.basePrice || 0.00;
        const additionalPercentage = window.freteConfig?.additionalPercentage || 0.25;
        
        if (totalQuantity <= 0) return 0;
        
        // Nova fórmula: base_price + (base_price × additional_percentage/100 × (qty-1))
        const price = basePrice + (basePrice * (additionalPercentage / 100) * (totalQuantity - 1));
        return Math.max(0, price);
    }
}

// Inicializa o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.freteConfig && window.freteConfig.enabled) {
        window.freteManager = new FreteManager();
    }
});

// Função global para compatibilidade
function selecionarOpcaoFrete(optionId) {
    if (window.freteManager) {
        // Para "Retirada na Escola", calcula o preço com nova lógica
        if (optionId === 'retirada_escola') {
            const products = window.freteManager.getSelectedProducts();
            if (products.length > 0) {
                const totalItems = products.reduce((total, product) => total + product.quantity, 0);
                const basePrice = window.freteConfig?.basePrice || 0.00;
                const additionalPercentage = window.freteConfig?.additionalPercentage || 0.25;
                const price = basePrice + (basePrice * (additionalPercentage / 100) * (totalItems - 1)); // Nova fórmula
                
                window.freteManager.selectFreightOption(optionId, price, 'Retirada na Escola');
            }
        } else {
            window.freteManager.selectFreightOption(optionId);
        }
    }
}

// Função para obter valor atual do frete (compatibilidade)
function getValorFreteAtual() {
    if (window.freteManager && window.freteManager.selectedOption) {
        return window.freteManager.selectedOption.price || 0;
    }
    return 0;
} 