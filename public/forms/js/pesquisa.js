// FUNÇÕES PRINCIPAIS - ESSENCIAIS

// Funções para o dropdown customizado
function toggleDropdown(fieldName) {
    const dropdown = document.getElementById(fieldName + '-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.dropdown-options');
    
    // Fechar outros dropdowns abertos
    document.querySelectorAll('.custom-dropdown').forEach(d => {
        if (d.id !== fieldName + '-dropdown') {
            d.querySelector('.dropdown-selected').classList.remove('active');
            d.querySelector('.dropdown-options').classList.remove('show');
        }
    });
    
    // Toggle do dropdown atual
    selected.classList.toggle('active');
    options.classList.toggle('show');
}

function selectOption(fieldName, value) {
    const dropdown = document.getElementById(fieldName + '-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const selectedText = selected.querySelector('.selected-text');
    const options = dropdown.querySelector('.dropdown-options');
    const hiddenInput = document.getElementById(fieldName);
    
    // Atualizar texto selecionado
    selectedText.textContent = value;
    
    // Atualizar valor do input hidden
    hiddenInput.value = value;
    
    // Marcar opção como selecionada
    options.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.textContent === value) {
            opt.classList.add('selected');
        }
    });
    
    // Fechar dropdown
    selected.classList.remove('active');
    options.classList.remove('show');
    
    // Verificar se é "Outra escola" para mostrar campo adicional
    if (fieldName === 'escola' && value === 'Outra escola') {
        const outroContainer = document.getElementById('outro_escola_container');
        if (outroContainer) {
            outroContainer.style.display = 'block';
        }
    } else if (fieldName === 'escola') {
        const outroContainer = document.getElementById('outro_escola_container');
        if (outroContainer) {
            outroContainer.style.display = 'none';
        }
    }
}

// Fechar dropdown ao clicar fora - otimizado
document.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-dropdown')) {
        const activeDropdowns = document.querySelectorAll('.dropdown-selected.active, .dropdown-options.show');
        if (activeDropdowns.length > 0) {
            activeDropdowns.forEach(d => {
                d.classList.remove('active', 'show');
            });
        }
    }
});

// Tornar as funções globais
window.toggleDropdown = toggleDropdown;
window.selectOption = selectOption;

// Função para mostrar/ocultar campo de explicação para notas baixas (1-5)
function toggleExplanationField(fieldName, value) {
    const explanationField = document.getElementById(`explanation_${fieldName}`);
    
    if (explanationField) {
        if (parseInt(value) <= 5) {
            explanationField.style.display = 'block';
        } else {
            explanationField.style.display = 'none';
            // Limpar o campo de explicação se a nota for alta
            const textarea = explanationField.querySelector('textarea');
            if (textarea) {
                textarea.value = '';
            }
        }
    }
    
    // Chama a função original selectScale
    const button = event.target;
    selectScale(button, fieldName, value);
}

function selectChoice(button, fieldName, value) {
    console.log('selectChoice chamada:', fieldName, value);
    
    // Remove seleção de todos os botões do mesmo grupo (tanto horizontais quanto verticais)
    const group = button.parentElement;
    const buttons = group.querySelectorAll('.choice-btn, .choice-btn-vertical');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Adiciona seleção ao botão clicado
    button.classList.add('selected');
    
    // Atualiza o campo hidden
    const hiddenField = document.getElementById(fieldName);
    if (hiddenField) {
        hiddenField.value = value;
        console.log('Campo atualizado:', fieldName, '=', value);
    } else {
        console.error('Campo hidden não encontrado:', fieldName);
    }
}

