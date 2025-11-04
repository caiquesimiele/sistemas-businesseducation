/**
 * Sistema de Dropdown Customizado - Business Education Stores
 * Baseado no sistema forms (pesquisa pais/professores)
 * 
 * VERSÃO 2.0 - Manutenível e Automática
 * - Detecta automaticamente novos selects adicionados ao DOM
 * - Não requer modificações em cada loja
 * - Centralizado e fácil de manter
 */

// Configuração global
const DROPDOWN_CONFIG = {
    autoDetect: true,           // Detectar automaticamente novos selects
    observeDelay: 10,          // Delay reduzido para processar mais rápido (ms)
    debug: false,               // Mostrar logs de debug
    forceCheckInterval: 500     // Intervalo para verificar selects não processados (ms)
};

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdownSystem();
});

/**
 * Inicializa o sistema completo de dropdowns
 * - Converte selects existentes
 * - Configura observador para novos selects
 */
function initializeDropdownSystem() {
    if (DROPDOWN_CONFIG.debug) {
        console.log('[CustomDropdown] Inicializando sistema...');
    }
    
    // Converter selects existentes
    initializeCustomDropdowns();
    
    // Configurar observador para detectar novos selects
    if (DROPDOWN_CONFIG.autoDetect) {
        setupMutationObserver();
        
        // Verificação periódica como fallback
        setupPeriodicCheck();
    }
    
    // Configurar listener para mudanças via JavaScript (CEP autofill, etc)
    setupValueChangeListeners();
}

/**
 * Configura verificação periódica para garantir que todos os selects sejam processados
 */
function setupPeriodicCheck() {
    // Verificar periodicamente por selects não processados
    setInterval(() => {
        const unprocessedSelects = document.querySelectorAll('select:not([data-customized="true"])');
        
        if (unprocessedSelects.length > 0) {
            if (DROPDOWN_CONFIG.debug) {
                console.log(`[CustomDropdown] Encontrados ${unprocessedSelects.length} selects não processados`);
            }
            
            unprocessedSelects.forEach(select => {
                // Verificar se realmente não foi customizado (double-check)
                if (!select.dataset.customized && !document.getElementById(select.id + '-dropdown')) {
                    createCustomDropdown(select);
                    if (DROPDOWN_CONFIG.debug) {
                        console.log('[CustomDropdown] Select processado via verificação periódica:', select.id || select.name);
                    }
                }
            });
        }
    }, 10000); // Reduzido drasticamente para 10 segundos
}

/**
 * Inicializa todos os dropdowns customizados na página
 */
function initializeCustomDropdowns() {
    // Converter todos os selects nativos em dropdowns customizados
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Pular se já foi convertido
        if (select.dataset.customized === 'true') return;
        
        createCustomDropdown(select);
    });
}

/**
 * Configura MutationObserver para detectar novos selects adicionados ao DOM
 */
function setupMutationObserver() {
    // Debounce para processar mudanças em lote
    let observerTimeout;
    
    const observer = new MutationObserver(function(mutations) {
        clearTimeout(observerTimeout);
        
        observerTimeout = setTimeout(() => {
            let hasNewSelects = false;
            
            mutations.forEach(mutation => {
                // Verificar nós adicionados
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Ignorar modais PIX e outros modais para evitar interferência
                        if (node.classList && (node.classList.contains('modal-pix') || 
                            node.classList.contains('modal') || 
                            node.closest('.modal-pix') || 
                            node.closest('.modal'))) {
                            return; // Pular processamento de modais
                        }
                        
                        // Verificar se é um select
                        if (node.tagName === 'SELECT' && node.dataset.customized !== 'true') {
                            hasNewSelects = true;
                            createCustomDropdown(node);
                            if (DROPDOWN_CONFIG.debug) {
                                console.log('[CustomDropdown] Novo select detectado:', node.id || node.name);
                            }
                        }
                        
                        // Verificar selects dentro do elemento adicionado (apenas se não for modal)
                        const innerSelects = node.querySelectorAll ? node.querySelectorAll('select') : [];
                        innerSelects.forEach(select => {
                            // Verificar se o select não está dentro de um modal
                            if (select.dataset.customized !== 'true' && 
                                !select.closest('.modal-pix') && 
                                !select.closest('.modal')) {
                                hasNewSelects = true;
                                createCustomDropdown(select);
                                if (DROPDOWN_CONFIG.debug) {
                                    console.log('[CustomDropdown] Novo select detectado (inner):', select.id || select.name);
                                }
                            }
                        });
                    }
                });
            });
            
            if (hasNewSelects && DROPDOWN_CONFIG.debug) {
                console.log('[CustomDropdown] Novos dropdowns aplicados');
            }
        }, DROPDOWN_CONFIG.observeDelay);
    });
    
    // Observar mudanças no body inteiro
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    if (DROPDOWN_CONFIG.debug) {
        console.log('[CustomDropdown] MutationObserver configurado');
    }
}

