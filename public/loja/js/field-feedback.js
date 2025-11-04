/**
 * SISTEMA UNIFICADO DE FEEDBACK VISUAL PARA CAMPOS
 * Aplica feedback visual Google-style baseado no estado dos campos
 */

// ========== CONFIGURAÇÃO ========== //

const FIELD_FEEDBACK = {
    // Classes CSS para os estados
    CLASSES: {
        VALID: 'campo-valido',
        INVALID: 'campo-invalido',
        NEUTRAL: 'campo-neutro'
    },
    
    // Seletores para diferentes tipos de campos
    SELECTORS: {
        STANDARD: 'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input[type="search"], select, textarea',
        PHONE_CONTAINER: '.phone-input-container',
        PHONE_INPUT: '.phone-number-input',
        CUSTOM_DROPDOWN: '.custom-dropdown',
        DROPDOWN_SELECTED: '.dropdown-selected'
    },
    
    // Validadores personalizados
    VALIDATORS: {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        cpf: (value) => {
            const cleaned = value.replace(/[^\d]/g, '');
            if (cleaned.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(cleaned)) return false;
            
            // Validação dos dígitos verificadores
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(cleaned[i]) * (10 - i);
            }
            let resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(cleaned[9])) return false;
            
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(cleaned[i]) * (11 - i);
            }
            resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            return resto === parseInt(cleaned[10]);
        },
        phone: (value) => {
            const cleaned = value.replace(/[^\d]/g, '');
            return cleaned.length >= 10 && cleaned.length <= 11;
        },
        required: (value) => value.trim().length > 0,
        minLength: (value, min) => value.trim().length >= min
    }
};

// ========== FUNÇÕES PRINCIPAIS ========== //

/**
 * Verifica se campos de filhos precisam ser mostrados após reload
 */
function checkAndShowChildrenFields() {
    const qtdFilhosSelect = document.getElementById('qtd_filhos');
    const camposFilhosContainer = document.getElementById('campos-filhos');
    
    if (!qtdFilhosSelect || !camposFilhosContainer) {
        return;
    }
    
    const qtdFilhos = parseInt(qtdFilhosSelect.value) || 0;
    const camposVisíveis = camposFilhosContainer.classList.contains('visible');
    const temCampos = camposFilhosContainer.querySelectorAll('.filho-container').length > 0;
    
    if (qtdFilhos > 0 && (!camposVisíveis || !temCampos)) {
        console.log('🔧 Campos de filhos precisam ser criados - qtd:', qtdFilhos);
        
        // Usar função existente do sistema
        if (typeof window.forcarMostrarCamposFilhos === 'function') {
            window.forcarMostrarCamposFilhos();
            console.log('✅ Campos de filhos forçados via forcarMostrarCamposFilhos()');
        } else if (typeof window.mostrarCamposFilhos === 'function') {
            window.mostrarCamposFilhos();
            console.log('✅ Campos de filhos forçados via mostrarCamposFilhos()');
        } else {
            console.log('⚠️ Funções de filhos não disponíveis ainda - tentando novamente...');
            // Tentar novamente após delay
            setTimeout(checkAndShowChildrenFields, 200);
        }
    }
}

/**
 * Aplica feedback visual a um campo
 * @param {Element} element - Elemento do campo
 * @param {string} state - Estado: 'valid', 'invalid', ou 'neutral'
 */
function applyFieldFeedback(element, state) {
    if (!element) return;
    
    const { VALID, INVALID, NEUTRAL } = FIELD_FEEDBACK.CLASSES;
    
    // Remove todas as classes de estado
    element.classList.remove(VALID, INVALID, NEUTRAL);
    
    // Aplica a nova classe
    switch (state) {
        case 'valid':
            element.classList.add(VALID);
            break;
        case 'invalid':
            element.classList.add(INVALID);
            break;
        case 'neutral':
        default:
            element.classList.add(NEUTRAL);
            break;
    }
    
    console.log(`Feedback aplicado: ${element.id || element.name || 'elemento'} -> ${state}`);
}

/**
 * Determina o estado de um campo baseado em seu valor e validadores
 * @param {Element} element - Elemento do campo
 * @param {*} value - Valor atual do campo
 * @returns {string} Estado: 'valid', 'invalid', ou 'neutral'
 */