function selectScale(button, fieldName, value) {
    console.log('selectScale chamada:', fieldName, value);
    
    // Remove seleção de todos os botões do mesmo grupo (incluindo ambas as linhas)
    const scaleContainer = button.closest('.scale-buttons');
    const buttons = scaleContainer.querySelectorAll('.scale-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Adiciona seleção ao botão clicado
    button.classList.add('selected');
    
    // Atualiza o campo hidden
    const hiddenField = document.getElementById(fieldName);
    if (hiddenField) {
        hiddenField.value = value;
        console.log('Campo de escala atualizado:', fieldName, '=', value);
    } else {
        console.error('Campo hidden de escala não encontrado:', fieldName);
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Funções para controlar seções condicionais
function showConditionalQuestions() {
    const conditionalSection = document.getElementById('conditional_questions');
    
    if (conditionalSection) {
        conditionalSection.classList.add('show');
        
        // Scroll suave para a próxima pergunta
        setTimeout(() => {
            const nextQuestion = conditionalSection.querySelector('.form-group');
            if (nextQuestion) {
                nextQuestion.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 300);
    }
}

function hideConditionalQuestions() {
    const conditionalSection = document.getElementById('conditional_questions');
    
    if (conditionalSection) {
        conditionalSection.classList.remove('show');
        
        // Limpar valores dos campos condicionais quando ocultados
        const conditionalFields = conditionalSection.querySelectorAll('input, select, textarea');
        conditionalFields.forEach(field => {
            if (field.type === 'hidden') {
                field.value = '';
            } else if (field.type === 'radio' || field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        });
        
        // Remover seleções visuais de botões
        conditionalSection.querySelectorAll('.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
}

function mostrarMensagem(tipo, texto) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `message ${tipo}`;
        messageDiv.textContent = texto;
        messageDiv.style.display = 'block';
        
        messageDiv.scrollIntoView({ behavior: 'smooth' });
        
        if (tipo === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Mapeamento de campos para números de perguntas
const fieldToQuestionMap = {
    'conhecimento_aulas': 1,
    'material_didatico': 2,
    'experiencia_loja': 3,
    'suporte_loja': 4,
    'custo_beneficio': 5,
    'qualidade_kits': 6,
    'importancia_formacao': 7,
    'interesse_filho': 8,
    'desenvolvimento_habilidades': 9,
    'engajamento_equipe': 10,
    'pontos_fortes': 11,
    'melhorias_sugestoes': 12,
    'continuar_programa': 13,
    'escola': 'Escola',
    'segmento': 'Segmento',
    'nome_completo': 'Nome completo'
};

function showValidationPopup(missingQuestions) {
    const overlay = document.getElementById('validation-popup-overlay');
    const grid = document.getElementById('missing-questions-grid');
    
    // Limpar grid anterior
    grid.innerHTML = '';
    
    // Adicionar itens das perguntas em falta
    missingQuestions.forEach(questionNumber => {
        const item = document.createElement('div');
        item.className = 'missing-question-item';
        
        if (typeof questionNumber === 'number') {
            item.textContent = `Pergunta ${questionNumber}`;
            item.onclick = () => {
                closeValidationPopup();
                scrollToQuestion(questionNumber);
            };
        } else {
            item.textContent = questionNumber;
            item.onclick = () => {
                closeValidationPopup();
                scrollToField(questionNumber);
            };
        }
        
        grid.appendChild(item);
    });
    
    // Mostrar popup
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeValidationPopup() {
    const overlay = document.getElementById('validation-popup-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function scrollToQuestion(questionNumber) {
    const questionElement = document.getElementById(`pergunta-${questionNumber}`);
    if (questionElement) {
        questionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        // Adicionar efeito visual temporário
        questionElement.style.outline = '3px solid #FF662B';
        setTimeout(() => {
            questionElement.style.outline = '';
        }, 3000);
    }
}

function scrollToField(fieldName) {
    let selector;
    if (fieldName === 'Escola') {
        selector = '#escola-dropdown';
    } else if (fieldName === 'Segmento') {
        selector = '#segmento-dropdown';
    } else if (fieldName === 'Nome completo') {
        selector = '#nome_completo';
    }
    
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        // Adicionar efeito visual temporário
        element.style.outline = '3px solid #FF662B';
        setTimeout(() => {
            element.style.outline = '';
        }, 3000);
    }
}

function validarFormulario() {
    let isValid = true;
    let missingQuestions = [];
    console.log('=== VALIDAÇÃO DO FORMULÁRIO DE PAIS ===');

    // Remove mensagens de erro anteriores
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());

    // Verificar se a seção condicional está visível
    const conditionalSection = document.getElementById('conditional_questions');
    const isConditionalVisible = conditionalSection && conditionalSection.classList.contains('show');
    console.log('Seção condicional visível:', isConditionalVisible);

    // Campos obrigatórios sempre visíveis
    const alwaysRequiredFields = [
        'conhecimento_aulas',
        'escola',
        'segmento',
        'nome_completo'
    ];

    // Campos obrigatórios apenas quando a seção condicional está visível
    const conditionalRequiredFields = [
        'material_didatico', 
        'experiencia_loja',
        'suporte_loja',
        'custo_beneficio',
        'qualidade_kits',
        'importancia_formacao',
        'interesse_filho',
        'desenvolvimento_habilidades',
        'engajamento_equipe',
        'pontos_fortes',
        'melhorias_sugestoes',
        'continuar_programa'
    ];

    // Validar campos sempre obrigatórios
    alwaysRequiredFields.forEach(questionName => {
        const field = document.getElementById(questionName) || document.querySelector(`[name="${questionName}"]`);
        
        if (field) {
            if (field.type === 'hidden') {
                if (!field.value) {
                    isValid = false;
                    missingQuestions.push(fieldToQuestionMap[questionName]);
                    console.log(`❌ Campo obrigatório vazio: ${questionName}`);
                }
            } else if (field.type === 'radio') {
                const checked = document.querySelector(`input[name="${questionName}"]:checked`);
                if (!checked) {
                    isValid = false;
                    missingQuestions.push(fieldToQuestionMap[questionName]);
                    console.log(`❌ Campo obrigatório não selecionado: ${questionName}`);
                }
            } else {
                if (!field.value.trim()) {
                    isValid = false;
                    missingQuestions.push(fieldToQuestionMap[questionName]);
                    console.log(`❌ Campo obrigatório vazio: ${questionName}`);
                }
            }
        } else {
            console.log(`❌ Campo não encontrado: ${questionName}`);
        }
    });

    // Validar campos condicionais apenas se a seção estiver visível
    if (isConditionalVisible) {
        console.log('Validando campos condicionais...');
        conditionalRequiredFields.forEach(questionName => {
            const field = document.getElementById(questionName) || document.querySelector(`[name="${questionName}"]`);
            
            if (field) {
                if (field.type === 'hidden') {
                    if (!field.value) {
                        isValid = false;
                        missingQuestions.push(fieldToQuestionMap[questionName]);
                        console.log(`❌ Campo condicional vazio: ${questionName}`);
                    }
                } else if (field.type === 'radio') {
                    const checked = document.querySelector(`input[name="${questionName}"]:checked`);
                    if (!checked) {
                        isValid = false;
                        missingQuestions.push(fieldToQuestionMap[questionName]);
                        console.log(`❌ Campo condicional não selecionado: ${questionName}`);
                    }
                } else {
                    if (!field.value.trim()) {
                        isValid = false;
                        missingQuestions.push(fieldToQuestionMap[questionName]);
                        console.log(`❌ Campo condicional vazio: ${questionName}`);
                    }
                }
            }
        });
    }

    // Se houver campos faltando, mostrar popup
    if (!isValid && missingQuestions.length > 0) {
        showValidationPopup(missingQuestions);
    }

    console.log('Resultado da validação:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
    return isValid;
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#dc3545';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            errorMsg.textContent = message;
            
            formGroup.appendChild(errorMsg);
        }
    }
}

async function enviarFormulario(event) {
    event.preventDefault();
    
    if (!validarFormulario()) {
        // A validação agora mostra o popup automaticamente
        return false;
    }
    
    const form = document.getElementById('pesquisaForm');
    const submitBtn = document.querySelector('.submit-btn');
    const formData = new FormData(form);
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviando...';
    }
    
    try {
        const response = await fetch('processar-pesquisa.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagem('success', 'Pesquisa enviada com sucesso! Obrigado pela sua participação.');
            form.reset();
            document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.conditional-section').forEach(el => el.classList.remove('show'));
            document.querySelectorAll('.conditional-field').forEach(el => el.classList.remove('show'));
        } else {
            mostrarMensagem('error', result.message || 'Erro ao enviar a pesquisa. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar pesquisa:', error);
        mostrarMensagem('error', 'Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Pesquisa';
        }
    }
}

// Torna as funções globais
window.selectChoice = selectChoice;
window.selectScale = selectScale;
window.showConditionalQuestions = showConditionalQuestions;
window.hideConditionalQuestions = hideConditionalQuestions;
window.toggleExplanationField = toggleExplanationField;
window.showValidationPopup = showValidationPopup;
window.closeValidationPopup = closeValidationPopup;
window.scrollToQuestion = scrollToQuestion;
window.scrollToField = scrollToField;

// Função para reorganizar escalas 1-10 no mobile
function reorganizeScale10() {
    // Só reorganizar em telas mobile (768px ou menos)
    if (window.innerWidth <= 768) {
        const scale10Groups = document.querySelectorAll('.scale-10');
        
        scale10Groups.forEach(scaleGroup => {
            // Verificar se já foi reorganizada
            if (scaleGroup.querySelector('.scale-row-single')) {
                return; // Já foi reorganizada
            }
            
            const buttons = Array.from(scaleGroup.querySelectorAll('.scale-btn'));
            
            // Limpa o conteúdo atual
            scaleGroup.innerHTML = '';
            
            // Primeira linha: botão 1
            const row1 = document.createElement('div');
            row1.className = 'scale-row-single';
            row1.appendChild(buttons[0]); // botão 1
            scaleGroup.appendChild(row1);
            
            // Segunda linha: botões 2345
            const row2 = document.createElement('div');
            row2.className = 'scale-row-middle';
            for (let i = 1; i <= 4; i++) { // botões 2, 3, 4, 5
                row2.appendChild(buttons[i]);
            }
            scaleGroup.appendChild(row2);
            
            // Terceira linha: botões 6789
            const row3 = document.createElement('div');
            row3.className = 'scale-row-middle';
            for (let i = 5; i <= 8; i++) { // botões 6, 7, 8, 9
                row3.appendChild(buttons[i]);
            }
            scaleGroup.appendChild(row3);
            
            // Quarta linha: botão 10
            const row4 = document.createElement('div');
            row4.className = 'scale-row-single';
            row4.appendChild(buttons[9]); // botão 10
            scaleGroup.appendChild(row4);
        });
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pesquisa JS carregado - versão limpa');
    
    // Reorganizar escalas 1-10 no mobile
    reorganizeScale10();
    
    // Configurar eventos dos botões de escala com debug
    document.querySelectorAll('.scale-buttons').forEach((scaleGroup, index) => {
        const fieldName = scaleGroup.getAttribute('data-name');
        console.log(`Configurando escala ${index + 1}:`, fieldName);
        
        scaleGroup.querySelectorAll('.scale-btn').forEach((button, btnIndex) => {
            const value = button.getAttribute('data-value');
            console.log(`  Botão ${btnIndex + 1}: valor = ${value}`);
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`CLIQUE: Botão ${value} da escala ${fieldName}`);
                selectScale(this, fieldName, value);
            });
        });
    });
    
    // Configurar eventos dos botões de escolha com debug (horizontais e verticais)
    document.querySelectorAll('.choice-btn, .choice-btn-vertical').forEach((button, index) => {
        const fieldName = button.getAttribute('data-name');
        const value = button.getAttribute('data-value');
        console.log(`Configurando botão escolha ${index + 1}: ${fieldName} = ${value}`);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`CLIQUE: Botão escolha ${fieldName} = ${value}`);
            selectChoice(this, fieldName, value);
            
            // Controlar seção condicional baseado na resposta de conhecimento_aulas
            if (fieldName === 'conhecimento_aulas') {
                if (value === 'sim') {
                    showConditionalQuestions();
                } else {
                    hideConditionalQuestions();
                }
            }
        });
    });
    
    // Configurar auto-resize para textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        autoResizeTextarea(textarea);
    });
    
    // Configurar envio do formulário
    const form = document.getElementById('pesquisaForm');
    if (form) {
        form.addEventListener('submit', enviarFormulario);
    }
    
    // Configurar eventos do popup de validação
    const popupOverlay = document.getElementById('validation-popup-overlay');
    if (popupOverlay) {
        // Fechar popup ao clicar no overlay (fora do popup)
        popupOverlay.addEventListener('click', function(event) {
            if (event.target === popupOverlay) {
                closeValidationPopup();
            }
        });
        
        // Fechar popup com tecla ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && popupOverlay.classList.contains('show')) {
                closeValidationPopup();
            }
        });
    }
    
    // Configurar eventos de foco para remover erros
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = '#dee2e6';
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
    
    // Configurar evento para campo escola (mostrar/ocultar "Outra escola")
    const escolaSelect = document.getElementById('escola');
    if (escolaSelect) {
        escolaSelect.addEventListener('change', function() {
            const outroContainer = document.getElementById('outro_escola_container');
            const outroInput = document.getElementById('escola_outro');
            
            if (outroContainer) {
                if (this.value === 'Outra escola') {
                    outroContainer.style.display = 'block';
                    if (outroInput) {
                        outroInput.setAttribute('required', 'required');
                    }
                } else {
                    outroContainer.style.display = 'none';
                    if (outroInput) {
                        outroInput.removeAttribute('required');
                        outroInput.value = '';
                    }
                }
            }
        });
    }
    
    console.log('Eventos configurados com sucesso');
    
    // Listener para reorganizar ao redimensionar a tela
    window.addEventListener('resize', function() {
        reorganizeScale10();
    });
}); 