/**
 * Configura listeners para mudanças de valor via JavaScript
 */
function setupValueChangeListeners() {
    // Adicionar listener global para mudanças de valor
    document.addEventListener('change', function(e) {
        if (e.target.tagName === 'SELECT' && e.target.dataset.customized === 'true') {
            updateCustomDropdown(e.target);
        }
    });
    
    // Também escutar eventos customizados que podem ser disparados
    document.addEventListener('dropdown:update', function(e) {
        if (e.detail && e.detail.selectId) {
            const select = document.getElementById(e.detail.selectId);
            if (select && select.dataset.customized === 'true') {
                updateCustomDropdown(select);
            }
        }
    });
}

/**
 * Cria um dropdown customizado a partir de um select nativo
 * @param {HTMLSelectElement} selectElement - O elemento select original
 */
function createCustomDropdown(selectElement) {
    // Marcar como customizado
    selectElement.dataset.customized = 'true';
    
    // Criar container do dropdown
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'custom-dropdown';
    dropdownContainer.id = selectElement.id + '-dropdown';
    
    // Criar campo selecionado
    const dropdownSelected = document.createElement('div');
    dropdownSelected.className = 'dropdown-selected';
    
    // Criar texto selecionado
    const selectedText = document.createElement('span');
    selectedText.className = 'selected-text';
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    selectedText.textContent = selectedOption && selectedOption.value ? selectedOption.text : '';
    selectedText.setAttribute('data-placeholder', selectElement.options[0]?.text || 'Selecione');
    if (!selectedOption || !selectedOption.value) {
        selectedText.classList.add('placeholder');
    }
    
    // Criar ícone de seta
    const dropdownArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    dropdownArrow.className = 'dropdown-arrow';
    dropdownArrow.setAttribute('width', '12');
    dropdownArrow.setAttribute('height', '8');
    dropdownArrow.setAttribute('viewBox', '0 0 12 8');
    dropdownArrow.setAttribute('fill', 'none');
    dropdownArrow.innerHTML = '<path d="M1 1.5L6 6.5L11 1.5" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    
    // Montar campo selecionado
    dropdownSelected.appendChild(selectedText);
    dropdownSelected.appendChild(dropdownArrow);
    
    // CORREÇÃO: Tornar dropdown focável via Tab
    dropdownSelected.setAttribute('tabindex', '0');
    dropdownSelected.setAttribute('role', 'combobox');
    dropdownSelected.setAttribute('aria-expanded', 'false');
    dropdownSelected.setAttribute('aria-haspopup', 'listbox');
    
    // Criar container de opções
    const dropdownOptions = document.createElement('div');
    dropdownOptions.className = 'dropdown-options';
    dropdownOptions.id = selectElement.id + '-options';
    dropdownOptions.setAttribute('role', 'listbox');
    
    // Criar opções a partir do select original
    Array.from(selectElement.options).forEach(option => {
        // Pular opção vazia inicial se for placeholder
        if (!option.value && option.index === 0) return;
        
        const dropdownOption = document.createElement('div');
        dropdownOption.className = 'dropdown-option';
        dropdownOption.textContent = option.text;
        dropdownOption.dataset.value = option.value;
        
        // Marcar como selecionado se necessário
        if (option.selected && option.value) {
            dropdownOption.classList.add('selected');
        }
        
        // Adicionar evento de clique
        dropdownOption.addEventListener('click', function() {
            selectDropdownOption(selectElement, dropdownContainer, option.value, option.text);
        });
        
        dropdownOptions.appendChild(dropdownOption);
    });
    
    // Montar dropdown
    dropdownContainer.appendChild(dropdownSelected);
    dropdownContainer.appendChild(dropdownOptions);
    
    // Inserir dropdown EXATAMENTE no lugar do select original
    selectElement.parentNode.insertBefore(dropdownContainer, selectElement);
    
    // Garantir que o dropdown seja sempre responsivo como inputs normais
    // NÃO copiar nenhuma propriedade - deixar CSS controlar completamente
    dropdownContainer.style.display = 'block';
    
    // CORREÇÃO: Garantir que não há background ou border-radius aplicado via JavaScript
    dropdownContainer.style.background = 'transparent';
    dropdownContainer.style.backgroundColor = 'transparent';
    dropdownContainer.style.borderRadius = '0';
    dropdownContainer.style.boxShadow = 'none';
    
    // Esconder select original COMPLETAMENTE
    selectElement.style.display = 'none';
    selectElement.style.position = 'absolute';
    selectElement.style.left = '-9999px';
    selectElement.style.top = '-9999px';
    selectElement.style.width = '1px';
    selectElement.style.height = '1px';
    selectElement.style.opacity = '0';
    selectElement.style.visibility = 'hidden';
    selectElement.setAttribute('tabindex', '-1');
    selectElement.setAttribute('aria-hidden', 'true');
    
    // Adicionar evento de clique para abrir/fechar
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown(dropdownContainer);
    });
    
    // CORREÇÃO: Adicionar suporte completo a navegação por teclado
    dropdownSelected.addEventListener('keydown', function(e) {
        const isOpen = dropdownSelected.classList.contains('active');
        const options = Array.from(dropdownOptions.querySelectorAll('.dropdown-option'));
        const currentIndex = options.findIndex(opt => opt.classList.contains('selected'));
        
        switch(e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleDropdown(dropdownContainer);
                break;
                
            case 'Escape':
                if (isOpen) {
                    e.preventDefault();
                    dropdownSelected.classList.remove('active');
                    dropdownOptions.classList.remove('show');
                    dropdownSelected.setAttribute('aria-expanded', 'false');
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    toggleDropdown(dropdownContainer);
                } else if (currentIndex < options.length - 1) {
                    const nextOption = options[currentIndex + 1];
                    selectDropdownOption(selectElement, dropdownContainer, nextOption.dataset.value, nextOption.textContent);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (!isOpen) {
                    toggleDropdown(dropdownContainer);
                } else if (currentIndex > 0) {
                    const prevOption = options[currentIndex - 1];
                    selectDropdownOption(selectElement, dropdownContainer, prevOption.dataset.value, prevOption.textContent);
                }
                break;
                
            case 'Home':
                if (isOpen && options.length > 0) {
                    e.preventDefault();
                    const firstOption = options[0];
                    selectDropdownOption(selectElement, dropdownContainer, firstOption.dataset.value, firstOption.textContent);
                }
                break;
                
            case 'End':
                if (isOpen && options.length > 0) {
                    e.preventDefault();
                    const lastOption = options[options.length - 1];
                    selectDropdownOption(selectElement, dropdownContainer, lastOption.dataset.value, lastOption.textContent);
                }
                break;
                
            case 'Tab':
                // Permitir Tab normal, mas fechar dropdown se estiver aberto
                if (isOpen) {
                    dropdownSelected.classList.remove('active');
                    dropdownOptions.classList.remove('show');
                    dropdownSelected.setAttribute('aria-expanded', 'false');
                }
                break;
        }
    });
    
    // Adicionar validação se o select for required
    if (selectElement.hasAttribute('required')) {
        dropdownContainer.dataset.required = 'true';
    }
    
    // Sincronizar estado de validação inicial
    if (selectElement.classList.contains('invalid')) {
        dropdownContainer.classList.add('invalid');
        // Sistema unificado também
        dropdownContainer.classList.add('campo-invalido');
    } else if (selectElement.value && selectElement.value.trim() !== '') {
        // Se tem valor, é válido
        dropdownContainer.classList.add('campo-valido');
    } else {
        // Se não tem valor, é neutro
        dropdownContainer.classList.add('campo-neutro');
    }
    
    // Observar mudanças na classe do select original para sincronizar validação
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (selectElement.classList.contains('invalid')) {
                    dropdownContainer.classList.add('invalid');
                    // Sistema unificado - aplicar inválido
                    dropdownContainer.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
                    dropdownContainer.classList.add('campo-invalido');
                } else {
                    dropdownContainer.classList.remove('invalid');
                    // Sistema unificado - determinar estado baseado no valor
                    dropdownContainer.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
                    if (selectElement.value && selectElement.value.trim() !== '') {
                        dropdownContainer.classList.add('campo-valido');
                    } else {
                        dropdownContainer.classList.add('campo-neutro');
                    }
                }
            }
        });
    });
    
    // Configurar e iniciar o observer
    observer.observe(selectElement, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // NOVO: Aplicar feedback visual inicial se o sistema estiver ativo
    if (typeof validarDropdownVisual === 'function') {
        // Pequeno delay para garantir que o DOM está estabilizado
        setTimeout(() => {
            validarDropdownVisual(dropdownContainer, selectElement);
        }, 50);
    }
}

