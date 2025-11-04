/**
 * Sistema de Cupons de Desconto - Loja Rápida
 * Gerenciamento completo de cupons com interface inline
 */

class CouponManager {
    constructor() {
        this.currentCoupon = null;
        this.isApplied = false;
        this.storeId = this.getStoreId();
        this.apiUrl = '/cupons/public/api.php';
        this.messageTimeout = null;
        
        // Estados da interface
        this.states = {
            CLOSED: 'closed',
            OPEN: 'open', 
            APPLIED: 'applied',
            ERROR: 'error'
        };
        this.currentState = this.states.CLOSED;
        
        this.init();
    }
    
    /**
     * Inicialização
     */
    init() {
        console.log('CouponManager: Inicializando sistema de cupons...');
        this.createCouponSection(); // Criar seção primeiro
        this.setupIntegrationWithExistingSystem();
    }
    
    /**
     * Obtém Store ID
     */
    getStoreId() {
        const metaTag = document.querySelector('meta[name="store-id"]');
        return metaTag ? metaTag.content : 'LOJA-MODELO';
    }
    
    /**
     * Cria a seção de cupom no carrinho
     */
    createCouponSection() {
        console.log('CouponManager: Tentando criar seção de cupom...');
        
        // Procurar pela seção do carrinho - várias tentativas
        let carrinhoItems = document.getElementById('carrinho-items');
        
        // Se não encontrou, tentar outros seletores
        if (!carrinhoItems) {
            carrinhoItems = document.querySelector('.carrinho-items');
        }
        
        // Se ainda não encontrou, tentar procurar pela seção carrinho
        if (!carrinhoItems) {
            const secaoCarrinho = document.querySelector('.secao-carrinho');
            if (secaoCarrinho) {
                carrinhoItems = secaoCarrinho.querySelector('div'); // Primeiro div dentro da seção
            }
        }
        
        // Se ainda não encontrou, tentar o quadro-pedido
        if (!carrinhoItems) {
            const quadroPedido = document.getElementById('quadro-pedido');
            if (quadroPedido) {
                // Procurar dentro do quadro pedido por um elemento que contenha os itens
                carrinhoItems = quadroPedido.querySelector('.carrinho-items') || 
                               quadroPedido.querySelector('[id*="carrinho"]') ||
                               quadroPedido;
            }
        }
        
        if (!carrinhoItems) {
            console.warn('CouponManager: Nenhum elemento de carrinho encontrado. Tentando novamente em 2 segundos...');
            // Tentar novamente após 2 segundos
            setTimeout(() => this.createCouponSection(), 2000);
            return;
        }
        
        // Verificar se já existe a seção de cupom
        if (document.getElementById('coupon-section')) {
            console.log('CouponManager: Seção de cupom já existe');
            return;
        }
        
        console.log('CouponManager: Elemento encontrado:', carrinhoItems);
        
        // Criar HTML da seção de cupom - DESIGN CLEAN E MODERNO
        const couponHTML = `
            <div class="coupon-section-clean" id="coupon-section">
                <!-- Estado Fechado: Botão pill com ícone + texto -->
                <div class="coupon-button-container-clean" id="coupon-button-container">
                    <button type="button" class="coupon-add-btn-clean" id="coupon-toggle-btn" title="Adicionar cupom de desconto">
                        <i class="fas fa-ticket-alt"></i>
                        <span class="coupon-btn-text">Adicionar cupom de desconto</span>
                        <!-- Código original com +, mantido inativo para retornar depois:
                        <i class="fas fa-plus"></i>
                        -->
                    </button>
                </div>
                
                <!-- Estado Aberto: Apenas campo de digitação clean -->
                <div class="coupon-input-container-clean" id="coupon-input-container" style="display: none;">
                    <input type="text" class="coupon-input-clean" id="coupon-input" placeholder="Digite o código do cupom" maxlength="20">
                    <button type="button" class="coupon-btn-clean coupon-close-btn-clean" id="coupon-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                    <button type="button" class="coupon-btn-clean coupon-apply-btn-clean" id="coupon-apply-btn">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                
                <!-- Estado Aplicado: Cupom fixado clean -->
                <div class="coupon-applied-container-clean" id="coupon-applied-container" style="display: none;">
                    <div class="coupon-applied-info-clean">
                        <i class="fas fa-check-circle"></i>
                        <span class="coupon-applied-text-clean" id="coupon-applied-text">Cupom aplicado</span>
                    </div>
                    <button type="button" class="coupon-btn-clean coupon-remove-btn-clean" id="coupon-remove-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Mensagens temporárias -->
                <div class="coupon-message-clean" id="coupon-message" style="display: none;"></div>
            </div>
            
            <!-- Campos hidden para dados do cupom -->
            <input type="hidden" id="cupom_codigo" name="cupom_codigo" value="">
            <input type="hidden" id="cupom_desconto_valor" name="cupom_desconto_valor" value="0">
            <input type="hidden" id="cupom_desconto_tipo" name="cupom_desconto_tipo" value="">
            <input type="hidden" id="cupom_id" name="cupom_id" value="">
            <input type="hidden" id="cupom_desconto_original" name="cupom_desconto_original" value="0">
            <input type="hidden" id="cupom_applies_to_shipping" name="cupom_applies_to_shipping" value="false">
        `;
        
        // Inserir após o último item do carrinho
        carrinhoItems.insertAdjacentHTML('beforeend', couponHTML);
        
        // Inserir CSS moderno
        this.insertCleanCouponCSS();
        
        console.log('CouponManager: Seção de cupom criada com sucesso!');
        
        // Configurar eventos imediatamente após criar a seção
        this.setupEventListeners();
        
        // IMPORTANTE: Se há um cupom aplicado, mostrar o estado aplicado
        if (this.isApplied && this.currentCoupon) {
            setTimeout(() => {
                this.showAppliedState(this.currentCoupon.code);
                console.log('CouponManager: Estado aplicado restaurado após recriar seção');
            }, 100);
        }
    }
    