function determineFieldState(element, value) {
    // Se está vazio, é neutro
    if (!value || value.toString().trim() === '') {
        return 'neutral';
    }
    
    // Validação baseada no tipo/ID do campo
    const fieldId = element.id;
    const fieldType = element.type || element.tagName.toLowerCase();
    const isRequired = element.hasAttribute('required');
    
    // Validações específicas por ID
    if (fieldId === 'cpf' || fieldId.includes('cpf')) {
        return FIELD_FEEDBACK.VALIDATORS.cpf(value) ? 'valid' : 'invalid';
    }
    
    if (fieldId === 'email' || fieldType === 'email') {
        return FIELD_FEEDBACK.VALIDATORS.email(value) ? 'valid' : 'invalid';
    }
    
    if (fieldId === 'celular' || fieldId.includes('phone') || fieldId.includes('telefone')) {
        return FIELD_FEEDBACK.VALIDATORS.phone(value) ? 'valid' : 'invalid';
    }
    
    // Validação por nome de campos (série, nome, etc.)
    if (fieldId.includes('nome') || fieldId.includes('sobrenome')) {
        return value.trim().length >= 2 ? 'valid' : 'invalid';
    }
    
    if (fieldId.includes('serie') && element.tagName.toLowerCase() === 'select') {
        return value !== '' ? 'valid' : 'invalid';
    }
    
    // Para campos obrigatórios, só é válido se preenchido adequadamente
    if (isRequired) {
        return value.trim().length >= 1 ? 'valid' : 'invalid';
    }
    
    // Para campos não obrigatórios com conteúdo, considera válido se tem pelo menos 1 caractere
    return value.trim().length > 0 ? 'valid' : 'neutral';
}

/**
 * Aplica feedback a componentes especiais (Phone, Dropdown)
 */
function applySpecialComponentFeedback(element, state) {
    // Phone DDI Selector
    const phoneContainer = element.closest('.phone-input-container');
    if (phoneContainer) {
        applyFieldFeedback(phoneContainer, state);
        return;
    }
    
    // Custom Dropdown - CORREÇÃO DEFINITIVA: Aplicar em TODOS os 3 elementos
    const customDropdown = element.closest('.custom-dropdown');
    if (customDropdown) {
        const dropdownSelected = customDropdown.querySelector('.dropdown-selected');
        
        // ✅ 1. Aplicar no select nativo (elemento original)
        applyFieldFeedback(element, state);
        
        // ✅ 2. Aplicar no container do dropdown
        applyFieldFeedback(customDropdown, state);
        
        // ✅ 3. Aplicar no dropdown-selected (interface visual)
        if (dropdownSelected) {
            applyFieldFeedback(dropdownSelected, state);
        }
        
        console.log(`✅ Custom Dropdown feedback aplicado em 3 elementos: ${element.id || element.name} -> ${state}`);
        return;
    }
    
    // Se o elemento É um select customizado (detectado por data-customized)
    if (element.tagName === 'SELECT' && element.dataset.customized === 'true') {
        const dropdownContainer = document.getElementById(element.id + '-dropdown');
        if (dropdownContainer) {
            const dropdownSelected = dropdownContainer.querySelector('.dropdown-selected');
            
            // ✅ 1. Aplicar no select nativo (elemento original)
            applyFieldFeedback(element, state);
            
            // ✅ 2. Aplicar no container do dropdown
            applyFieldFeedback(dropdownContainer, state);
            
            // ✅ 3. Aplicar no dropdown-selected (interface visual)
            if (dropdownSelected) {
                applyFieldFeedback(dropdownSelected, state);
            }
            
            console.log(`✅ Select customizado feedback aplicado em 3 elementos: ${element.id} -> ${state}`);
            return;
        }
    }
    
    // Campo padrão
    applyFieldFeedback(element, state);
}

/**
 * Processa um campo e aplica o feedback adequado
 * @param {Element} element - Elemento do campo
 */
function processField(element) {
    if (!element) return;
    
    const value = element.value;
    const state = determineFieldState(element, value);
    
    applySpecialComponentFeedback(element, state);
}

/**
 * Processa todos os campos visíveis na página
 */
function processAllFields() {
    const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
    
    fields.forEach(field => {
        // Só processa campos visíveis
        if (field.offsetParent !== null) {
            processField(field);
        }
    });
    
    console.log(`Processados ${fields.length} campos para feedback visual`);
}

// ========== INICIALIZAÇÃO E EVENTOS ========== //

/**
 * Configura os event listeners para um campo
 * @param {Element} element - Elemento do campo
 */
function setupFieldListeners(element) {
    if (!element) return;
    
    // Eventos principais
    element.addEventListener('input', () => processField(element));
    element.addEventListener('change', () => processField(element));
    element.addEventListener('blur', () => processField(element));
    
    // Para selects, o evento change é mais importante
    if (element.tagName.toLowerCase() === 'select') {
        element.addEventListener('change', () => {
            // Delay para garantir que custom dropdowns sejam atualizados
            setTimeout(() => processField(element), 50);
        });
    }
}

/**
 * Detecta quando novos campos são adicionados ao DOM
 */
