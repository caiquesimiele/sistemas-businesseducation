/**
 * SISTEMA UNIFICADO DE FEEDBACK VISUAL PARA CAMPOS
 * Aplica feedback visual Google-style baseado no estado dos campos
 * Adaptado da new-store para forms de experiência
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
        STANDARD: 'input[type="text"], input[type="email"], input[type="tel"], select, textarea',
        CUSTOM_DROPDOWN: '.custom-dropdown',
        DROPDOWN_SELECTED: '.dropdown-selected'
    },
    
    // Validadores personalizados
    VALIDATORS: {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        required: (value) => value.trim().length > 0,
        minLength: (value, min) => value.trim().length >= min
    }
};

// ========== FUNÇÕES PRINCIPAIS ========== //

/**
 * Aplica feedback visual a um campo
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
 * Determina o estado de um campo baseado em seu valor
 */
function determineFieldState(element, value) {
    // Se está vazio, é neutro
    if (!value || value.toString().trim() === '') {
        return 'neutral';
    }
    
    // Validação baseada no ID do campo
    const fieldId = element.id;
    const fieldType = element.type || element.tagName.toLowerCase();
    
    // Validações específicas por ID
    if (fieldId === 'email' || fieldType === 'email') {
        return FIELD_FEEDBACK.VALIDATORS.email(value) ? 'valid' : 'invalid';
    }
    
    // Para campos obrigatórios, só é válido se preenchido adequadamente
    if (element.hasAttribute('required')) {
        return value.trim().length >= 1 ? 'valid' : 'invalid';
    }
    
    // Para campos não obrigatórios com conteúdo, considera válido se tem pelo menos 1 caractere
    return value.trim().length > 0 ? 'valid' : 'neutral';
}

/**
 * Aplica feedback a componentes especiais (Custom Dropdown)
 */
function applySpecialComponentFeedback(element, state) {
    // Custom Dropdown
    const customDropdown = element.closest('.custom-dropdown');
    if (customDropdown) {
        const dropdownSelected = customDropdown.querySelector('.dropdown-selected');
        if (dropdownSelected) {
            applyFieldFeedback(dropdownSelected, state);
        }
        return;
    }
    
    // Campo padrão
    applyFieldFeedback(element, state);
}

/**
 * Processa um campo e aplica o feedback adequado
 */
function processField(element) {
    if (!element) return;
    
    const value = element.value;
    const state = determineFieldState(element, value);
    
    applySpecialComponentFeedback(element, state);
}

/**
 * Configura os event listeners para um campo
 */
function setupFieldListeners(element) {
    if (!element) return;
    
    // Eventos principais
    element.addEventListener('input', () => processField(element));
    element.addEventListener('change', () => processField(element));
    element.addEventListener('blur', () => processField(element));
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
}

/**
 * Integração com Custom Dropdown
 */
function setupCustomDropdownIntegration() {
    // Override da função selectOption existente para aplicar feedback
    const originalSelectOption = window.selectOption;
    
    window.selectOption = function(fieldName, value) {
        // Chama função original
        if (originalSelectOption) {
            originalSelectOption(fieldName, value);
        }
        
        // Aplica feedback unificado
        const hiddenInput = document.getElementById(fieldName);
        const dropdown = document.getElementById(fieldName + '-dropdown');
        
        if (hiddenInput && dropdown) {
            const dropdownSelected = dropdown.querySelector('.dropdown-selected');
            
            // Remove todas as classes de feedback
            hiddenInput.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            if (dropdownSelected) {
                dropdownSelected.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            }
            
            // Aplica nova classe baseada no valor
            if (!value || value.trim() === '') {
                hiddenInput.classList.add('campo-neutro');
                if (dropdownSelected) dropdownSelected.classList.add('campo-neutro');
            } else {
                hiddenInput.classList.add('campo-valido');
                if (dropdownSelected) dropdownSelected.classList.add('campo-valido');
            }
        }
    };
}

/**
 * Inicializa o sistema de feedback
 */
function initializeFieldFeedback() {
    console.log('🎯 Inicializando Sistema Unificado de Feedback Visual (Forms)');
    
    // Processa campos existentes
    const fields = document.querySelectorAll(FIELD_FEEDBACK.SELECTORS.STANDARD);
    fields.forEach(field => {
        setupFieldListeners(field);
        
        // Estado inicial baseado no conteúdo atual
        if (field.value && field.value.trim() !== '') {
            processField(field);
        } else {
            applySpecialComponentFeedback(field, 'neutral');
        }
    });
    
    // Configura detecção de autopreenchimento
    setupAutofillDetection();
    
    // Configura integração com componentes especiais
    setupCustomDropdownIntegration();
    
    console.log(`✅ Sistema de feedback inicializado com ${fields.length} campos`);
}

// ========== FUNÇÕES PÚBLICAS PARA INTEGRAÇÃO ========== //

/**
 * Força o processamento de um campo específico
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

// Exporta funções para uso externo
window.FieldFeedback = {
    process: forceProcessField,
    setState: forceFieldState,
    reset: resetAllFields
};

console.log('🔧 Field Feedback System loaded and ready (Forms)');