    /**
     * Insere CSS moderno e clean para os cupons
     */
    insertCleanCouponCSS() {
        // Verificar se o CSS já foi inserido
        if (document.getElementById('coupon-clean-css')) {
            return;
        }
        
        const css = `
            <style id="coupon-clean-css">
                /* SEÇÃO DE CUPOM CLEAN */
                .coupon-section-clean {
                    margin: 15px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                /* BOTÃO PRINCIPAL - Formato pill com ícone + texto */
                .coupon-button-container-clean {
                    display: flex;
                    justify-content: center;
                }
                
                .coupon-add-btn-clean {
                    background: #ffffff;
                    border: 2px solid #1e3a8a;
                    color: #1e3a8a;
                    border-radius: 25px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(30, 58, 138, 0.1);
                }
                
                .coupon-add-btn-clean:hover {
                    background: #f97316;
                    border-color: #f97316;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
                }
                
                .coupon-add-btn-clean i {
                    font-size: 16px;
                }
                
                .coupon-btn-text {
                    font-size: 14px;
                    font-weight: 600;
                    white-space: nowrap;
                }
                
                /* CONTAINER DE INPUT CLEAN - SEM FUNDO */
                .coupon-input-container-clean {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                /* INPUT CLEAN */
                .coupon-input-clean {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #1e3a8a;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    background: #ffffff;
                    color: #333;
                    outline: none;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                }
                
                .coupon-input-clean:focus {
                    border-color: #1e3a8a;
                    box-shadow: none;
                }
                
                .coupon-input-clean::placeholder {
                    color: #64748b;
                    text-transform: none;
                    font-weight: 400;
                }
                
                /* BOTÕES DE AÇÃO CLEAN */
                .coupon-btn-clean {
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }
                
                .coupon-close-btn-clean {
                    background: #dc2626;
                    color: #ffffff;
                }
                
                .coupon-close-btn-clean:hover {
                    background: #b91c1c;
                    transform: translateY(-1px);
                }
                
                .coupon-apply-btn-clean {
                    background: #16a34a;
                    color: white;
                }
                
                .coupon-apply-btn-clean:hover {
                    background: #15803d;
                    transform: translateY(-1px);
                }
                
                .coupon-remove-btn-clean {
                    background: #dc2626;
                    color: white;
                }
                
                .coupon-remove-btn-clean:hover {
                    background: #b91c1c;
                }
                
                /* ESTADO APLICADO CLEAN */
                .coupon-applied-container-clean {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #16a34a;
                    border: 1px solid #15803d;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-top: 10px;
                }
                
                .coupon-applied-info-clean {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ffffff;
                    font-weight: 600;
                }
                
                .coupon-applied-info-clean i {
                    color: #ffffff;
                }
                
                /* MENSAGENS CLEAN */
                .coupon-message-clean {
                    margin-top: 8px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .coupon-message-clean.coupon-message-success {
                    background: #16a34a;
                    color: #ffffff;
                    border: 1px solid #15803d;
                }
                
                .coupon-message-clean.coupon-message-error {
                    background: #dc2626;
                    color: #ffffff;
                    border: 1px solid #b91c1c;
                }
                
                .coupon-message-clean.coupon-message-info {
                    background: #1e3a8a;
                    color: #ffffff;
                    border: 1px solid #1e40af;
                }
                
                /* RESPONSIVO */
                @media (max-width: 768px) {
                    .coupon-button-container-clean {
                        justify-content: center;
                    }
                    
                    .coupon-add-btn-clean {
                        padding: 8px 16px;
                        font-size: 13px;
                    }
                    
                    .coupon-add-btn-clean i {
                        font-size: 14px;
                    }
                    
                    .coupon-btn-text {
                        font-size: 13px;
                    }
                    
                    .coupon-input-clean {
                        padding: 10px 14px;
                        font-size: 13px;
                    }
                    
                    .coupon-btn-clean {
                        width: 36px;
                        height: 36px;
                        font-size: 14px;
                    }
                    
                    .coupon-applied-container-clean {
                        padding: 10px 12px;
                    }
                }
            </style>
        `;
        
        // Inserir CSS no head
        document.head.insertAdjacentHTML('beforeend', css);
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // Botão para abrir campo
            const toggleBtn = document.getElementById('coupon-toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.openCouponInput());
            }
            
            // Botão para fechar campo
            const closeBtn = document.getElementById('coupon-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeCouponInput());
            }
            
            // Botão para aplicar cupom
            const applyBtn = document.getElementById('coupon-apply-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => this.applyCouponFromInput());
            }
            
            // Botão para remover cupom
            const removeBtn = document.getElementById('coupon-remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeCoupon());
            }
            
            // Input do cupom (Enter para aplicar)
            const input = document.getElementById('coupon-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyCouponFromInput();
                    }
                });
                
                // Formatar input (maiúsculo)
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toUpperCase();
                });
            }
        }, 500);
    }
    
    /**
     * Abre o campo de digitação do cupom
     */
    openCouponInput() {
        const buttonContainer = document.getElementById('coupon-button-container');
        const inputContainer = document.getElementById('coupon-input-container');
        const input = document.getElementById('coupon-input');
        
        if (buttonContainer && inputContainer) {
            buttonContainer.style.display = 'none';
            inputContainer.style.display = 'flex';
            this.currentState = this.states.OPEN;
            
            // Focar no input
            setTimeout(() => {
                if (input) input.focus();
            }, 100);
        }
    }
    
    /**
     * Fecha o campo de digitação do cupom
     */
    closeCouponInput() {
        const buttonContainer = document.getElementById('coupon-button-container');
        const inputContainer = document.getElementById('coupon-input-container');
        const input = document.getElementById('coupon-input');
        
        if (buttonContainer && inputContainer) {
            inputContainer.style.display = 'none';
            buttonContainer.style.display = 'flex';
            this.currentState = this.states.CLOSED;
            
            // Limpar input
            if (input) input.value = '';
        }
    }
    
    /**
     * Aplica cupom a partir do input
     */
    async applyCouponFromInput() {
        const input = document.getElementById('coupon-input');
        if (!input) return;
        
        const code = input.value.trim();
        if (!code) {
            this.showMessage('Digite um código de cupom', 'error');
            return;
        }
        
        // Mostrar loading
        const applyBtn = document.getElementById('coupon-apply-btn');
        const originalHTML = applyBtn.innerHTML;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        applyBtn.disabled = true;
        
        try {
            await this.applyCoupon(code);
        } finally {
            // Restaurar botão
            applyBtn.innerHTML = originalHTML;
            applyBtn.disabled = false;
        }
    }
    
    /**
     * Aplica um cupom
     */
    async applyCoupon(code) {
        try {
            // Obter valores atuais do pedido
            const orderValues = this.getOrderValues();
            
            console.log('CouponManager: Aplicando cupom', {
                code,
                orderValues
            });
            
            // Chamar API para validar cupom (sem registrar uso)
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Store-ID': this.storeId
                },
                body: JSON.stringify({
                    action: 'validate_only',
                    code: code,
                    order_value: orderValues.total,
                    products_value: orderValues.products,
                    shipping_value: orderValues.shipping,
                    store_id: this.storeId
                })
            });
            
            const result = await response.json();
            

            
            if (result.success && result.coupon && result.discount) {
                // Cupom válido - aplicar
                this.handleValidCoupon(code, result.coupon, result.discount);
            } else {
                // Cupom inválido - mas manter na interface
                this.handleInvalidCoupon(code, result.error || 'Código de cupom inválido');
            }
            
        } catch (error) {
            console.error('CouponManager: Erro ao aplicar cupom:', error);
            this.handleInvalidCoupon(code, 'Erro ao verificar cupom. Tente novamente.');
        }
    }
    
    /**
     * Lida com cupom válido
     */
    handleValidCoupon(code, couponData, discountData) {
        console.log('CouponManager: Cupom válido aplicado', { code, couponData, discountData });
        
        // Salvar dados do cupom
        this.currentCoupon = {
            code: code,
            id: couponData.id,
            type: couponData.type,
            value: couponData.value,
            discountAmount: discountData.discount_amount,
            originalValue: discountData.original_value,
            appliesToShipping: couponData.applies_to_shipping || false,
            description: couponData.description || ''
        };
        this.isApplied = true;
        
        // Atualizar campos hidden
        this.updateHiddenFields();
        
        // Mostrar estado aplicado
        this.showAppliedState(code);
        
        // Mostrar mensagem de sucesso
        const discountText = couponData.type === 'percentage' 
            ? `${couponData.value}%` 
            : `R$ ${couponData.value.toFixed(2).replace('.', ',')}`;
        this.showMessage(`Cupom ${code} aplicado! Desconto de ${discountText}`, 'success');
        
        // Triggerar recálculo dos totais
        this.triggerRecalculation();
    }
    
    /**
     * Lida com cupom inválido
     */
    handleInvalidCoupon(code, errorMessage) {
        console.log('CouponManager: Cupom inválido', { code, errorMessage });
        
        // Salvar dados do cupom inválido (para manter fixado)
        this.currentCoupon = {
            code: code,
            id: '',
            type: '',
            value: 0,
            discountAmount: 0,
            originalValue: 0,
            appliesToShipping: false,
            description: '',
            isInvalid: true
        };
        this.isApplied = false; // Não aplicado, mas fixado
        
        // Atualizar campos hidden
        this.updateHiddenFields();
        
        // Mostrar estado aplicado (mesmo sendo inválido)
        this.showAppliedState(code);
        
        // Mostrar mensagem de erro
        this.showMessage(`Cupom ${code} - ${errorMessage}`, 'error');
    }
    
    /**
     * Mostra o estado de cupom aplicado/fixado
     */
    showAppliedState(code) {
        const buttonContainer = document.getElementById('coupon-button-container');
        const inputContainer = document.getElementById('coupon-input-container');
        const appliedContainer = document.getElementById('coupon-applied-container');
        const appliedText = document.getElementById('coupon-applied-text');
        
        if (buttonContainer && inputContainer && appliedContainer && appliedText) {
            // Ocultar outros estados
            buttonContainer.style.display = 'none';
            inputContainer.style.display = 'none';
            
            // Mostrar estado aplicado
            appliedContainer.style.display = 'flex';
            appliedText.textContent = `Cupom ${code} aplicado`;
            
            this.currentState = this.states.APPLIED;
        }
    }
    
    /**
     * Remove o cupom
     */
    removeCoupon() {
        if (!this.currentCoupon) return;
        
        const code = this.currentCoupon.code;
        
        // Limpar dados
        this.currentCoupon = null;
        this.isApplied = false;
        
        // Limpar campos hidden
        this.clearHiddenFields();
        
        // Voltar ao estado inicial
        this.showClosedState();
        
        // Mostrar mensagem de remoção
        this.showMessage(`Cupom ${code} removido`, 'error');
        
        // Triggerar recálculo dos totais
        this.triggerRecalculation();
    }
    
    /**
     * Mostra o estado fechado (inicial)
     */
    showClosedState() {
        const buttonContainer = document.getElementById('coupon-button-container');
        const inputContainer = document.getElementById('coupon-input-container');
        const appliedContainer = document.getElementById('coupon-applied-container');
        const input = document.getElementById('coupon-input');
        
        if (buttonContainer && inputContainer && appliedContainer) {
            // Mostrar apenas o botão inicial
            buttonContainer.style.display = 'flex';
            inputContainer.style.display = 'none';
            appliedContainer.style.display = 'none';
            
            // Limpar input
            if (input) input.value = '';
            
            this.currentState = this.states.CLOSED;
        }
    }
    
    /**
     * Mostra mensagem temporária - VERSÃO CLEAN
     */
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('coupon-message');
        if (!messageEl) return;
        
        // Limpar timeout anterior
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Configurar classe CSS baseada no tipo (versão clean)
        messageEl.className = `coupon-message-clean coupon-message-${type}`;
        messageEl.textContent = text;
        messageEl.style.display = 'block';
        
        // Ocultar após 4 segundos
        this.messageTimeout = setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }
    
    /**
     * Obtém valores atuais do pedido
     */
    getOrderValues() {
        // Obter valor dos produtos
        let productsValue = 0;
        const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'pix';
        
        // Calcular valor dos produtos selecionados
        document.querySelectorAll('input[name^="quantidade"]').forEach(input => {
            const quantidade = parseInt(input.value) || 0;
            if (quantidade > 0) {
                const match = input.name.match(/quantidade\[(.*?)\]/);
                if (match && match[1] && window.produtosConfig && window.produtosConfig[match[1]]) {
                    const produto = window.produtosConfig[match[1]];
                    const valor = formaPagamento === 'pix' ? produto.valorPix : produto.valorCartao;
                    productsValue += quantidade * valor;
                }
            }
        });
        
        // Obter valor do frete
        let shippingValue = 0;
        if (typeof getValorFreteAtual === 'function') {
            shippingValue = getValorFreteAtual();
        } else {
            const freteInput = document.getElementById('frete_valor');
            if (freteInput) {
                shippingValue = parseFloat(freteInput.value) || 0;
            }
        }
        
        const totalValue = productsValue + shippingValue;
        
        console.log('CouponManager: Valores obtidos', {
            products: productsValue,
            shipping: shippingValue,
            total: totalValue,
            paymentMethod: formaPagamento
        });
        
        return {
            products: productsValue,
            shipping: shippingValue,
            total: totalValue
        };
    }
    
        /**
     * Calcula desconto baseado no cupom atual - VERSÃO CORRIGIDA DUAL
     */
    calculateCurrentDiscount() {
        if (!this.currentCoupon || !this.isApplied) {
            return { pix: 0, cartao: 0 };
        }

        // Obter valores separados para PIX e cartão
        const orderValues = this.getOrderValuesSeparated();
        
        let discountPix = 0;
        let discountCartao = 0;
        
        // Calcular desconto para PIX
        let baseValuePix = orderValues.totalPix;
        if (!this.currentCoupon.appliesToShipping) {
            baseValuePix = orderValues.productsPix;
        }
        
        if (this.currentCoupon.type === 'percentage') {
            discountPix = (baseValuePix * this.currentCoupon.value) / 100;
        } else if (this.currentCoupon.type === 'fixed_amount') {
            discountPix = Math.min(this.currentCoupon.value, baseValuePix);
        }
        
        // Calcular desconto para cartão
        let baseValueCartao = orderValues.totalCartao;
        if (!this.currentCoupon.appliesToShipping) {
            baseValueCartao = orderValues.productsCartao;
        }
        
        if (this.currentCoupon.type === 'percentage') {
            discountCartao = (baseValueCartao * this.currentCoupon.value) / 100;
        } else if (this.currentCoupon.type === 'fixed_amount') {
            discountCartao = Math.min(this.currentCoupon.value, baseValueCartao);
        }
        
        // Garantir que descontos não sejam maiores que os totais
        discountPix = Math.min(discountPix, orderValues.totalPix);
        discountCartao = Math.min(discountCartao, orderValues.totalCartao);
        
        return {
            pix: Math.max(0, discountPix),
            cartao: Math.max(0, discountCartao)
        };
    }
    
    /**
     * Obter valores separados para PIX e cartão - NOVA FUNÇÃO
     */
    getOrderValuesSeparated() {
        let productsValuePix = 0;
        let productsValueCartao = 0;
        
        // Calcular valor dos produtos para PIX e cartão separadamente
        document.querySelectorAll('input[name^="quantidade"]').forEach(input => {
            const quantidade = parseInt(input.value) || 0;
            if (quantidade > 0) {
                const match = input.name.match(/quantidade\[(.*?)\]/);
                if (match && match[1] && window.produtosConfig && window.produtosConfig[match[1]]) {
                    const produto = window.produtosConfig[match[1]];
                    productsValuePix += quantidade * produto.valorPix;
                    productsValueCartao += quantidade * produto.valorCartao;
                }
            }
        });
        
        // Obter valor do frete
        let shippingValue = 0;
        if (typeof getValorFreteAtual === 'function') {
            shippingValue = getValorFreteAtual();
        } else {
            const freteInput = document.getElementById('frete_valor');
            if (freteInput) {
                shippingValue = parseFloat(freteInput.value) || 0;
            }
        }
        
        const totalValuePix = productsValuePix + shippingValue;
        const totalValueCartao = productsValueCartao + shippingValue;
        
        console.log('CouponManager: Valores separados obtidos', {
            productsPix: productsValuePix,
            productsCartao: productsValueCartao,
            shipping: shippingValue,
            totalPix: totalValuePix,
            totalCartao: totalValueCartao
        });
        
        return {
            productsPix: productsValuePix,
            productsCartao: productsValueCartao,
            shipping: shippingValue,
            totalPix: totalValuePix,
            totalCartao: totalValueCartao
        };
    }
    
    /**
     * Atualiza campos hidden com dados do cupom - VERSÃO CORRIGIDA
     */
    updateHiddenFields() {
        if (!this.currentCoupon) return;
        
        // Calcular desconto atual (dual) se cupom válido
        let discountAmount = 0;
        if (this.isApplied && !this.currentCoupon.isInvalid) {
            const discounts = this.calculateCurrentDiscount();
            // Para os campos hidden, usar o valor PIX como referência (padrão do sistema)
            discountAmount = discounts.pix;
        }
        
        const fields = {
            'cupom_codigo': this.currentCoupon.code,
            'cupom_desconto_valor': discountAmount.toFixed(2),
            'cupom_desconto_tipo': this.currentCoupon.type,
            'cupom_id': this.currentCoupon.id,
            'cupom_desconto_original': this.currentCoupon.value.toString(),
            'cupom_applies_to_shipping': this.currentCoupon.appliesToShipping ? 'true' : 'false'
        };
        
        Object.entries(fields).forEach(([fieldName, value]) => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.value = value;
            }
        });
    }
    
    /**
     * Limpa campos hidden
     */
    clearHiddenFields() {
        const fieldNames = [
            'cupom_codigo', 'cupom_desconto_valor', 'cupom_desconto_tipo',
            'cupom_id', 'cupom_desconto_original', 'cupom_applies_to_shipping'
        ];
        
        fieldNames.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.value = fieldName === 'cupom_desconto_valor' ? '0' : '';
                if (fieldName === 'cupom_applies_to_shipping') {
                    field.value = 'false';
                }
            }
        });
    }
    
    /**
     * Integração com sistema existente
     */
    setupIntegrationWithExistingSystem() {
        // Criar referência global
        window.couponManager = this;
        
        console.log('CouponManager: Integração configurada');
    }
    
    /**
     * Triggera recálculo dos totais
     */
    triggerRecalculation() {
        // Aguardar um pouco para garantir que campos foram atualizados
        setTimeout(() => {
            // Atualizar carrinho visual primeiro
            if (typeof atualizarCarrinho === 'function') {
                console.log('CouponManager: Triggerando atualizarCarrinho()');
                atualizarCarrinho();
            }
            
            // Depois atualizar totais
            if (typeof atualizarTotais === 'function') {
                console.log('CouponManager: Triggerando atualizarTotais()');
                atualizarTotais(true); // true para evitar recálculo de frete
            } else if (typeof atualizarValores === 'function') {
                console.log('CouponManager: Triggerando atualizarValores()');
                atualizarValores();
            }
        }, 100);
    }
    
    /**
     * Método chamado quando valores do pedido mudam (para reaplicação) - CORRIGIDO
     */
    onOrderValuesChange() {
        if (this.isApplied && this.currentCoupon && !this.currentCoupon.isInvalid) {
            console.log('CouponManager: Valores mudaram, reaplicando cupom...');
            // Recalcular desconto com novos valores
            const newDiscounts = this.calculateCurrentDiscount();
            console.log('Novos descontos calculados:', newDiscounts);
            this.updateHiddenFields();
            
            // Atualizar carrinho visual para refletir novo desconto
            setTimeout(() => {
                if (typeof atualizarCarrinho === 'function') {
                    console.log('CouponManager: Atualizando carrinho após mudança de valores');
                    atualizarCarrinho();
                }
            }, 50);
            
            // IMPORTANTE: Garantir que o estado aplicado continue visível
            setTimeout(() => {
                const appliedContainer = document.getElementById('coupon-applied-container');
                if (appliedContainer && appliedContainer.style.display !== 'flex') {
                    this.showAppliedState(this.currentCoupon.code);
                    console.log('CouponManager: Estado aplicado restaurado após mudança de valores');
                }
            }, 200);
        }
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        if (!window.couponManager) {
            window.couponManager = new CouponManager();
        }
    }, 1000);
});

// Aguardar que o carrinho seja atualizado para inserir o cupom
if (typeof window.atualizarCarrinho === 'function') {
    const originalAtualizarCarrinho = window.atualizarCarrinho;
    window.atualizarCarrinho = function() {
        originalAtualizarCarrinho.apply(this, arguments);
        
        // Após atualizar o carrinho, verificar se precisa inserir o cupom
        setTimeout(() => {
            if (window.couponManager && !document.getElementById('coupon-section')) {
                const secaoCarrinho = document.getElementById('secao-carrinho');
                if (secaoCarrinho && secaoCarrinho.style.display !== 'none') {
                    window.couponManager.createCouponSection();
                }
            }
        }, 100);
    };
}

// Exportar para uso global
window.CouponManager = CouponManager; 