function setupDynamicFieldDetection() {
    // Observer para novos campos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Ignorar modais PIX e outros modais para evitar interferência
                    if (node.classList && (node.classList.contains('modal-pix') || 
                        node.classList.contains('modal') || 
                        node.closest('.modal-pix') || 
                        node.closest('.modal'))) {
                        return; // Pular processamento de modais
                    }
                    
                    // Verifica se o nó adicionado é um campo
                    const fields = node.matches && node.matches(FIELD_FEEDBACK.SELECTORS.STANDARD) 
                        ? [node] 
                        : node.querySelectorAll ? node.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD)
                        : [];
                    
                    fields.forEach(field => {
                        setupFieldListeners(field);
                        processField(field);
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Detecta autopreenchimento via animação CSS
 */
function setupAutofillDetection() {
    document.addEventListener('animationstart', (e) => {
        if (e.animationName === 'onAutoFillStart') {
            const element = e.target;
            setTimeout(() => processField(element), 100);
        }
    });
    
    document.addEventListener('animationend', (e) => {
        if (e.animationName === 'onAutoFillCancel') {
            const element = e.target;
            setTimeout(() => processField(element), 100);
        }
    });
    
    // Detecção adicional por monitoramento de valores
    setupValueChangeMonitoring();
}

/**
 * Monitora mudanças de valores nos primeiros segundos (útil para autopreenchimento)
 */
function setupValueChangeMonitoring() {
    const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
    const initialValues = new Map();
    
    // Armazena valores iniciais
    fields.forEach(field => {
        initialValues.set(field, field.value || '');
    });
    
    // Monitora mudanças por 5 segundos
    const monitor = setInterval(() => {
        fields.forEach(field => {
            const currentValue = field.value || '';
            const initialValue = initialValues.get(field) || '';
            
            if (currentValue !== initialValue && currentValue.trim() !== '') {
                console.log(`🔍 Autopreenchimento detectado em ${field.id || field.name || 'sem-id'}: "${initialValue}" → "${currentValue}"`);
                processField(field);
                initialValues.set(field, currentValue); // Atualiza valor inicial
                
                // CORREÇÃO: Verificar se é o campo qtd_filhos e forçar criação dos campos filhos
                if (field.id === 'qtd_filhos' && parseInt(currentValue) > 0) {
                    checkAndShowChildrenFields();
                }
            }
        });
    }, 300);
    
    // Para o monitoramento após 5 segundos
    setTimeout(() => {
        clearInterval(monitor);
        console.log('⏹️ Monitoramento de autopreenchimento finalizado');
    }, 5000);
}

/**
 * Integração com Phone DDI Selector
 */
function setupPhoneDDIIntegration() {
    document.addEventListener('ddi:validation:changed', (e) => {
        const { isValid, feedbackState } = e.detail;
        const container = e.target;
        
        console.log(`Phone DDI Feedback recebido: ${container.id || 'phone-container'} -> ${feedbackState}`);
        
        // O Phone DDI Selector já aplica as classes corretas
        // Não precisamos fazer nada adicional aqui
    });
    
    document.addEventListener('ddi:phone:changed', (e) => {
        const { isValid } = e.detail;
        const container = e.target;
        const phoneInput = container.querySelector('.phone-number-input');
        
        if (phoneInput) {
            console.log(`Phone DDI Input mudou: ${container.id || 'phone-container'} -> ${isValid ? 'valid' : 'invalid'}`);
        }
    });
}

/**
 * Integração com Custom Dropdown
 */
function setupCustomDropdownIntegration() {
    // Observa mudanças nos selects que têm dropdown customizado
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT' && e.target.dataset.customized === 'true') {
            const selectElement = e.target;
            const dropdown = document.getElementById(selectElement.id + '-dropdown');
            
            if (dropdown) {
                const dropdownSelected = dropdown.querySelector('.dropdown-selected');
                console.log(`Custom Dropdown mudou: ${selectElement.id} -> ${selectElement.value ? 'valid' : 'neutral'}`);
                console.log(`Classes no dropdown:`, dropdown.classList.toString());
                if (dropdownSelected) {
                    console.log(`Classes no dropdown-selected:`, dropdownSelected.classList.toString());
                }
            }
            
            // O Custom Dropdown já aplica as classes corretas
            // Não precisamos fazer nada adicional aqui
        }
    });
    
    // Debug: Processa dropdowns existentes após um delay
    setTimeout(() => {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            const selectElement = document.querySelector(`select[data-customized="true"]`);
            if (selectElement) {
                console.log(`Debug Dropdown: ${dropdown.id}`, dropdown.classList.toString());
            }
        });
    }, 1000);
}

/**
 * Inicializa o sistema de feedback
 */