/**
 * Alterna a visibilidade do dropdown
 * @param {HTMLElement} dropdownContainer - Container do dropdown
 */
function toggleDropdown(dropdownContainer) {
    const dropdownSelected = dropdownContainer.querySelector('.dropdown-selected');
    const dropdownOptions = dropdownContainer.querySelector('.dropdown-options');
    
    // Fechar outros dropdowns abertos
    document.querySelectorAll('.custom-dropdown').forEach(dd => {
        if (dd !== dropdownContainer) {
            dd.querySelector('.dropdown-selected').classList.remove('active');
            dd.querySelector('.dropdown-options').classList.remove('show');
        }
    });
    
    // Se estamos abrindo o dropdown
    if (!dropdownSelected.classList.contains('active')) {
        // Calcular posição para dropdown fixo
        const rect = dropdownSelected.getBoundingClientRect();
        dropdownOptions.style.top = (rect.bottom + 5) + 'px';
        dropdownOptions.style.left = rect.left + 'px';
        dropdownOptions.style.width = rect.width + 'px';
        
        // CORREÇÃO: Garantir que o dropdown-options mantenha o radius correto
        dropdownOptions.style.background = 'white';
        dropdownOptions.style.backgroundColor = 'white';
        dropdownOptions.style.borderRadius = '8px';
        // ✅ REMOVIDO overflow: hidden que impedia scroll
    }
    
    // Alternar este dropdown
    dropdownSelected.classList.toggle('active');
    dropdownOptions.classList.toggle('show');
    
    // CORREÇÃO: Atualizar aria-expanded para acessibilidade
    const isOpen = dropdownSelected.classList.contains('active');
    dropdownSelected.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

/**
 * Seleciona uma opção do dropdown
 * @param {HTMLSelectElement} selectElement - Select original
 * @param {HTMLElement} dropdownContainer - Container do dropdown
 * @param {string} value - Valor da opção
 * @param {string} text - Texto da opção
 */
function selectDropdownOption(selectElement, dropdownContainer, value, text) {
    // Declarar variáveis que serão usadas em toda a função
    const dropdownSelected = dropdownContainer.querySelector('.dropdown-selected');
    
    // Atualizar select original
    selectElement.value = value;
    
    // Disparar evento change no select original
    const event = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(event);
    
    // Disparar também input event para garantir compatibilidade
    const inputEvent = new Event('input', { bubbles: true });
    selectElement.dispatchEvent(inputEvent);
    
    // Atualizar texto exibido
    const selectedText = dropdownContainer.querySelector('.selected-text');
    selectedText.textContent = text;
    selectedText.classList.remove('placeholder');
    
    // Atualizar opção selecionada visualmente
    dropdownContainer.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.value === value) {
            opt.classList.add('selected');
        }
    });
    
        // Remover estado de erro se houver (compatibilidade)
        dropdownContainer.classList.remove('invalid');
        selectElement.classList.remove('invalid');
        
        // Aplicar sistema unificado - campo válido
        dropdownContainer.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        dropdownContainer.classList.add('campo-valido');
        selectElement.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        selectElement.classList.add('campo-valido');
        
        // Aplicar também no dropdown-selected (variável já declarada)
        if (dropdownSelected) {
            dropdownSelected.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            dropdownSelected.classList.add('campo-valido');
        }
    
    // Esconder mensagem de erro se existir
    const errorElement = document.getElementById(selectElement.id + '-error');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.style.opacity = '0';
    }
    
    // NOVO: Aplicar feedback visual se o sistema estiver ativo
    if (typeof validarDropdownVisual === 'function') {
        validarDropdownVisual(dropdownContainer, selectElement);
    }
    
    // Fechar dropdown - reutiliza a variável dropdownSelected já declarada
    const dropdownOptions = dropdownContainer.querySelector('.dropdown-options');
    if (dropdownSelected) {
        dropdownSelected.classList.remove('active');
        dropdownSelected.setAttribute('aria-expanded', 'false');
    }
    dropdownOptions.classList.remove('show');
}

/**
 * Fechar dropdowns ao clicar fora
 */
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(dd => {
            const selected = dd.querySelector('.dropdown-selected');
            selected.classList.remove('active');
            selected.setAttribute('aria-expanded', 'false');
            dd.querySelector('.dropdown-options').classList.remove('show');
        });
    }
});

/**
 * Fechar dropdowns ao fazer scroll (para dropdown fixo)
 */
document.addEventListener('scroll', function() {
    document.querySelectorAll('.custom-dropdown').forEach(dd => {
        const selected = dd.querySelector('.dropdown-selected');
        selected.classList.remove('active');
        selected.setAttribute('aria-expanded', 'false');
        dd.querySelector('.dropdown-options').classList.remove('show');
    });
});

/**
 * Reposicionar dropdown ao redimensionar janela
 */
window.addEventListener('resize', function() {
    document.querySelectorAll('.custom-dropdown').forEach(dd => {
        const dropdownSelected = dd.querySelector('.dropdown-selected');
        const dropdownOptions = dd.querySelector('.dropdown-options');
        
        if (dropdownSelected.classList.contains('active')) {
            const rect = dropdownSelected.getBoundingClientRect();
            dropdownOptions.style.top = (rect.bottom + 5) + 'px';
            dropdownOptions.style.left = rect.left + 'px';
            dropdownOptions.style.width = rect.width + 'px';
            
            // CORREÇÃO: Garantir que o dropdown-options mantenha o radius correto
            dropdownOptions.style.background = 'white';
            dropdownOptions.style.backgroundColor = 'white';
            dropdownOptions.style.borderRadius = '8px';
            // ✅ REMOVIDO overflow: hidden que impedia scroll
        }
    });
});