function initializeFieldFeedback() {
    console.log('🎯 Inicializando Sistema Unificado de Feedback Visual');
    
    // Processa campos existentes
    const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
    fields.forEach(field => {
        setupFieldListeners(field);
        
        // Estado inicial baseado no conteúdo atual
        if (field.value && field.value.trim() !== '') {
            processField(field);
            
            // Se for o campo qtd_filhos, verificar campos de filhos
            if (field.id === 'qtd_filhos' && parseInt(field.value) > 0) {
                setTimeout(() => checkAndShowChildrenFields(), 100);
            }
        } else {
            applySpecialComponentFeedback(field, 'neutral');
        }
    });
    
    // Verifica novamente após delay para capturar valores restaurados pelo navegador
    setTimeout(() => {
        console.log('🔄 Verificando campos após restauração do navegador...');
        const fieldsCheck = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
        fieldsCheck.forEach(field => {
            if (field.value && field.value.trim() !== '') {
                processField(field);
                console.log(`✅ Campo ${field.id || field.name || 'sem-id'} processado após reload - valor: ${field.value}`);
            }
        });
        
        // Verificar campos de filhos também
        checkAndShowChildrenFields();
    }, 500); // 500ms deve ser suficiente para a maioria dos casos
    
    // Verificação adicional para casos de autopreenchimento mais lento
    setTimeout(() => {
        console.log('🔄 Verificação final para autopreenchimento lento...');
        const fieldsCheck = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
        fieldsCheck.forEach(field => {
            if (field.value && field.value.trim() !== '') {
                processField(field);
                console.log(`✅ Campo ${field.id || field.name || 'sem-id'} processado em verificação final - valor: ${field.value}`);
            }
        });
        
        // Verificação final dos campos de filhos
        checkAndShowChildrenFields();
    }, 1500); // 1.5s para casos mais lentos
    
    // Configura detecção de campos dinâmicos
    setupDynamicFieldDetection();
    
    // Configura detecção de autopreenchimento
    setupAutofillDetection();
    
    // Configura integração com componentes especiais
    setupPhoneDDIIntegration();
    setupCustomDropdownIntegration();
    
    // DESABILITADO: Processamento contínuo removido para evitar sobrecarga
    // setInterval(processAllFields, 2000);
    
    console.log(`✅ Sistema de feedback inicializado com ${fields.length} campos`);
}

// ========== FUNÇÕES PÚBLICAS PARA INTEGRAÇÃO ========== //

/**
 * Força o processamento de um campo específico
 * @param {string|Element} fieldSelector - Seletor CSS ou elemento
 */
function forceProcessField(fieldSelector) {
    const element = typeof fieldSelector === 'string' 
        ? document.querySelector(fieldSelector)
        : fieldSelector;
    
    if (element) {
        processField(element);
    }
}

/**
 * Força um estado específico em um campo
 * @param {string|Element} fieldSelector - Seletor CSS ou elemento
 * @param {string} state - 'valid', 'invalid', ou 'neutral'
 */
function forceFieldState(fieldSelector, state) {
    const element = typeof fieldSelector === 'string' 
        ? document.querySelector(fieldSelector)
        : fieldSelector;
    
    if (element) {
        applySpecialComponentFeedback(element, state);
    }
}

/**
 * Reseta todos os campos para estado neutro
 */
function resetAllFields() {
    const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
    fields.forEach(field => {
        applySpecialComponentFeedback(field, 'neutral');
    });
}

// ========== INICIALIZAÇÃO ========== //

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFieldFeedback);
} else {
    initializeFieldFeedback();
}

// Verifica campos quando a página ganha foco (útil para navegação back/forward)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Página foi restaurada do cache (bfcache)
        console.log('🔄 Página restaurada do cache - verificando campos...');
        setTimeout(() => {
            const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
            fields.forEach(field => {
                if (field.value && field.value.trim() !== '') {
                    processField(field);
                    console.log(`✅ Campo ${field.id || field.name || 'sem-id'} processado após restauração do cache`);
                }
            });
            
            // Verificar campos de filhos após restauração do cache
            checkAndShowChildrenFields();
        }, 100);
    }
});

// Verifica campos quando a página ganha foco
window.addEventListener('focus', () => {
    console.log('🔄 Página ganhou foco - verificando campos...');
    setTimeout(() => {
        const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
        fields.forEach(field => {
            if (field.value && field.value.trim() !== '') {
                processField(field);
            }
        });
        
        // Verificar campos de filhos quando página ganha foco
        checkAndShowChildrenFields();
    }, 100);
});

// Exporta funções para uso externo
window.FieldFeedback = {
    process: forceProcessField,
    setState: forceFieldState,
    reset: resetAllFields,
    processAll: processAllFields,
    checkChildren: checkAndShowChildrenFields
};

console.log('🔧 Field Feedback System loaded and ready');