/**
 * Função auxiliar para validação de formulário
 * Adiciona suporte para dropdowns customizados na validação existente
 */
function validateCustomDropdowns() {
    let isValid = true;
    
    document.querySelectorAll('.custom-dropdown[data-required="true"]').forEach(dropdown => {
        const selectId = dropdown.id.replace('-dropdown', '');
        const select = document.getElementById(selectId);
        
        if (!select.value) {
            // Sistema antigo (compatibilidade)
            dropdown.classList.add('invalid');
            select.classList.add('invalid');
            
            // Sistema unificado - campo inválido
            dropdown.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            dropdown.classList.add('campo-invalido');
            select.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            select.classList.add('campo-invalido');
            
            // Debug e forçar repaint
            console.log(`❌ Dropdown INVÁLIDO aplicado: ${dropdown.id}`, dropdown.classList.toString());
            dropdown.offsetHeight;
            
            // Aplicar classes de feedback no dropdown-selected também
            const dropdownSelected = dropdown.querySelector('.dropdown-selected');
            if (dropdownSelected) {
                dropdownSelected.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
                dropdownSelected.classList.add('campo-invalido');
            }
            
            // Mostrar erro se existir
            const errorElement = document.getElementById(selectId + '-error');
            if (errorElement) {
                errorElement.style.display = 'block';
            }
            
            isValid = false;
        } else {
            // Sistema antigo (compatibilidade)
            dropdown.classList.remove('invalid');
            select.classList.remove('invalid');
            
            // Sistema unificado - campo válido
            dropdown.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            dropdown.classList.add('campo-valido');
            select.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            select.classList.add('campo-valido');
            
            // Forçar repaint para garantir aplicação das classes CSS
            dropdown.offsetHeight;
            
            // Esconder erro se existir
            const errorElement = document.getElementById(selectId + '-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    });
    
    return isValid;
}

// Função para atualizar dropdown quando o valor do select mudar externamente (ex: CEP autofill)
function updateCustomDropdown(selectElement) {
    const dropdownContainer = document.getElementById(selectElement.id + '-dropdown');
    if (!dropdownContainer) return;
    
    const selectedText = dropdownContainer.querySelector('.selected-text');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        selectedText.textContent = selectedOption.text;
        selectedText.classList.remove('placeholder');
        
        // Atualizar opção visual selecionada
        dropdownContainer.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === selectedOption.value) {
                opt.classList.add('selected');
            }
        });
        
        // Remover estado de erro (compatibilidade)
        dropdownContainer.classList.remove('invalid');
        selectElement.classList.remove('invalid');
        
        // Aplicar sistema unificado de feedback - campo válido
        dropdownContainer.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        dropdownContainer.classList.add('campo-valido');
        selectElement.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        selectElement.classList.add('campo-valido');
        
        // Debug e forçar repaint
        console.log(`✅ Dropdown VÁLIDO aplicado: ${dropdownContainer.id}`, dropdownContainer.classList.toString());
        dropdownContainer.offsetHeight;
        
        // Aplicar classes de feedback no dropdown-selected também
        const dropdownSelected = dropdownContainer.querySelector('.dropdown-selected');
        if (dropdownSelected) {
            dropdownSelected.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            dropdownSelected.classList.add('campo-valido');
        }
    } else {
        selectedText.textContent = '';
        selectedText.classList.add('placeholder');
        
        // Aplicar sistema unificado de feedback - campo neutro
        dropdownContainer.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        dropdownContainer.classList.add('campo-neutro');
        selectElement.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        selectElement.classList.add('campo-neutro');
        
        // Debug e forçar repaint
        console.log(`⚪ Dropdown NEUTRO aplicado: ${dropdownContainer.id}`, dropdownContainer.classList.toString());
        dropdownContainer.offsetHeight;
        
        // Aplicar classes de feedback no dropdown-selected também
        const dropdownSelected = dropdownContainer.querySelector('.dropdown-selected');
        if (dropdownSelected) {
            dropdownSelected.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
            dropdownSelected.classList.add('campo-neutro');
        }
    }
}



// Função para processar selects específicos imediatamente
function processSelectsNow(parentElement = document) {
    const selects = parentElement.querySelectorAll('select:not([data-customized="true"])');
    selects.forEach(select => {
        if (!document.getElementById(select.id + '-dropdown')) {
            createCustomDropdown(select);
        }
    });
}

// Exportar funções para uso global
window.initializeCustomDropdowns = initializeCustomDropdowns;
window.validateCustomDropdowns = validateCustomDropdowns;
window.createCustomDropdown = createCustomDropdown;
window.updateCustomDropdown = updateCustomDropdown;
window.processSelectsNow = processSelectsNow;

/**
 * NOVA FUNÇÃO: Resetar todos os dropdowns customizados
 * Útil para botões de limpeza de formulário
 */
function resetAllCustomDropdowns() {
    console.log('[CustomDropdown] Resetando todos os dropdowns customizados...');
    
    const customizedSelects = document.querySelectorAll('select[data-customized="true"]');
    let resetCount = 0;
    
    customizedSelects.forEach(select => {
        console.log(`[CustomDropdown] Resetando: ${select.id}`);
        
        // Reset do valor para primeira opção (geralmente vazia)
        select.selectedIndex = 0;
        
        // Forçar atualização visual
        updateCustomDropdown(select);
        
        // Disparar evento change
        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);
        
        resetCount++;
        console.log(`[CustomDropdown] ${select.id} resetado - valor: "${select.value}"`);
    });
    
    console.log(`[CustomDropdown] ${resetCount} dropdowns resetados com sucesso!`);
    return resetCount;
}

// Tornar função global
window.resetAllCustomDropdowns = resetAllCustomDropdowns;

// Função helper para ser chamada após criar campos dinamicamente
window.applyCustomDropdowns = function(container) {
    if (!container) container = document;
    
    // Pequeno delay para garantir que o DOM está estabilizado
    setTimeout(() => {
        processSelectsNow(container);
    }, 10);
};
