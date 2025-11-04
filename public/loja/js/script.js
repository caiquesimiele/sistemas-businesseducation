// Funções de validação
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Validação do primeiro dígito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto > 9 ? 0 : resto;
    
    // Validação do segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto > 9 ? 0 : resto;
    
    return cpf.charAt(9) == digito1 && cpf.charAt(10) == digito2;
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarCelular(celular) {
    // Para PhoneDDISelector, aceita formato com código do país
    if (window.phoneDDI && window.phoneDDI.getFormattedNumber) {
        const fullNumber = window.phoneDDI.getFormattedNumber();
        
        // 🚨 CORREÇÃO CRÍTICA: Campo celular é OBRIGATÓRIO
        // Se está vazio ou nulo, é inválido
        if (!fullNumber || fullNumber.trim() === '') {
            return false;
        }
        
        // Valida se tem pelo menos o código do país + número mínimo
        return fullNumber.length >= 10;
    }
    
    // Fallback para validação simples
    celular = (celular || '').replace(/\D/g, '');
    
    // 🚨 CORREÇÃO CRÍTICA: Campo celular é OBRIGATÓRIO
    if (celular.length === 0) {
        return false;
    }
    
    return celular.length >= 10; // Aceita números internacionais
}

function validarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    return cep.length === 8;
}

function validarCartao(numero) {
    numero = numero.replace(/\D/g, '');
    return numero.length >= 13 && numero.length <= 19;
}

function detectCardBrand(numero) {
    numero = numero.replace(/\D/g, '');
    
    // ELO
    const eloRegex = /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05([0-9])|06([0-9])|07([0-9])|08([0-9])|4([0-3][0-9]|8([5-9])|9([0-9]))|5([0-9][0-9])|6([0-9][0-9])|7([0-9][0-9])|9([0-9][0-9]))|65165([2-9])|65500([0-9])|6550([0-4][0-9]|5[0-8]))/;
    
    // Visa
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
    
    // Mastercard
    const mastercardRegex = /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/;
    
    // Hipercard
    const hipercardRegex = /^(606282\d{10}(\d{3})?)|(3841\d{15})$/;
    
    // American Express
    const amexRegex = /^3[47][0-9]{13}$/;
    
    if (eloRegex.test(numero)) return 'elo';
    if (visaRegex.test(numero)) return 'visa';
    if (mastercardRegex.test(numero)) return 'mastercard';
    if (hipercardRegex.test(numero)) return 'hipercard';
    if (amexRegex.test(numero)) return 'amex';
    
    return 'unknown';
}

function validarValidade(validade) {
    const [mes, ano] = validade.split('/');
    if (!mes || !ano || mes.length !== 2 || ano.length !== 2) return false;
    
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear() % 100;
    const mesAtual = dataAtual.getMonth() + 1;
    
    if (mesNum < 1 || mesNum > 12) return false;
    if (anoNum < anoAtual || (anoNum === anoAtual && mesNum < mesAtual)) return false;
    
    return true;
}

function validarCVV(cvv) {
    cvv = cvv.replace(/\D/g, '');
    return cvv.length === 3 || cvv.length === 4;
}

// Funções de formatação
function formatarCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substr(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

// Função formatarCelular removida - usando PhoneDDISelector
// function formatarCelular(input) {
//     let value = input.value.replace(/\D/g, '');
//     if (value.length > 11) value = value.substr(0, 11);
//     value = value.replace(/(\d{2})(\d)/, '($1) $2');
//     value = value.replace(/(\d{5})(\d)/, '$1-$2');
//     input.value = value;
// }

function formatarCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substr(0, 8);
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = value;
}

function formatarCartao(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substr(0, 16);
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    input.value = value;
}

function formatarValidade(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    if (value.length >= 2) value = value.substr(0, 2) + '/' + value.substr(2);
    input.value = value;
}

function formatarCVV(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    input.value = value;
}

// Funções para mensagens de feedback
function showErrorMessage(message) {
    // Remove qualquer popup anterior
    const old = document.getElementById('custom-error-popup');
    if (old) old.remove();

    // Cria backdrop escuro
    const backdrop = document.createElement('div');
    backdrop.id = 'custom-error-popup';
    backdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.45); z-index: 999999; display: flex;
        align-items: center; justify-content: center;`;

    // Cria o popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: #fff; color: #c62828; padding: 38px 32px 28px 32px;
        border-radius: 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        max-width: 90vw; min-width: 320px; max-width: 420px;
        text-align: center; font-size: 1.25rem; font-family: 'Segoe UI', Arial, sans-serif;
        display: flex; flex-direction: column; align-items: center;
        position: relative;
        animation: popupIn 0.4s cubic-bezier(.68,-0.55,.27,1.55);
    `;
    popup.innerHTML = `<div style="margin-bottom: 18px;">${message}</div>`;

    // Botão OK
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.style.cssText = `
        background: #c62828; color: #fff; border: none; border-radius: 8px;
        font-size: 1.1rem; font-weight: bold; padding: 10px 36px; margin-top: 8px;
        cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: background 0.2s, transform 0.1s;
    `;
    btn.onmouseover = () => btn.style.background = '#a31515';
    btn.onmouseout = () => btn.style.background = '#c62828';
    btn.onmousedown = () => btn.style.transform = 'scale(0.97)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => backdrop.remove();
    popup.appendChild(btn);

    // Animação
    const style = document.createElement('style');
    style.textContent = `@keyframes popupIn { 0% { opacity: 0; transform: scale(0.92);} 100% { opacity: 1; transform: scale(1);} }`;
    document.head.appendChild(style);

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'background-color: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 4px; margin: 10px 0; text-align: center; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Inicialização do seletor DDI
    if (typeof window.PhoneDDISelector !== 'undefined') {
        // Primeiro, configurar o container com a classe correta
        const phoneContainer = document.getElementById('phone-container-celular');
        if (phoneContainer) {
            phoneContainer.className = 'phone-input-container phone-input-full-width';
            phoneContainer.id = 'phone-container-celular';
            
            // Inicializar o seletor DDI
            window.phoneDDI = new window.PhoneDDISelector('phone-container-celular', {
                placeholder: '(11) 99999-9999',
                defaultCountry: 'BR',
                onPhoneChange: function(displayValue, formattedNumber, isValid) {
                    // SEMPRE atualizar campo oculto com o número completo formatado (+551199999999)
                    const hiddenInput = document.getElementById('celular_hidden');
                    if (hiddenInput) {
                        hiddenInput.value = formattedNumber;
                    }
                    
                    // Validar em tempo real
                    const errorElement = document.getElementById('celular-error');
                    if (errorElement) {
                        if (displayValue && !isValid) {
                            errorElement.style.display = 'block';
                        } else {
                            errorElement.style.display = 'none';
                        }
                    }
                },
                onCountryChange: function(country, previousCountry) {
                    // Quando país muda, garantir que o campo oculto é atualizado
                    const hiddenInput = document.getElementById('celular_hidden');
                    if (hiddenInput && window.phoneDDI) {
                        hiddenInput.value = window.phoneDDI.getFormattedNumber();
                    }
                }
            });
            
            // Sincronizar campo inicial se houver valor do localStorage
            setTimeout(() => {
                // Restaurar celular do localStorage se disponível
                const formDataRaw = localStorage.getItem('formData');
                if (formDataRaw) {
                    try {
                        const formData = JSON.parse(formDataRaw);
                        if (formData.celular && window.phoneDDI && window.phoneDDI.setFullNumber) {
                            console.log('DEBUG: script.js - Restaurando celular do localStorage:', formData.celular);
                            const sucesso = window.phoneDDI.setFullNumber(formData.celular);
                            console.log('DEBUG: script.js - Celular restaurado:', sucesso ? 'sucesso' : 'falhou');
                        }
                    } catch (e) {
                        console.log('DEBUG: script.js - Erro ao restaurar celular:', e);
                    }
                }
            }, 200); // Aumentar delay para garantir que PhoneDDI esteja completamente inicializado
        }
        console.log('Phone DDI Selector initialized');
    }
    
    // Inicialização dos campos dos filhos
    const qtdFilhosSelect = document.getElementById('qtd_filhos');
    if (qtdFilhosSelect) {
        console.log('Found qtd_filhos select');
        qtdFilhosSelect.addEventListener('change', function() {
            console.log('Quantidade de filhos changed:', this.value);
            
            mostrarCamposFilhos();
        });
        } else {
        console.error('qtd_filhos select not found');
    }

    // Garante que todos os produtos estejam visíveis inicialmente
    document.querySelectorAll('.produto').forEach(produto => {
        produto.style.display = 'block';
        const input = produto.querySelector('input[name^="quantidade"]');
        const botoes = produto.querySelectorAll('.btn-quantidade');
        if (input) {
            botoes.forEach(botao => {
                botao.disabled = true;
            });
            produto.classList.add('produto-disabled');
            produto.title = 'Selecione a série correspondente para habilitar este produto';
        }
    });

    // Inicialização do endereço de faturamento
    const mesmoEnderecoCheck = document.getElementById('mesmo_endereco');
    if (mesmoEnderecoCheck) {
        mesmoEnderecoCheck.addEventListener('change', function() {
        const container = document.getElementById('endereco-faturamento-container');
            container.style.display = this.checked ? 'none' : 'block';
            
            const campos = ['cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
            campos.forEach(campo => {
                const input = document.getElementById(`faturamento_${campo}`);
                if (input) {
                    input.required = !this.checked;
                    if (this.checked) {
                        // Copiar valores do endereço de entrega
                        const entregaInput = document.getElementById(`entrega_${campo}`);
                        if (entregaInput) {
                            input.value = entregaInput.value || '';
                        }
                        
                        // Adicionar listener para manter sincronizado
                        entregaInput.addEventListener('change', function() {
                            if (document.getElementById('mesmo_endereco').checked) {
                                input.value = this.value;
                            }
                        });
                    }
                }
            });
        });
        // Configura estado inicial do endereço de faturamento
        mesmoEnderecoCheck.dispatchEvent(new Event('change'));
    }

    // Inicialização do método de pagamento
    const formaPagamentoInputs = document.querySelectorAll('input[name="forma_pagamento"]');
    formaPagamentoInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const blocoCartao = document.getElementById('bloco-cartao');
            const camposCartao = blocoCartao.querySelectorAll('input, select');
            
            if (this.value === 'cartao') {
                blocoCartao.style.display = 'block';
                camposCartao.forEach(campo => campo.required = true);
            } else {
                blocoCartao.style.display = 'none';
                camposCartao.forEach(campo => campo.required = false);
            }
        });
    });
    // Configura estado inicial do método de pagamento
    const formaPagamentoSelecionada = document.querySelector('input[name="forma_pagamento"]:checked');
    if (formaPagamentoSelecionada) {
        formaPagamentoSelecionada.dispatchEvent(new Event('change'));
    }

    // Event listeners para formatação de campos
    const formatacoes = {
        'cpf': formatarCPF,
        // 'celular': formatarCelular, // Removido - usando PhoneDDISelector
        'entrega_cep': formatarCEP,
        'faturamento_cep': formatarCEP,
        'numero_cartao': (input) => {
            formatarCartao(input);
            const cardBrand = detectCardBrand(input.value);
            const brandDisplay = document.getElementById('card-brand-display');
            if (brandDisplay) {
                brandDisplay.textContent = cardBrand.toUpperCase();
                // Add card brand to a hidden input for form submission
                const brandInput = document.getElementById('card_brand');
                if (brandInput) {
                    brandInput.value = cardBrand;
                }
            }
        },
        'validade_cartao': formatarValidade,
        'cvv_cartao': formatarCVV
    };

    Object.entries(formatacoes).forEach(([id, formatador]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', function() {
                formatador(this);
            });
        }
    });

    // Event listeners para validação de campos
    const validacoes = {
        'cpf': validarCPF,
        'email': validarEmail,
        'celular': validarCelular,
        'entrega_cep': validarCEP,
        'faturamento_cep': validarCEP
    };

    Object.entries(validacoes).forEach(([id, validador]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                const isValid = validador(this.value);
                
                // Sistema unificado de feedback
                this.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                if (this.value.trim() === '') {
                    this.classList.add('campo-neutro');
                } else if (isValid) {
                    this.classList.add('campo-valido');
                } else {
                    this.classList.add('campo-invalido');
                    this.classList.add('invalid'); // Mantém compatibilidade
                }
                
                const erro = document.getElementById(`${id}-error`);
                if (erro) erro.style.display = isValid ? 'none' : 'block';
            });
        }
    });

    // Event listeners para busca de CEP
    ['entrega_cep', 'faturamento_cep'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                const tipo = id.split('_')[0];
                const isValid = validarCEP(this.value);
                if (isValid) {
                    buscarCEP(this.value, tipo);
                }
            });
        }
    });

    // Botão de pagamento
    const botaoPagar = document.getElementById('botao-pagar');
    if (botaoPagar) {
        botaoPagar.addEventListener('click', function(e) {
            e.preventDefault();
            
            // NOVA IMPLEMENTAÇÃO: Captura completa de dados do formulário
            try {
                // Coletar dados do formulário diretamente
                const dadosFormulario = {
                    // Dados pessoais
                    nome: document.getElementById('nome')?.value || '',
                    sobrenome: document.getElementById('sobrenome')?.value || '',
                    cpf: document.getElementById('cpf')?.value.replace(/\D/g, '') || '',
                    celular: window.phoneDDI ? window.phoneDDI.getFormattedNumber() : (document.getElementById('celular_hidden')?.value || ''),
                    email: document.getElementById('email')?.value || '',
                    qtd_filhos: document.getElementById('qtd_filhos')?.value || '0',
                    
                    // Dados de pagamento
                    forma_pagamento: document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'pix',
                    valor_total: document.getElementById('valor_total')?.value || '0',
                    
                    // Endereço de entrega
                    entrega_cep: document.getElementById('entrega_cep')?.value.replace(/\D/g, '') || '',
                    entrega_endereco: document.getElementById('entrega_endereco')?.value || '',
                    entrega_numero: document.getElementById('entrega_numero')?.value || '',
                    entrega_complemento: document.getElementById('entrega_complemento')?.value || '',
                    entrega_bairro: document.getElementById('entrega_bairro')?.value || '',
                    entrega_cidade: document.getElementById('entrega_cidade')?.value || '',
                    entrega_estado: document.getElementById('entrega_estado')?.value || '',
                    
                    // Endereço de faturamento
                    mesmo_endereco: document.getElementById('mesmo_endereco')?.checked || false,
                    faturamento_cep: document.getElementById('faturamento_cep')?.value.replace(/\D/g, '') || '',
                    faturamento_endereco: document.getElementById('faturamento_endereco')?.value || '',
                    faturamento_numero: document.getElementById('faturamento_numero')?.value || '',
                    faturamento_complemento: document.getElementById('faturamento_complemento')?.value || '',
                    faturamento_bairro: document.getElementById('faturamento_bairro')?.value || '',
                    faturamento_cidade: document.getElementById('faturamento_cidade')?.value || '',
                    faturamento_estado: document.getElementById('faturamento_estado')?.value || '',
                    
                    // Arrays vazios para filhos e produtos
                    filhos: [],
                    produtos: []
                };
                
                // Coletar dados dos filhos
                const qtdFilhos = parseInt(dadosFormulario.qtd_filhos) || 0;
                for (let i = 1; i <= qtdFilhos; i++) {
                    const nomeFilho = document.getElementById(`nome_filho_${i}`)?.value || '';
                    const serieFilho = document.getElementById(`serie_filho_${i}`)?.value || '';
                    
                    if (nomeFilho || serieFilho) {
                        dadosFormulario.filhos.push({
                            indice: i,
                            nome: nomeFilho,
                            serie: serieFilho
                        });
                    }
                }
                
                // Coletar dados dos produtos
                document.querySelectorAll('.produto').forEach((produto, index) => {
                    const select = produto.querySelector('input[name^="quantidade"]');
                    if (!select) return;
                    
                    const quantidade = parseInt(select.value) || 0;
                    if (quantidade <= 0) return;
                    
                    const nameAttr = select.getAttribute('name');
                    const match = nameAttr.match(/quantidade\[(.*?)\]/);
                    if (!match || !match[1]) return;
                    
                    const produtoId = match[1];
                    const nome = produto.querySelector('.produto-nome')?.textContent.trim() || '';
                    const valorPix = produto.querySelector('.valor-pix')?.textContent.trim() || '';
                    
                    dadosFormulario.produtos.push({
                        id: produtoId,
                        nome: nome,
                        quantidade: quantidade,
                        valor: valorPix
                    });
                });
                
                // Adicionar metadados
                dadosFormulario.metadata = {
                    timestamp: new Date().toISOString(),
                    timestamp_local: new Date().toString(),
                    dispositivo: navigator.userAgent
                };
                
                // Registra o log de tentativa de pagamento com dados completos
                const storeId = getCurrentStoreId();
                
                // CORREÇÃO CIRÚRGICA v2.1.5: URL corrigido para nova estrutura /stores/
                fetch('/stores/' + storeId + '/customers/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify({
                        type: 'initiated',
                        data: dadosFormulario
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Log registrado com sucesso:', data);
                })
                .catch(err => {
                    console.error('Erro ao registrar log:', err);
                });
            } catch (err) {
                console.error('Erro ao coletar dados do formulário:', err);
            }
            
            // Continua com o processo normal de validação e pagamento
            if (validarFormulario()) {
                processarPagamento();
            } else {
                // Se falhou na validação, registra um log de erro
                registrarLogClienteLoja('error', {
                    erro: {
                        tipo: 'validacao',
                        mensagem: 'Falha na validação do formulário'
                    }
                }).catch(err => {
                    console.error('Erro ao registrar falha de validação:', err);
                });
            }
        });
    }

    // NOVA FUNÇÃO: Captura dados completos de frete para envio ao backend
    async function capturarDadosFreteCompletos() {
        try {
            console.log('🔍 capturarDadosFreteCompletos: Iniciando captura...');
            
            // DEBUG SUPER DETALHADO: Antes de buscar, vamos listar TODOS os campos hidden
            console.log('🔍 === DEBUG: Listando TODOS os campos hidden no DOM ===');
            const allHiddenFields = document.querySelectorAll('input[type="hidden"]');
            allHiddenFields.forEach(field => {
                if (field.name.includes('frete_')) {
                    console.log(`🔍 Campo hidden encontrado: name="${field.name}", id="${field.id}", value="${field.value}"`);
                }
            });
            
            // DEBUG: Verificar estado do FreteManager
            if (window.freteManager) {
                console.log('🔍 FreteManager ativo:', {
                    selectedOption: window.freteManager.selectedOption,
                    officialServices: Object.keys(window.freteManager.officialServices || {}).length
                });
            } else {
                console.log('⚠️ FreteManager não encontrado!');
            }
            
            // CORREÇÃO URGENTE: Buscar campos em todos os formulários possíveis
            const getAllFields = (fieldName) => {
                console.log(`🔍 Buscando campo: ${fieldName}...`);
                
                // 1. Tentar getElementById primeiro
                let field = document.getElementById(fieldName);
                console.log(`🔍 ${fieldName} por ID:`, field ? `value="${field.value}", exists=true` : 'not found');
                if (field && field.value) {
                    console.log(`✅ Campo ${fieldName} encontrado por ID:`, field.value);
                    return field.value;
                }
                
                // 2. Buscar por name em todos os forms
                const forms = document.querySelectorAll('form');
                console.log(`🔍 Buscando ${fieldName} em ${forms.length} formulários...`);
                for (let i = 0; i < forms.length; i++) {
                    const form = forms[i];
                    const formField = form.querySelector(`[name="${fieldName}"]`);
                    console.log(`🔍 Form ${i}: ${fieldName}`, formField ? `value="${formField.value}"` : 'not found');
                    if (formField && formField.value) {
                        console.log(`✅ Campo ${fieldName} encontrado em form ${i} por name:`, formField.value);
                        return formField.value;
                    }
                }
                
                // 3. Buscar em document inteiro
                const globalField = document.querySelector(`[name="${fieldName}"]`);
                console.log(`🔍 ${fieldName} globalmente:`, globalField ? `value="${globalField.value}"` : 'not found');
                if (globalField && globalField.value) {
                    console.log(`✅ Campo ${fieldName} encontrado globalmente:`, globalField.value);
                    return globalField.value;
                }
                
                console.log(`❌ Campo ${fieldName} NÃO encontrado ou está vazio!`);
                return '';
            };
            
            // CORREÇÃO AUTOMÁTICA: Se FreteManager está ativo mas campos estão vazios, força atualização
            if (window.freteManager && window.freteManager.selectedOption) {
                console.log('🔧 FreteManager detectado com seleção ativa. Forçando atualização dos campos...');
                
                // Força atualização dos campos hidden
                window.freteManager.updateHiddenFields();
                
                // Aguarda 100ms para garantir que os campos foram atualizados
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Re-lista campos após força atualização
                console.log('🔍 === APÓS FORÇA ATUALIZAÇÃO: Listando campos hidden ===');
                const allHiddenFieldsAfter = document.querySelectorAll('input[type="hidden"]');
                allHiddenFieldsAfter.forEach(field => {
                    if (field.name.includes('frete_')) {
                        console.log(`🔍 Campo hidden pós-update: name="${field.name}", value="${field.value}"`);
                    }
                });
            }
            
            // Capturar campos com busca ampliada
            const freteValor = getAllFields('frete_valor') || '0';
            const freteOpcao = getAllFields('frete_opcao') || '';
            
            console.log('🔍 Campos básicos capturados:', {freteValor, freteOpcao});
            
            // CORREÇÃO: Capturar campos detalhados com busca ampliada
            let freteCompany = getAllFields('frete_company') || '';
            let freteService = getAllFields('frete_service') || '';
            let freteDeliveryTime = getAllFields('frete_delivery_time') || '0';
            let freteDeliveryRange = getAllFields('frete_delivery_range') || '';
            let freteMelhorEnvioId = getAllFields('frete_melhor_envio_id') || '';
            
            console.log('🔍 Campos detalhados capturados:', {
                freteCompany, freteService, freteDeliveryTime, 
                freteDeliveryRange, freteMelhorEnvioId
            });
            
            // VERIFICAÇÃO DE SEGURANÇA: Se campos estão vazios, tentar extrair do FreteManager
            if (!freteOpcao || !freteCompany || !freteService) {
                console.log('🚨 CAMPOS VAZIOS DETECTADOS - Tentando extrair do FreteManager...');
                
                if (window.freteManager && window.freteManager.selectedOption) {
                    const selectedOption = window.freteManager.selectedOption;
                    const details = selectedOption.details;
                    
                    console.log('🔄 Extraindo dados do FreteManager:', {
                        id: selectedOption.id,
                        price: selectedOption.price,
                        details: details
                    });
                    
                    // Sobrescrever com dados do FreteManager se disponíveis
                    if (!freteOpcao && selectedOption.id) {
                        freteOpcao = selectedOption.id.toString();
                        console.log('✅ frete_opcao extraído do FreteManager:', freteOpcao);
                    }
                    
                    if (!freteCompany && details?.company) {
                        freteCompany = details.company;
                        console.log('✅ frete_company extraído do FreteManager:', freteCompany);
                    }
                    
                    if (!freteService && details?.service) {
                        freteService = details.service;
                        console.log('✅ frete_service extraído do FreteManager:', freteService);
                    }
                    
                    if (!freteMelhorEnvioId && details?.melhor_envio_id) {
                        freteMelhorEnvioId = details.melhor_envio_id.toString();
                        console.log('✅ frete_melhor_envio_id extraído do FreteManager:', freteMelhorEnvioId);
                    }
                    
                    if (!freteDeliveryTime && details?.delivery_time) {
                        freteDeliveryTime = details.delivery_time.toString();
                        console.log('✅ frete_delivery_time extraído do FreteManager:', freteDeliveryTime);
                    }
                    
                    if (!freteDeliveryRange && details?.delivery_range) {
                        freteDeliveryRange = details.delivery_range;
                        console.log('✅ frete_delivery_range extraído do FreteManager:', freteDeliveryRange);
                    }
                    
                    console.log('🔍 DADOS FINAIS APÓS EXTRAÇÃO DO FRETEMANAGER:', {
                        freteOpcao, freteCompany, freteService, 
                        freteMelhorEnvioId, freteDeliveryTime, freteDeliveryRange
                    });
                } else {
                    console.log('❌ FreteManager não disponível ou sem seleção ativa');
                }
            }
            
            // NOVA VALIDAÇÃO: Verificar se é retirada na escola
            let isPickup = false;
            let pickupReason = null;
            
            if (freteOpcao === 'retirada_escola' || freteMelhorEnvioId === '' || freteMelhorEnvioId === null) {
                isPickup = true;
                pickupReason = 'Retirada na Escola';
            }
            
            // Estrutura completa e padronizada de dados de frete
            const freightDetails = {
                // Dados básicos de seleção
                selected_option: freteOpcao,
                valor: parseFloat(freteValor) || 0,
                
                // Dados da transportadora e serviço
                company: freteCompany || null,
                service: freteService || null,
                
                // Dados de prazo
                delivery_time: parseInt(freteDeliveryTime) || 0,
                delivery_range: freteDeliveryRange || null,
                
                // ID oficial da API Melhor Envio
                melhor_envio_id: freteMelhorEnvioId || null,
                
                // Metadados de seleção
                selected_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                
                // NOVO: Dados de retirada
                is_pickup: isPickup,
                pickup_reason: pickupReason,
                
                // NOVO: Dados de origem (para debug)
                captured_from: {
                    form_fields: true,
                    frete_manager_active: typeof window.freteManager !== 'undefined',
                    official_services_loaded: window.freteManager ? Object.keys(window.freteManager.officialServices || {}).length > 0 : false,
                    selected_option_details: window.freteManager ? window.freteManager.selectedOption : null
                }
            };
            
            // VALIDAÇÃO CRÍTICA: Verificar se dados foram capturados corretamente
            if (!isPickup && !freteMelhorEnvioId) {
                console.warn('AVISO: Serviço de frete selecionado mas ID Melhor Envio não encontrado');
                freightDetails.validation_warning = 'ID Melhor Envio ausente para serviço de transportadora';
            }
            
            // Log detalhado para debug
            console.log('📋 RESULTADO FINAL - Dados de frete capturados:', {
                basic: {
                    selected_option: freightDetails.selected_option,
                    valor: freightDetails.valor,
                    is_pickup: freightDetails.is_pickup
                },
                company_service: {
                    company: freightDetails.company,
                    service: freightDetails.service,
                    melhor_envio_id: freightDetails.melhor_envio_id
                },
                delivery: {
                    delivery_time: freightDetails.delivery_time,
                    delivery_range: freightDetails.delivery_range
                },
                metadata: freightDetails.captured_from
            });
            
            return freightDetails;
            
        } catch (error) {
            console.error('❌ Erro ao capturar dados de frete:', error);
            
            // Retornar estrutura mínima em caso de erro
            return {
                selected_option: null,
                valor: 0,
                company: null,
                service: null,
                delivery_time: 0,
                delivery_range: null,
                melhor_envio_id: null,
                selected_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                is_pickup: true,
                pickup_reason: 'Erro na captura - fallback para retirada',
                error: error.message,
                captured_from: {
                    form_fields: false,
                    error_occurred: true
                }
            };
        }
    }

    // Inicialização dos produtos
    atualizarProdutosVisiveis();

    // Event listener para atualizar valores quando a quantidade de filhos mudar
    if (qtdFilhosSelect) {
        qtdFilhosSelect.addEventListener('change', atualizarValores);
        // Atualiza os valores iniciais
        atualizarValores();
    }

    // Criar e adicionar o elemento de loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); z-index: 9999; justify-content: center; align-items: center;';
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <p style="margin-top: 10px;">Processando pagamento...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);

    // Adicionar o estilo da animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // NOVA: Verificar se é refresh ou cancelamento PIX
    const isFromPixCancel = localStorage.getItem('pix_cancelled');
    console.log('DEBUG: Carregamento da página:', isFromPixCancel ? 'PIX cancelado' : 'Refresh/navegação normal');
    
    // Função para restaurar dados do formulário
    restoreFormData();
    
    // Garantir que os campos de filhos sejam mostrados corretamente após restaurar dados
    setTimeout(forcarMostrarCamposFilhos, 600);
    
    // NOVA: Se foi refresh normal (não cancelamento PIX), limpar dados persistentes
    if (!isFromPixCancel) {
        console.log('DEBUG: Refresh detectado, limpando dados de sessão...');
        setTimeout(() => {
            // CORREÇÃO: Só limpar dados dos filhos se NÃO houve restauração válida
            const qtdFilhosSelect = document.getElementById('qtd_filhos');
            if (qtdFilhosSelect) {
                // Verificar se campo foi restaurado com dados válidos
                const valorAtual = parseInt(qtdFilhosSelect.value) || 0;
                const camposFilhosContainer = document.getElementById('campos-filhos');
                const temCamposFilhos = camposFilhosContainer && camposFilhosContainer.querySelectorAll('.filho-container').length > 0;
                
                // Só limpar se não há dados restaurados válidos
                if (valorAtual === 0 && !temCamposFilhos) {
                    console.log('DEBUG: Limpando qtd_filhos - nenhum dado restaurado');
                    qtdFilhosSelect.value = '';
                    qtdFilhosSelect.dispatchEvent(new Event('change'));
                } else {
                    console.log('DEBUG: Mantendo qtd_filhos - dados restaurados válidos:', valorAtual);
                }
            }
            
            // Limpar produtos órfãos da seção correspondentes
            document.querySelectorAll('#produtos-correspondentes .produto').forEach(produto => {
                const produtoId = produto.getAttribute('data-produto-id');
                if (produtoId) {
                    console.log('DEBUG: Limpando produto órfão do refresh:', produtoId);
                    moverProdutoParaOriginais(produtoId);
                }
            });
            
            // Limpar localStorage para próxima sessão
            localStorage.removeItem('formData');
            console.log('DEBUG: FormData limpo após refresh');
        }, 1000);
    } else {
        // Remover flag após usar
        localStorage.removeItem('pix_cancelled');
    }
    
    // NOVA: Inicializar eventos de nomes dos filhos para atualização em tempo real
    adicionarEventosNomes();
    
    // NOVA: Inicializar sistema de posição original para produtos existentes
    inicializarSistemaPosicaoOriginal();

    // Inicializa os controles da galeria para cada produto
    if (window.productGalleriesData) {
        Object.keys(window.productGalleriesData).forEach(productId => {
            // Garante que a imagem secundária está inicializada corretamente
            const mainImage = document.getElementById('mainProductImage_' + productId);
            const secondaryImage = document.getElementById('secondaryProductImage_' + productId);
            
            if (mainImage && secondaryImage) {
                // Garante que a imagem principal começa como ativa
                mainImage.classList.add('active');
                secondaryImage.classList.remove('active');
            }
            
            updateGalleryControls(productId);
            centerActiveThumbnail(productId);
        });
    }
});

// Mapeamento de séries para produtos
// Será substituído pelo mapeamento vindo do PHP (window.serieParaProduto)
const serieParaProduto = window.serieParaProduto || {
    '1º ano Fundamental': '1º-ano-fundamental',
    '2º ano Fundamental': '2º-ano-fundamental',
    '3º ano Fundamental': '3º-ano-fundamental',
    '4º ano Fundamental': '4º-ano-fundamental',
    '5º ano Fundamental': '5º-ano-fundamental',
    '6º ano Fundamental': '6º-ano-fundamental',
    '7º ano Fundamental': '7º-ano-fundamental',
    '8º ano Fundamental': '8º-ano-fundamental',
    '9º ano Fundamental': '9º-ano-fundamental',
    '1º ano Médio': '1º-ano-medio',
    '2º ano Médio': '2º-ano-medio',
    '3º ano Médio': '3º-ano-medio'
};

// Função para mostrar campos dos filhos
function mostrarCamposFilhos() {
    console.log('mostrarCamposFilhos called');
    const qtdFilhosSelect = document.getElementById('qtd_filhos');
    const qtdFilhos = parseInt(qtdFilhosSelect.value) || 0;
    console.log('Quantidade de filhos:', qtdFilhos);
    
    const container = document.getElementById('campos-filhos');
    if (!container) {
        console.error('campos-filhos container not found');
            return;
        }

    // Limpa o container mas mantém o título
    container.innerHTML = '<h3 style="text-align: left; margin-bottom: 20px;">Dados dos Filhos</h3>';

    // Se não houver filhos selecionados, retorna
    if (qtdFilhos === 0) {
        container.classList.remove('visible');
            return;
    }

    // Adiciona a classe visible para mostrar o container
    container.classList.add('visible');

    // Array com todas as séries disponíveis
    const series = [
        '1º ano Fundamental',
        '2º ano Fundamental',
        '3º ano Fundamental',
        '4º ano Fundamental',
        '5º ano Fundamental',
        '6º ano Fundamental',
        '7º ano Fundamental',
        '8º ano Fundamental',
        '9º ano Fundamental',
        '1º ano Médio',
        '2º ano Médio',
        '3º ano Médio'
    ];

    // Cria os campos para cada filho
    for (let i = 1; i <= qtdFilhos; i++) {
        // Container para os campos do filho atual
        const filhoContainer = document.createElement('div');
        filhoContainer.className = 'filho-container';

        // Row para nome e série
        const row = document.createElement('div');
        row.className = 'row';

        // Campo Nome
        const colNome = document.createElement('div');
        colNome.className = 'col';
        colNome.innerHTML = `
            <label for="nome_filho_${i}" class="required">Nome do ${i}º filho</label>
            <input type="text" id="nome_filho_${i}" name="nome_filho_${i}" required placeholder="Digite o nome completo">
            <div class="error" id="nome_filho_${i}-error">Digite o nome do filho</div>
        `;

        // Campo Série
        const colSerie = document.createElement('div');
        colSerie.className = 'col';
        
        let seriesOptions = series.map(serie => 
            `<option value="${serie}">${serie}</option>`
        ).join('');

        // Criar label
        const label = document.createElement('label');
        label.setAttribute('for', `serie_filho_${i}`);
        label.className = 'required';
        label.textContent = `Série do ${i}º filho`;
        
        // Criar select programaticamente para evitar conflitos
        const select = document.createElement('select');
        select.id = `serie_filho_${i}`;
        select.name = `serie_filho_${i}`;
        select.required = true;
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione a série';
        select.appendChild(defaultOption);
        
        // Adicionar opções de série
        series.forEach(serie => {
            const option = document.createElement('option');
            option.value = serie;
            option.textContent = serie;
            select.appendChild(option);
        });
        
        // Adicionar event listener
        select.addEventListener('change', () => {
            // Mostrar modal de pedido automático na primeira seleção de série do primeiro filho
            if (i === 1 && select.value) {
                mostrarModalPedidoAutomatico();
            }
            
            // Chama auto-seleção sempre que uma série for alterada
            autoSelecionarProdutos();
            // Mantém a funcionalidade original
            atualizarProdutosVisiveis();
            
            // NOVA: Salvar dados quando série for alterada
            if (typeof saveFormData === 'function') {
                saveFormData();
            }
        });
        
        // Criar div de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.id = `serie_filho_${i}-error`;
        errorDiv.textContent = 'Selecione a série';
        
        // Adicionar elementos ao container
        colSerie.appendChild(label);
        colSerie.appendChild(select);
        colSerie.appendChild(errorDiv);

        // Adiciona as colunas à row
        row.appendChild(colNome);
        row.appendChild(colSerie);

        // Adiciona a row ao container do filho
        filhoContainer.appendChild(row);

        // Adiciona o container do filho ao container principal
        container.appendChild(filhoContainer);
        
        // NOVA: Adicionar event listener para campo nome após criação
        const nomeInput = document.getElementById(`nome_filho_${i}`);
        if (nomeInput) {
            nomeInput.addEventListener('input', () => {
                // Salvar dados quando nome for alterado
                if (typeof saveFormData === 'function') {
                    saveFormData();
                }
            });
        }
    }

    // Força a visibilidade do container
    container.style.display = 'block';

    // Aplicar dropdowns customizados aos novos selects
    if (window.applyCustomDropdowns) {
        window.applyCustomDropdowns(container);
    }

    // Atualiza a visibilidade dos produtos
    // Pequeno delay para garantir que o DOM está atualizado
    setTimeout(() => {
        // NOVA: Limpar produtos órfãos primeiro (quando quantidade diminui)
        limparProdutosOrfaos();
        
        atualizarProdutosVisiveis();
        // NOVA: Executar auto-seleção após criar campos
        autoSelecionarProdutos();
    }, 100);
}

// Função para garantir que os campos de filhos são mostrados corretamente
function forcarMostrarCamposFilhos() {
    const qtdFilhosSelect = document.getElementById('qtd_filhos');
    if (qtdFilhosSelect && qtdFilhosSelect.value && parseInt(qtdFilhosSelect.value) > 0) {
        mostrarCamposFilhos();
    }
}

// Função para atualizar produtos visíveis
function atualizarProdutosVisiveis() {
    console.log('Atualizando produtos visíveis');
    const produtos = document.querySelectorAll('.produto');
    const seriesSelecionadas = new Set();

    // Coleta todas as séries selecionadas
    document.querySelectorAll('select[name^="serie_filho_"]').forEach(select => {
        const serie = select.value;
        console.log('Série selecionada:', serie);
        if (serie && serieParaProduto[serie]) {
            const produtoMapeado = serieParaProduto[serie];
            console.log('Produto mapeado pela série:', produtoMapeado);
            seriesSelecionadas.add(produtoMapeado);
        }
    });

    console.log('Séries selecionadas mapeadas para produtos:', Array.from(seriesSelecionadas));

    // Debug: mostrar todos os produtos disponíveis
    produtos.forEach(produto => {
        const input = produto.querySelector('input[name^="quantidade"]');
        if (input) {
            const name = input.getAttribute('name');
            console.log('Produto disponível: input name=', name);
        }
    });

    // Atualiza os produtos baseado nas séries selecionadas
    produtos.forEach(produto => {
        const input = produto.querySelector('input[name^="quantidade"]');
        if (!input) return;

        const nameAttr = input.getAttribute('name');
        // Extrai ID do produto do atributo name do input
        const match = nameAttr.match(/quantidade\[(.*?)\]/);
        if (!match) return;
        
        const produtoId = match[1];
        console.log('Verificando produto:', produtoId);
        
        // Todos os produtos ficam visíveis
        produto.style.display = 'block';
        
        // Verificamos se o produto está na lista de produtos habilitados
        let habilitado = false;
        
        // Verifica se o produtoId exato está nas séries selecionadas
        seriesSelecionadas.forEach(serie => {
            if (serie === produtoId) {
                console.log(`MATCH! Produto ${produtoId} corresponde à série ${serie}`);
                habilitado = true;
            }
        });
        
        // Obtém todos os botões de quantidade para este produto
        const botoes = produto.querySelectorAll('.btn-quantidade');
        
        if (habilitado) {
            // Habilita os botões de quantidade
            console.log('Habilitando produto:', produtoId);
            botoes.forEach(botao => {
                botao.disabled = false;
            });
            produto.classList.remove('produto-disabled');
            produto.title = '';
        } else {
            // Desabilita os botões de quantidade e reseta o input para 0
            console.log('Desabilitando produto:', produtoId);
            input.value = '0';
            botoes.forEach(botao => {
                botao.disabled = true;
                botao.classList.remove('active');
            });
            produto.classList.add('produto-disabled');
            produto.title = 'Selecione a série correspondente para habilitar este produto';
        }
    });

    // Atualiza os valores totais
    atualizarValores();
}

// ========== NOVAS FUNÇÕES: AUTO-SELEÇÃO DE PRODUTOS ==========

// Sistema para guardar posição original dos produtos
const produtosPosicaoOriginal = new Map();

// Função para guardar posição original de um produto
function guardarPosicaoOriginal(produtoElement) {
    const produtoId = produtoElement.querySelector('input[name^="quantidade"]')?.getAttribute('name')?.match(/quantidade\[(.*?)\]/)?.[1];
    if (!produtoId) return;
    
    // Guarda referência para o próximo elemento (para usar com insertBefore)
    const proximoElemento = produtoElement.nextElementSibling;
    const pai = produtoElement.parentElement;
    
    produtosPosicaoOriginal.set(produtoId, {
        proximoElemento: proximoElemento,
        pai: pai
    });
    
    console.log(`Posição original guardada para produto ${produtoId}:`, {proximoElemento, pai});
}

// Função para restaurar posição original de um produto
function restaurarPosicaoOriginal(produtoElement) {
    const produtoId = produtoElement.querySelector('input[name^="quantidade"]')?.getAttribute('name')?.match(/quantidade\[(.*?)\]/)?.[1];
    if (!produtoId) return;
    
    const posicaoOriginal = produtosPosicaoOriginal.get(produtoId);
    if (!posicaoOriginal) {
        console.error(`Posição original não encontrada para produto ${produtoId}`);
        // Fallback: adiciona no final da seção original
        const produtosOriginais = document.getElementById('produtos-originais');
        if (produtosOriginais) {
            produtosOriginais.appendChild(produtoElement);
        }
        return;
    }
    
    // NOVA: Validação robusta antes de inserir
    try {
        // Verifica se o elemento pai ainda existe no DOM
        if (!posicaoOriginal.pai || !document.contains(posicaoOriginal.pai)) {
            console.warn(`Pai original não existe mais, usando fallback para produto ${produtoId}`);
            const produtosOriginais = document.getElementById('produtos-originais');
            if (produtosOriginais) {
                produtosOriginais.appendChild(produtoElement);
            }
            return;
        }
        
        // Verifica se o próximo elemento ainda existe como filho do pai
        if (posicaoOriginal.proximoElemento) {
            if (posicaoOriginal.pai.contains(posicaoOriginal.proximoElemento)) {
                // Insere antes do próximo elemento
                posicaoOriginal.pai.insertBefore(produtoElement, posicaoOriginal.proximoElemento);
            } else {
                console.warn(`Próximo elemento não é mais filho do pai, adicionando no final para produto ${produtoId}`);
                posicaoOriginal.pai.appendChild(produtoElement);
            }
        } else {
            // Era o último elemento, adiciona no final
            posicaoOriginal.pai.appendChild(produtoElement);
        }
        
        console.log(`Posição original restaurada para produto ${produtoId}`);
    } catch (error) {
        console.error(`Erro ao restaurar posição do produto ${produtoId}:`, error);
        // Fallback final: adiciona na seção original
        const produtosOriginais = document.getElementById('produtos-originais');
        if (produtosOriginais) {
            produtosOriginais.appendChild(produtoElement);
        }
    }
}

// Função para inicializar o sistema de posição original para produtos já existentes
function inicializarSistemaPosicaoOriginal() {
    console.log('Inicializando sistema de posição original');
    
    const produtosOriginais = document.querySelectorAll('#produtos-originais .produto');
    produtosOriginais.forEach(produto => {
        const produtoId = produto.querySelector('input[name^="quantidade"]')?.getAttribute('name')?.match(/quantidade\[(.*?)\]/)?.[1];
        if (produtoId) {
            // Guarda posição inicial de todos os produtos
            const proximoElemento = produto.nextElementSibling;
            const pai = produto.parentElement;
            
            produtosPosicaoOriginal.set(produtoId, {
                proximoElemento: proximoElemento,
                pai: pai
            });
            
            console.log(`Posição inicial guardada para produto ${produtoId}`);
        }
    });
}

// Função para limpar produtos órfãos da seção correspondentes
function limparProdutosOrfaos() {
    console.log('Limpando produtos órfãos da seção correspondentes');
    
    const produtosCorrespondentes = document.querySelectorAll('#produtos-correspondentes .produto');
    const seriesAtivas = coletarSeriesSelecionadas();
    
    produtosCorrespondentes.forEach(produto => {
        const input = produto.querySelector('input[name^="quantidade"]');
        if (!input) return;
        
        const produtoId = input.getAttribute('name')?.match(/quantidade\[(.*?)\]/)?.[1];
        if (!produtoId) return;
        
        // Verifica se este produto ainda corresponde a uma série ativa
        let produtoTemSerie = false;
        Object.keys(seriesAtivas).forEach(serie => {
            if (serieParaProduto[serie] === produtoId) {
                produtoTemSerie = true;
            }
        });
        
        if (!produtoTemSerie) {
            console.log(`Produto órfão encontrado: ${produtoId}, movendo de volta para originais`);
            // NOVA: Força limpeza completa do produto órfão
            produto.classList.add('produto-disabled');
            moverProdutoParaOriginais(produtoId);
        }
    });
}

// Função para coletar séries selecionadas e suas quantidades
function coletarSeriesSelecionadas() {
    const seriesQuantidade = {};
    
    // Obter quantidade de filhos
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos')?.value || '0');
    
    // Coletar séries de cada filho
    for (let i = 1; i <= qtdFilhos; i++) {
        const serieSelect = document.getElementById(`serie_filho_${i}`);
        if (serieSelect && serieSelect.value) {
            const serie = serieSelect.value;
            seriesQuantidade[serie] = (seriesQuantidade[serie] || 0) + 1;
        }
    }
    
    console.log('Séries coletadas:', seriesQuantidade);
    return seriesQuantidade;
}

// Função para mover produto para seção correspondente com animação
function moverProdutoParaCorrespondentes(produtoId, quantidade) {
    console.log(`Movendo produto ${produtoId} para correspondentes com quantidade ${quantidade}`);
    
    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    if (!produtoElement) {
        console.warn(`Produto ${produtoId} não encontrado`);
        return;
    }
    
    const produtosOriginais = document.getElementById('produtos-originais');
    const produtosCorrespondentes = document.getElementById('produtos-correspondentes');
    
    if (!produtosOriginais || !produtosCorrespondentes) {
        console.error('Containers de produtos não encontrados');
        return;
    }
    
    // NOVA: Guardar posição original antes de mover
    guardarPosicaoOriginal(produtoElement);
    
    // NOVA: Remove classe disabled e garante que está habilitado
    produtoElement.classList.remove('produto-disabled');
    
    // Adiciona classe de correspondente para estilização especial
    produtoElement.classList.add('produto-correspondente');
    
    // Animação de saída da seção original
    produtoElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    produtoElement.style.transform = 'translateY(-20px)';
    produtoElement.style.opacity = '0.7';
    
    setTimeout(() => {
        // Move o elemento
        produtosCorrespondentes.appendChild(produtoElement);
        
        // Auto-seleciona a quantidade
        definirQuantidadeProduto(produtoId, quantidade);
        
        // Animação de entrada na nova seção
        produtoElement.style.transform = 'translateY(20px)';
        setTimeout(() => {
            produtoElement.style.transform = 'translateY(0)';
            // NOVA: Remove opacity inline para que CSS tome controle
            produtoElement.style.opacity = '';
            
            // NOVA: Atualizar nomes dos filhos após produto estar na nova seção
            atualizarNomesFilhos(produtoId);
        }, 50);
        
        // Atualiza visibilidade das seções
        atualizarVisibilidadeSecoes();
        
    }, 300);
}

// Função para mover produto de volta para seção original
function moverProdutoParaOriginais(produtoId) {
    console.log(`Movendo produto ${produtoId} de volta para originais`);
    
    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    if (!produtoElement) return;
    
    const produtosOriginais = document.getElementById('produtos-originais');
    const produtosCorrespondentes = document.getElementById('produtos-correspondentes');
    
    if (!produtosOriginais || !produtosCorrespondentes) return;
    
    // NOVA: Força aplicação da classe disabled imediatamente
    produtoElement.classList.add('produto-disabled');
    
    // Zera quantidade
    definirQuantidadeProduto(produtoId, 0);
    
    // Oculta nomes dos filhos
    const nomesFilhosElement = document.getElementById(`nomes-filhos-${produtoId}`);
    if (nomesFilhosElement) {
        nomesFilhosElement.style.display = 'none';
    }
    
    // Animação de saída
    produtoElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    produtoElement.style.transform = 'translateY(-20px)';
    produtoElement.style.opacity = '0.7';
    
    setTimeout(() => {
        // NOVA: Remove classe de correspondente APENAS quando for mover (evita flash gigante)
        produtoElement.classList.remove('produto-correspondente');
        
        // NOVA: Restaura posição original em vez de usar appendChild
        restaurarPosicaoOriginal(produtoElement);
        
        // Animação de entrada
        produtoElement.style.transform = 'translateY(20px)';
        setTimeout(() => {
            produtoElement.style.transform = 'translateY(0)';
            // NOVA: Remove opacity inline para que CSS tome controle
            produtoElement.style.opacity = '';
            
            // NOVA: Força atualização do tratamento visual após animação
            setTimeout(() => {
                atualizarProdutosVisiveis();
            }, 100);
        }, 50);
        
        // Atualiza visibilidade
        atualizarVisibilidadeSecoes();
        
    }, 300);
}

// Função para definir quantidade de um produto
function definirQuantidadeProduto(produtoId, quantidade) {
    const input = document.getElementById(`quantidade-input-${produtoId}`);
    const botoes = document.querySelectorAll(`.btn-quantidade[data-produto="${produtoId}"]`);
    
    if (input) {
        input.value = quantidade;
        
        // Atualiza botões visuais
        botoes.forEach(botao => botao.classList.remove('active'));
        
        if (quantidade > 0 && quantidade <= 4) {
            const botaoAtivo = document.querySelector(`.btn-quantidade[data-produto="${produtoId}"][data-value="${quantidade}"]`);
            if (botaoAtivo) {
                botaoAtivo.classList.add('active');
                
                // Habilita todos os botões deste produto
                botoes.forEach(botao => botao.disabled = false);
                
                // Remove classe de produto desabilitado
                const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
                if (produtoElement) {
                    produtoElement.classList.remove('produto-disabled');
                    produtoElement.title = '';
                }
            }
        }
    }
    
    // Atualiza valores totais - CORRIGIDO: usar atualizarTotais para incluir recálculo de frete
    if (typeof atualizarTotais === 'function') {
        atualizarTotais(); // Inclui recálculo de frete
    } else {
        // Fallback para caso a função não exista
        atualizarValores();
    }
    atualizarCarrinho();
    
    // NOVA: Notificar FreteManager sobre mudança de quantidade (para auto-seleção/desseleção)
    if (window.freteManager) {
        console.log('FreteManager: Produto quantidade alterada via auto-seleção, recalculando...');
        setTimeout(() => {
            window.freteManager.onProductQuantityChange();
        }, 100);
    }
}

// Flag para controlar se auto-seleção está desabilitada (durante restauração)
let autoSelecaoDesabilitada = false;
window.autoSelecaoDesabilitada = autoSelecaoDesabilitada;

// Função principal para auto-selecionar produtos
function autoSelecionarProdutos() {
    // Sincronizar com variável global
    if (window.autoSelecaoDesabilitada) {
        console.log('Auto-seleção temporariamente desabilitada');
        return;
    }
    console.log('Executando auto-seleção de produtos...');
    
    const seriesQuantidade = coletarSeriesSelecionadas();
    const produtosJaCorrespondentes = new Set();
    
    // NOVA: Primeiro, limpar produtos órfãos para evitar inconsistências
    limparProdutosOrfaos();
    
    // Coletar produtos já na seção correspondente
    document.querySelectorAll('#produtos-correspondentes .produto').forEach(produto => {
        const produtoId = produto.getAttribute('data-produto-id');
        if (produtoId) produtosJaCorrespondentes.add(produtoId);
    });
    
    // Processar cada série selecionada
    Object.entries(seriesQuantidade).forEach(([serie, quantidade]) => {
        const produtoId = window.serieParaProduto && window.serieParaProduto[serie];
        
        if (produtoId) {
            console.log(`Auto-selecionando: ${serie} -> ${produtoId} (quantidade: ${quantidade})`);
            
            // Se produto não está na seção correspondente, mover
            if (!produtosJaCorrespondentes.has(produtoId)) {
                moverProdutoParaCorrespondentes(produtoId, quantidade);
            } else {
                // Se já está, garantir que está habilitado e atualizar quantidade
                const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
                if (produtoElement) {
                    // NOVA: Garante que está habilitado
                    produtoElement.classList.remove('produto-disabled');
                }
                definirQuantidadeProduto(produtoId, quantidade);
                
                // NOVA: Atualizar nomes para produtos já na seção correspondente
                // Aguarda um pouco mais para garantir que DOM está atualizado após mudança de série
                setTimeout(() => {
                    atualizarNomesFilhos(produtoId);
                }, 100);
            }
        }
    });
    
    // Verificar produtos que não são mais necessários (séries removidas)
    const seriesSelecionadasArray = Object.keys(seriesQuantidade);
    document.querySelectorAll('#produtos-correspondentes .produto').forEach(produto => {
        const produtoId = produto.getAttribute('data-produto-id');
        const produtoGrade = produto.getAttribute('data-produto-grade');
        
        // Se o produto não tem mais série correspondente, mover de volta
        if (produtoId && produtoGrade && !seriesSelecionadasArray.includes(produtoGrade)) {
            moverProdutoParaOriginais(produtoId);
        }
    });
    
    // NOVA: Rede de segurança - garantir que todos os produtos correspondentes tenham nomes atualizados
    setTimeout(() => {
        document.querySelectorAll('#produtos-correspondentes .produto').forEach(produto => {
            const produtoId = produto.getAttribute('data-produto-id');
            if (produtoId) {
                atualizarNomesFilhos(produtoId);
            }
        });
    }, 150);
}

// Função para atualizar nomes dos filhos em tempo real
function atualizarNomesFilhos(produtoId) {
    const nomesFilhosElement = document.getElementById(`nomes-filhos-${produtoId}`);
    if (!nomesFilhosElement) return;
    
    // Buscar a série/grade do produto
    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    if (!produtoElement) return;
    
    const gradeProduto = produtoElement.getAttribute('data-produto-grade');
    if (!gradeProduto) return;
    
    // Coletar nomes dos filhos desta série
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos')?.value || '0');
    const nomesFilhos = [];
    
    for (let i = 1; i <= qtdFilhos; i++) {
        const nomeInput = document.getElementById(`nome_filho_${i}`);
        const serieSelect = document.getElementById(`serie_filho_${i}`);
        
        if (nomeInput && serieSelect && serieSelect.value === gradeProduto) {
            const nome = nomeInput.value.trim();
            if (nome) {
                nomesFilhos.push(nome);
            }
        }
    }
    
    // Atualizar display dos nomes
    const nomesListaElement = nomesFilhosElement.querySelector('.nomes-lista');
    if (nomesListaElement) {
        // NOVA: Verifica se produto está na seção correspondentes
        const produtoNaSecaoCorrespondentes = produtoElement.closest('#produtos-correspondentes');
        
        if (produtoNaSecaoCorrespondentes && nomesFilhos.length > 0) {
            // Se está na seção correspondentes E tem nomes, mostra
            nomesListaElement.textContent = nomesFilhos.join(', ');
            nomesFilhosElement.style.display = 'block';
        } else {
            // Caso contrário, oculta
            nomesFilhosElement.style.display = 'none';
        }
    }
}

// Função para atualizar visibilidade das seções
function atualizarVisibilidadeSecoes() {
    const colecoesCporrepondentes = document.getElementById('colecoes-correspondentes');
    const produtosCorrespondentes = document.getElementById('produtos-correspondentes');
    
    if (colecoesCporrepondentes && produtosCorrespondentes) {
        const temProdutos = produtosCorrespondentes.children.length > 0;
        colecoesCporrepondentes.style.display = temProdutos ? 'block' : 'none';
    }
}

// Função para adicionar eventos aos campos de nome (tempo real)
function adicionarEventosNomes() {
    // Detectar quando campos de nome são criados e adicionar eventos
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
                    
                    // Procurar por inputs de nome de filhos
                    const nomeInputs = node.querySelectorAll ? 
                        node.querySelectorAll('input[id^="nome_filho_"]') : 
                        (node.matches && node.matches('input[id^="nome_filho_"]') ? [node] : []);
                    
                    nomeInputs.forEach(input => {
                        // Remover listeners antigos (se existirem)
                        input.removeEventListener('input', handleNomeChange);
                        input.removeEventListener('blur', handleNomeChange);
                        
                        // Adicionar novos listeners
                        input.addEventListener('input', handleNomeChange);
                        input.addEventListener('blur', handleNomeChange);
                    });
                }
            });
        });
    });
    
    // Observar o container dos campos de filhos
    const camposFilhos = document.getElementById('campos-filhos');
    if (camposFilhos) {
        observer.observe(camposFilhos, { 
            childList: true, 
            subtree: true 
        });
    }
}

// Handler para mudanças nos nomes dos filhos
function handleNomeChange(event) {
    console.log('Nome do filho alterado:', event.target.value);
    
    // Atualizar nomes de todos os produtos correspondentes
    document.querySelectorAll('#produtos-correspondentes .produto').forEach(produto => {
        const produtoId = produto.getAttribute('data-produto-id');
        if (produtoId) {
            atualizarNomesFilhos(produtoId);
        }
    });
}

// ========== FIM DAS NOVAS FUNÇÕES ==========

// Função para atualizar os valores exibidos
function atualizarValores() {
    // Usar os valores de produtos do window.produtosConfig que são preenchidos pelo PHP
    // Isso garante que todos os valores vêm do arquivo de configuração centralizado

    // Elementos do DOM
    const valorOriginalElement = document.getElementById('valorOriginal');
    const valorPixElement = document.getElementById('valorPix');
    const valorCartaoElement = document.getElementById('valorCartao');
    const totalInput = document.getElementById('valor_total');
    const totalCartaoInput = document.getElementById('valor_cartao_total');
    
    // Obter o número máximo de parcelas da configuração global
    // Este valor é injetado pelo PHP a partir do arquivo de configuração
    const parcelas = window.maxParcelas || 7; // Fallback para 7 se não estiver definido

    // Calcula total de produtos selecionados
    let totalProdutos = 0;
    let totalPix = 0;
    let totalCartao = 0;
    let totalOriginal = 0;
    
    document.querySelectorAll('input[name^="quantidade"]').forEach(input => {
        const quantidade = parseInt(input.value) || 0;
        if (quantidade > 0) {
            totalProdutos += quantidade;

            // Extrai o ID do produto
            const match = input.name.match(/quantidade\[(.*?)\]/);
            if (match && match[1] && window.produtosConfig && window.produtosConfig[match[1]]) {
                const produto = window.produtosConfig[match[1]];
                totalPix += quantidade * produto.valorPix;
                totalCartao += quantidade * produto.valorCartao;
                totalOriginal += quantidade * produto.valorOriginal;
            }
        }
    });

    // Calcula valores por produto se não pudermos obter do produtosConfig
    if (totalPix === 0 && totalProdutos > 0) {
        const valorPix = 379.10; // Valor padrão como fallback
        const valorCartao = 399.00;
        const valorOriginal = 659.00;
        
        totalPix = totalProdutos * valorPix;
        totalCartao = totalProdutos * valorCartao;
        totalOriginal = totalProdutos * valorOriginal;
    }

    const valorParcela = totalCartao / parcelas;

    // Calcula a porcentagem de desconto
    const desconto = totalOriginal > 0 ? ((totalOriginal - totalPix) / totalOriginal * 100).toFixed(1) : 0;

    // Formata os valores para exibição
    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Atualiza os elementos na tela
    valorOriginalElement.innerHTML = `${formatarMoeda(totalOriginal)} <span class="desconto">(-${desconto}%)</span>`;
    valorPixElement.textContent = `${formatarMoeda(totalPix)} no Pix`;
    valorCartaoElement.textContent = `ou até ${parcelas}x de ${formatarMoeda(valorParcela)} sem juros`;

    // Atualiza o valor total do input hidden
    const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked').value;
    totalInput.value = formaPagamento === 'pix' ? totalPix.toFixed(2) : totalCartao.toFixed(2);
    
    // Se existir o input de valor total para cartão, atualizamos também
    if (totalCartaoInput) {
        totalCartaoInput.value = totalCartao.toFixed(2);
    }
    
    // Se existir a função de atualizar o select de parcelas, chamamos
    if (typeof atualizarSelectParcelas === 'function') {
        atualizarSelectParcelas(totalCartao);
    }
}

// Função para coletar todos os dados do formulário
async function coletarDadosFormulario() {
    // Obtém a data atual para timestamps
    const now = new Date();
    
    // Funções auxiliares para obter valores com segurança
    const getElementValue = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        return element ? element.value : defaultValue;
    };
    
    const getElementChecked = (id, defaultValue = false) => {
        const element = document.getElementById(id);
        return element ? element.checked : defaultValue;
    };
    
    // Forma de pagamento
    const formaPagamentoElement = document.querySelector('input[name="forma_pagamento"]:checked');
    const forma_pagamento = formaPagamentoElement ? formaPagamentoElement.value : '';
    
    // Seleciona o valor correto com base na forma de pagamento
    const valor_total = forma_pagamento === 'pix' 
        ? getElementValue('valor_total')
        : getElementValue('valor_cartao_total');
    
    // Metadados gerais
    const metadata = {
        timestamp: now.toISOString(),
        timestamp_local: now.toString(),
        url: window.location.href,
        referrer: document.referrer || 'direto',
        userAgent: navigator.userAgent,
        dispositivo: {
            mobile: /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            tamanho_tela: `${window.innerWidth}x${window.innerHeight}`,
            orientacao: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
            pixel_ratio: window.devicePixelRatio || 1
        },
        browser: {
            language: navigator.language,
            cookies_enabled: navigator.cookieEnabled,
            plataforma: navigator.platform
        },
        page_load_time: window.performance ? window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart : null,
        timezone: {
            name: Intl.DateTimeFormat().resolvedOptions().timeZone,
            offset: now.getTimezoneOffset()
        }
    };
    
    // Dados principais do formulário
    const dados = {
        // Dados pessoais
        nome: getElementValue('nome'),
        sobrenome: getElementValue('sobrenome'),
        cpf: getElementValue('cpf').replace(/\D/g, ''),
        celular: window.phoneDDI ? window.phoneDDI.getFormattedNumber() : getElementValue('celular_hidden'),
        email: getElementValue('email'),
        qtd_filhos: getElementValue('qtd_filhos', '0'),

        // Dados do pedido
        valor_total: valor_total,
        forma_pagamento: forma_pagamento,
        produtos: {},

        // Endereço de entrega
        entrega_cep: getElementValue('entrega_cep'),
        entrega_endereco: getElementValue('entrega_endereco'),
        entrega_numero: getElementValue('entrega_numero'),
        entrega_complemento: getElementValue('entrega_complemento'),
        entrega_bairro: getElementValue('entrega_bairro'),
        entrega_cidade: getElementValue('entrega_cidade'),
        entrega_estado: getElementValue('entrega_estado'),

        // Endereço de faturamento
        mesmo_endereco: getElementChecked('mesmo_endereco'),
        faturamento_cep: getElementValue('faturamento_cep'),
        faturamento_endereco: getElementValue('faturamento_endereco'),
        faturamento_numero: getElementValue('faturamento_numero'),
        faturamento_complemento: getElementValue('faturamento_complemento'),
        faturamento_bairro: getElementValue('faturamento_bairro'),
        faturamento_cidade: getElementValue('faturamento_cidade'),
        faturamento_estado: getElementValue('faturamento_estado'),

        // Dados completos dos filhos (array)
        filhos: [],

        // Metadados completos
        metadata: metadata,
        
        // Registro de erros para diagnóstico
        erros: {}
    };

    // CORREÇÃO CRÍTICA: Capturar dados completos de frete
    try {
        console.log('🚨 === CRÍTICO: Antes de capturarDadosFreteCompletos ===');
        
        dados.freight_details = await capturarDadosFreteCompletos();
        
        console.log('🚨 === CRÍTICO: Retorno de capturarDadosFreteCompletos ===');
        console.log('freight_details RETORNADO:', dados.freight_details);
        console.log('Tipo:', typeof dados.freight_details);
        console.log('É null?', dados.freight_details === null);
        console.log('É undefined?', dados.freight_details === undefined);
        
        if (dados.freight_details) {
            dados.frete_valor = dados.freight_details.valor;
            dados.frete_opcao = dados.freight_details.selected_option;
            
            // CRITICAL: Adicionar campos individuais ao objeto principal para garantia
            dados.frete_company = dados.freight_details.company;
            dados.frete_service = dados.freight_details.service;
            dados.frete_delivery_time = dados.freight_details.delivery_time;
            dados.frete_delivery_range = dados.freight_details.delivery_range;
            dados.frete_melhor_envio_id = dados.freight_details.melhor_envio_id;
            
            console.log('✅ CAMPOS INDIVIDUAIS ADICIONADOS AO OBJETO DADOS:', {
                frete_valor: dados.frete_valor,
                frete_opcao: dados.frete_opcao,
                frete_company: dados.frete_company,
                frete_service: dados.frete_service,
                frete_melhor_envio_id: dados.frete_melhor_envio_id
            });
            
            // Compatibilidade com estrutura existente
            dados.frete = {
                valor: dados.freight_details.valor,
                opcao_selecionada: dados.freight_details.selected_option,
                transportadora: dados.freight_details.company,
                servico: dados.freight_details.service,
                prazo_entrega: dados.freight_details.delivery_time,
                prazo_descricao: dados.freight_details.delivery_range,
                melhor_envio_id: dados.freight_details.melhor_envio_id,
                data_selecao: dados.freight_details.selected_at
            };
        } else {
            console.log('❌ CRÍTICO: freight_details é null/undefined!');
        }
        
        console.log('🚨 DADOS DE FRETE FINAIS NO OBJETO DADOS:', {
            freight_details: dados.freight_details,
            frete_valor: dados.frete_valor,
            frete_opcao: dados.frete_opcao,
            frete_company: dados.frete_company
        });
    } catch (e) {
        console.error('Erro ao capturar dados de frete:', e);
        dados.erros.frete = e.message;
        // Fallback para valores básicos
        dados.freight_details = {
            selected_option: null,
            valor: 0,
            company: null,
            service: null,
            delivery_time: 0,
            delivery_range: null,
            melhor_envio_id: null,
            selected_at: null
        };
        dados.frete_valor = 0;
        dados.frete_opcao = null;
    }

    // Coletar dados dos filhos de forma completa e robusta
    try {
        const qtdFilhos = parseInt(dados.qtd_filhos) || 0;
        console.log(`Coletando dados de ${qtdFilhos} filhos`);
        
    for (let i = 1; i <= qtdFilhos; i++) {
            const nomeFilho = getElementValue(`nome_filho_${i}`);
            const serieFilho = getElementValue(`serie_filho_${i}`);
            
            // Mapear séries para produtos (se a função existir)
            let serieMapeada = null;
            if (typeof serieParaProduto === 'function') {
                serieMapeada = serieParaProduto(serieFilho);
            } else if (typeof window.serieParaProduto === 'object' && window.serieParaProduto[serieFilho]) {
                serieMapeada = window.serieParaProduto[serieFilho];
            }
            
            // Adicionar filho com todos os dados possíveis
        dados.filhos.push({
                indice: i,
                nome: nomeFilho,
                serie: serieFilho,
                serie_mapeada: serieMapeada,
                idade: getElementValue(`idade_filho_${i}`, ''),
                data_nascimento: getElementValue(`nascimento_filho_${i}`, '')
            });
            
            console.log(`Filho ${i}: Nome="${nomeFilho}", Série="${serieFilho}"`);
        }
    } catch (e) {
        console.error('Erro ao coletar dados dos filhos:', e);
        dados.erros.filhos = e.message;
    }

    // CORREÇÃO: Coletar todos os produtos como array para garantir que seja serializado corretamente
    dados.produtos_array = [];

    // Coletar todos os produtos disponíveis no formulário com máximo de detalhes
    try {
        console.log('Coletando produtos do formulário');
        
        // Primeiro coletamos informações de todas as séries
        const seriesSelecionadas = new Set();
        document.querySelectorAll('select[name^="serie_filho_"]').forEach(select => {
            if (select.value) {
                seriesSelecionadas.add(select.value);
                
                // Se existir mapeamento de série para produto, adiciona também
                if (typeof window.serieParaProduto === 'object' && window.serieParaProduto[select.value]) {
                    seriesSelecionadas.add(window.serieParaProduto[select.value]);
                }
            }
        });
        
        console.log('Séries selecionadas:', Array.from(seriesSelecionadas));
        
        // Depois coletamos todos os produtos (selecionados ou não)
        const produtos = document.querySelectorAll('.produto');
        console.log(`Total de ${produtos.length} produtos encontrados no DOM`);
        
        produtos.forEach((produto, index) => {
            try {
                const select = produto.querySelector('input[name^="quantidade"]');
                if (!select) return;
                
                const quantidade = parseInt(select.value) || 0;
                // Incluir todos os produtos, mesmo com quantidade zero para fins de rastreamento
                
                const nameAttr = select.getAttribute('name');
                const match = nameAttr.match(/quantidade\[(.*?)\]/);
                if (!match || !match[1]) return;
                
                const produtoId = match[1];
                const nome = produto.querySelector('.produto-nome')?.textContent.trim() || '';
                const valorPix = produto.querySelector('.valor-pix')?.textContent.trim() || '';
                const valorParcelado = produto.querySelector('.valor-parcelado')?.textContent.trim() || '';
                const descricao = produto.querySelector('.produto-descricao')?.textContent.trim() || '';
                
                // Capturar valores numéricos dos preços, se disponíveis
                let valorPixNumerico = 0;
                let valorCartaoNumerico = 0;
                try {
                    // Extrai números do formato "R$ XXX,XX no Pix"
                    const valorPixMatch = valorPix.match(/R\$\s*([\d.,]+)/);
                    if (valorPixMatch) {
                        valorPixNumerico = parseFloat(valorPixMatch[1].replace('.', '').replace(',', '.'));
                    }
                    
                    // Extrai valores do formato "ou até X vezes de R$ XXX,XX"
                    const valorParceladoMatch = valorParcelado.match(/R\$\s*([\d.,]+)/);
                    if (valorParceladoMatch) {
                        valorCartaoNumerico = parseFloat(valorParceladoMatch[1].replace('.', '').replace(',', '.'));
                    }
                } catch (e) {
                    console.warn('Erro ao extrair valores numéricos:', e);
                }
                
                // Criação do objeto de dados do produto
                const produtoData = {
                    id: produtoId,
                    indice: index,
                    nome: nome,
                    descricao: descricao, 
                    quantidade: quantidade,
                    selecionado: quantidade > 0,
                    habilitado: !produto.classList.contains('produto-disabled'),
                    corresponde_serie: Array.from(seriesSelecionadas).includes(produtoId),
                    valor_pix: valorPix,
                    valor_parcelado: valorParcelado,
                    valor_pix_numerico: valorPixNumerico,
                    valor_cartao_numerico: valorCartaoNumerico
                };
                
                // Adicionar dados da configuração, se disponível
                if (window.produtosConfig && window.produtosConfig[produtoId]) {
                    const produtoConfig = window.produtosConfig[produtoId];
                    produtoData.config = {
                        valorPix: produtoConfig.valorPix,
                        valorCartao: produtoConfig.valorCartao,
                        valorOriginal: produtoConfig.valorOriginal,
                        imagem: produtoConfig.imagem || '',
                        categoria: produtoConfig.categoria || ''
                    };
                }

                // CORREÇÃO: Adiciona em ambos os formatos para garantir compatibilidade
                dados.produtos[produtoId] = produtoData;
                
                // CORREÇÃO: Adiciona para o array de produtos
                dados.produtos_array.push(produtoData);
                
                console.log(`Produto ${produtoId}: ${nome}, Quantidade=${quantidade}, Habilitado=${!produto.classList.contains('produto-disabled')}`);
            } catch (e) {
                console.error(`Erro ao processar produto ${index}:`, e);
            }
        });
    } catch (e) {
        console.error('Erro ao coletar dados dos produtos:', e);
        dados.erros.produtos = e.message;
    }

    // Adicionar dados do cartão se for pagamento com cartão
    if (dados.forma_pagamento === 'cartao') {
        try {
            // Extrair os campos do cartão com segurança
            const numero = getElementValue('numero_cartao').replace(/\D/g, '');
            const nome = getElementValue('nome_cartao');
            const validadeCompleta = getElementValue('validade_cartao');
            const partes = validadeCompleta.split('/');
            const validade_mes = partes.length > 0 ? partes[0] : '';
            const validade_ano = partes.length > 1 ? partes[1] : '';
            const cvv = getElementValue('cvv_cartao');
            const parcelas = getElementValue('parcelas', '1');
            const cardBrand = getElementValue('card_brand') || detectCardBrand(numero);
            
            // Adicionar dados do cartão ao objeto principal
            // Dados sensíveis são mascarados para segurança
            dados.cartao = {
                numero_mascarado: numero ? numero.substring(0, 4) + '*'.repeat(numero.length - 8) + numero.substring(numero.length - 4) : '',
                nome: nome,
                validade: validadeCompleta,
                bandeira: cardBrand,
                parcelas: parcelas
            };
            
            // Adicionar campos necessários para o processamento
        dados.card_number = numero;
        dados.nome_cartao = nome;
        dados.validade_mes = validade_mes;
        dados.validade_ano = validade_ano;
        dados.cvv = cvv;
        dados.parcelas = parcelas;
            dados.card_brand = cardBrand;
        } catch (e) {
            console.error('Erro ao coletar dados do cartão:', e);
            dados.erros.cartao = e.message;
        }
    }

    // Adicionar contador e totalizador de produtos selecionados
    try {
        let totalProdutos = 0;
        let totalValorPix = 0;
        let totalValorCartao = 0;
        let produtosSelecionados = [];
        
        Object.entries(dados.produtos).forEach(([id, produto]) => {
            if (produto.quantidade > 0) {
                totalProdutos += produto.quantidade;
                
                // Tenta extrair valores para totalização
                if (produto.config) {
                    totalValorPix += produto.quantidade * (produto.config.valorPix || 0);
                    totalValorCartao += produto.quantidade * (produto.config.valorCartao || 0);
                } else if (produto.valor_pix_numerico) {
                    totalValorPix += produto.quantidade * produto.valor_pix_numerico;
                    totalValorCartao += produto.quantidade * (produto.valor_cartao_numerico || produto.valor_pix_numerico);
                }
                
                // Adiciona à lista de produtos selecionados para facilitar consulta
                produtosSelecionados.push({
                    id: id,
                    nome: produto.nome,
                    quantidade: produto.quantidade,
                    valor_unitario: produto.config?.valorPix || produto.valor_pix_numerico || 0,
                    valor_total: produto.quantidade * (produto.config?.valorPix || produto.valor_pix_numerico || 0)
                });
            }
        });
        
        // Adiciona contadores como propriedades de topo para facilitar consulta
        dados.total_produtos_quantidade = totalProdutos;
        dados.total_valor_pix = totalValorPix;
        dados.total_valor_cartao = totalValorCartao;
        dados.produtos_selecionados = produtosSelecionados;
    } catch (e) {
        console.error('Erro ao calcular totalizadores:', e);
        dados.erros.totalizadores = e.message;
    }

    // ⚡ LOG CRÍTICO FINAL: O que está sendo retornado pela função coletarDadosFormulario
    console.log('🚨 === OBJETO DADOS FINAL SENDO RETORNADO ===');
    console.log('freight_details presente?', dados.freight_details ? 'SIM' : 'NÃO');
    console.log('frete_valor:', dados.frete_valor);
    console.log('frete_opcao:', dados.frete_opcao);
    console.log('frete_company:', dados.frete_company);
    console.log('frete_service:', dados.frete_service);
    console.log('Objeto completo de frete:');
    console.log('freight_details:', dados.freight_details);
    
    // Verificar se os campos estão sendo removidos por algum motivo
    const temFreteDetalhes = dados.hasOwnProperty('freight_details');
    const temFreteValor = dados.hasOwnProperty('frete_valor');
    console.log('Propriedades existem no objeto dados:', {
        freight_details: temFreteDetalhes,
        frete_valor: temFreteValor,
        frete_opcao: dados.hasOwnProperty('frete_opcao'),
        frete_company: dados.hasOwnProperty('frete_company')
    });

    return dados;
}

// Função para registrar log de cliente na loja
async function registrarLogClienteLoja(tipo, dados) {
    try {
        console.log(`Tentando registrar log de cliente: ${tipo}`);
        
        // NOVO: Coletar dados do formulário diretamente
        const dadosCompletos = await coletarDadosFormulario();
        
        // Mesclar dados específicos passados como parâmetro com os dados do formulário
        dados = {
            ...dados,
            qtd_filhos: dadosCompletos.qtd_filhos || dados.qtd_filhos, 
            filhos: dadosCompletos.filhos || dados.filhos || []
        };
        
        // NOVO: Converter produtos para um array simples
        const produtosSimplificados = [];
        
        // Processar a partir do objeto produtos
        if (dadosCompletos.produtos && typeof dadosCompletos.produtos === 'object') {
            Object.entries(dadosCompletos.produtos).forEach(([id, produto]) => {
                if (produto && typeof produto === 'object' && produto.quantidade > 0) {
                    produtosSimplificados.push({
                        id: id,
                        nome: produto.nome || id,
                        quantidade: produto.quantidade,
                        valor: produto.valor_pix_numerico || 0
                    });
                }
            });
        }
        
        // NOVO: Garantir que temos dados de produtos
        dados.produtos = produtosSimplificados;
        
        // Adiciona informações extras de timestamp se não existirem
        if (!dados.metadata?.timestamp) {
            dados.metadata = {
                ...(dados.metadata || {}),
                timestamp: new Date().toISOString(),
                timestamp_local: new Date().toString()
            };
        }
        
        // Diagnóstico: registra os dados que serão enviados
        console.log('Dados a serem enviados para log:', {
            tipo,
            filhos: dados.filhos?.length || 0,
            qtd_filhos: dados.qtd_filhos,
            produtos: dados.produtos?.length || 0
        });
        
        // NOVO: Preparar payload com cuidado extra na serialização
        const payload = {
            type: tipo,
            data: {
                ...dados,
                // Garantir que as propriedades críticas sejam arrays próprios
                produtos: Array.isArray(dados.produtos) ? dados.produtos : [],
                filhos: Array.isArray(dados.filhos) ? dados.filhos : []
            },
            log_timestamp: new Date().toISOString()
        };
        
        // Verificar serialização
        try {
            const payloadString = JSON.stringify(payload);
            console.log(`Payload serializado com sucesso: ${payloadString.length} bytes`);
        } catch (e) {
            console.error('Erro ao serializar dados para JSON:', e);
            // Falha na serialização, reconstituir dados de forma mais segura
            payload.data = {
                forma_pagamento: dados.forma_pagamento,
                valor_total: dados.valor_total,
                nome: dados.nome,
                sobrenome: dados.sobrenome,
                cpf: dados.cpf,
                celular: dados.celular,
                email: dados.email,
                qtd_filhos: dados.qtd_filhos,
                produtos: produtosSimplificados,
                filhos: dados.filhos.map(filho => ({
                    nome: filho.nome || '',
                    serie: filho.serie || '',
                    indice: filho.indice || 0
                }))
            };
        }

        // CORREÇÃO CIRÚRGICA v2.1.5: URL corrigido para nova estrutura /stores/
        const response = await fetch('/stores/' + getCurrentStoreId() + '/customers/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(payload)
        });

        // Adicionar verificação de resposta
        if (!response.ok) {
            console.error(`Erro ao registrar cliente (${tipo}): Status ${response.status}`);
            return false;
        }
        
        const responseData = await response.json();
        console.log(`Log de cliente registrado: ${tipo} - Resposta:`, responseData);
        return true;
    } catch (e) {
        console.error('Erro ao registrar log de cliente na loja:', e);
        return false;
    }
}

// Função para processar pagamento
async function processarPagamento() {
    if (!validarFormulario()) {
        console.log('Validação do formulário falhou');
        return;
    }

    // Show loading state
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('botao-pagar').disabled = true;

    try {
        // CORREÇÃO URGENTE: Aguardar FreteManager terminar antes de coletar
        console.log('⏳ Aguardando FreteManager terminar...');
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        
        // VERIFICAÇÃO EM TEMPO REAL: Mostrar campos exatamente como estão
        console.log('🔍 === VERIFICAÇÃO FINAL ANTES DE ENVIAR ===');
        const freteOpcaoFinal = document.getElementById('frete_opcao')?.value;
        const freteCompanyFinal = document.getElementById('frete_company')?.value;
        const freteServiceFinal = document.getElementById('frete_service')?.value;
        const freteMelhorEnvioIdFinal = document.getElementById('frete_melhor_envio_id')?.value;
        
        console.log('🔍 CAMPOS HIDDEN NO MOMENTO DO ENVIO:', {
            frete_opcao: freteOpcaoFinal,
            frete_company: freteCompanyFinal,
            frete_service: freteServiceFinal,
            frete_melhor_envio_id: freteMelhorEnvioIdFinal,
            freteManager_selectedOption: window.freteManager?.selectedOption
        });
        
        // Se campos estão vazios mas FreteManager tem seleção, força uma última atualização
        if ((!freteOpcaoFinal || !freteCompanyFinal) && window.freteManager?.selectedOption) {
            console.log('🚨 DETECTADO: Campos vazios mas FreteManager tem seleção. Forçando última atualização...');
            window.freteManager.updateHiddenFields();
            await new Promise(resolve => setTimeout(resolve, 200)); // Aguarda mais 200ms
            
            // Verifica novamente
            const freteOpcaoPos = document.getElementById('frete_opcao')?.value;
            const freteCompanyPos = document.getElementById('frete_company')?.value;
            console.log('🔍 APÓS FORÇA FINAL:', {
                frete_opcao: freteOpcaoPos,
                frete_company: freteCompanyPos
            });
        }
        
        // Coletar todos os dados do formulário
        const dadosComuns = await coletarDadosFormulario();
        console.log('DADOS COLETADOS DO FORMULÁRIO (após delay):', dadosComuns);
        
        // LOG SUPER ESPECÍFICO DOS DADOS DE FRETE QUE SERÃO ENVIADOS
        console.log('🚢 === DADOS DE FRETE QUE SERÃO ENVIADOS AO BACKEND ===');
        console.log('freight_details:', dadosComuns.freight_details);
        console.log('frete_valor:', dadosComuns.frete_valor);
        console.log('frete_opcao:', dadosComuns.frete_opcao);
        if (dadosComuns.freight_details) {
            console.log('DETALHAMENTO:', {
                selected_option: dadosComuns.freight_details.selected_option,
                company: dadosComuns.freight_details.company,
                service: dadosComuns.freight_details.service,
                melhor_envio_id: dadosComuns.freight_details.melhor_envio_id,
                valor: dadosComuns.freight_details.valor
            });
        }

        console.log('FORMA DE PAGAMENTO:', dadosComuns.forma_pagamento);
        if (dadosComuns.forma_pagamento === 'pix') {
            console.log('Entrou no bloco PIX');
            
            // NOVA: Salvar dados completos antes de abrir modal PIX
            if (typeof saveFormData === 'function') {
                console.log('DEBUG: script.js - Salvando dados antes de abrir modal PIX...');
                saveFormData();
            }
            
            // Usar o novo sistema de pagamento PIX
            try {
                await processarPagamentoPix(dadosComuns);
            } catch (error) {
                // Dados de erro simplificados
                const errorDetails = {
                    mensagem: error.message || 'Erro no processamento PIX',
                    timestamp: new Date().toISOString()
                };

                // NOVA IMPLEMENTAÇÃO DE LOG DE ERRO
                try {
                    // Capturar dados diretamente do DOM
                    const dadosErro = {
                        // Dados pessoais
                        nome: document.getElementById('nome')?.value || '',
                        sobrenome: document.getElementById('sobrenome')?.value || '',
                        cpf: document.getElementById('cpf')?.value.replace(/\D/g, '') || '',
                        celular: window.phoneDDI ? window.phoneDDI.getFormattedNumber() : (document.getElementById('celular_hidden')?.value || ''),
                        email: document.getElementById('email')?.value || '',
                        qtd_filhos: document.getElementById('qtd_filhos')?.value || '0',
                        
                        // Dados de pagamento
                        forma_pagamento: 'pix',
                        valor_total: document.getElementById('valor_total')?.value || '0',
                        
                        // Dados do erro
                        erro: errorDetails,
                        
                        // Arrays para filhos e produtos
                        filhos: [],
                        produtos: []
                    };
                    
                    // Coletar dados dos filhos
                    const qtdFilhos = parseInt(dadosErro.qtd_filhos) || 0;
                    for (let i = 1; i <= qtdFilhos; i++) {
                        const nomeFilho = document.getElementById(`nome_filho_${i}`)?.value || '';
                        const serieFilho = document.getElementById(`serie_filho_${i}`)?.value || '';
                        
                        if (nomeFilho || serieFilho) {
                            dadosErro.filhos.push({
                                indice: i,
                                nome: nomeFilho,
                                serie: serieFilho
                            });
                        }
                    }
                    
                    // Coletar dados dos produtos
                    document.querySelectorAll('.produto').forEach((produto) => {
                        const select = produto.querySelector('input[name^="quantidade"]');
                        if (!select) return;
                        
                        const quantidade = parseInt(select.value) || 0;
                        if (quantidade <= 0) return;
                        
                        const nameAttr = select.getAttribute('name');
                        const match = nameAttr.match(/quantidade\[(.*?)\]/);
                        if (!match || !match[1]) return;
                        
                        const produtoId = match[1];
                        const nome = produto.querySelector('.produto-nome')?.textContent.trim() || '';
                        const valorPix = produto.querySelector('.valor-pix')?.textContent.trim() || '';
                        
                        dadosErro.produtos.push({
                            id: produtoId,
                            nome: nome,
                            quantidade: quantidade,
                            valor: valorPix
                        });
                    });
                    
                    // CORREÇÃO CIRÚRGICA v2.1.5: URL corrigido para nova estrutura /stores/
                    fetch('/stores/' + getCurrentStoreId() + '/customers/register.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        body: JSON.stringify({
                            type: 'error',
                            data: dadosErro
                        })
                    })
                    .then(response => response.json())
                    .then(data => console.log('Log de erro registrado:', data))
                    .catch(err => console.error('Erro ao registrar log de erro:', err));
                } catch (logError) {
                    console.error('Erro ao registrar log de erro de PIX:', logError);
                }
                
                handlePixError(error);
            }
        } else if (dadosComuns.forma_pagamento === 'cartao') {
            console.log('Entrou no bloco CARTAO');
            // Montar payload conforme exigido pela Getnet/backend
            const valorCentavos = Math.round(parseFloat(dadosComuns.valor_total.replace(',', '.')) * 100);
            console.log('Valor em centavos (cartão):', valorCentavos);
            const cardPayload = {
                amount: valorCentavos,
                currency: 'BRL',
                order_id: getCurrentStoreId().toUpperCase() + '-' + Math.floor(Date.now()/1000), // Formato STOREID-TIMESTAMP (ORDER_ID sempre maiúsculo)
                installments: parseInt(dadosComuns.parcelas) || 1,
                card: {
                    number: dadosComuns.card_number,
                    holder_name: dadosComuns.nome_cartao,
                    expiration_month: dadosComuns.validade_mes,
                    expiration_year: dadosComuns.validade_ano,
                    security_code: dadosComuns.cvv,
                    brand: (dadosComuns.card_brand || 'visa')
                },
                customer: {
                    name: dadosComuns.nome,
                    last_name: dadosComuns.sobrenome,
                    document_type: 'CPF',
                    document_number: dadosComuns.cpf,
                    email: dadosComuns.email,
                    phone_number: dadosComuns.celular,
                    address: {
                        street: dadosComuns.faturamento_endereco,
                        number: dadosComuns.faturamento_numero,
                        complement: dadosComuns.faturamento_complemento,
                        district: dadosComuns.faturamento_bairro,
                        city: dadosComuns.faturamento_cidade,
                        state: dadosComuns.faturamento_estado,
                        postal_code: dadosComuns.faturamento_cep,
                        country: 'Brasil'
                    }
                },
                device: dadosComuns.device || {},
                fraud_analysis: dadosComuns.fraud_analysis || {},
                type: 'credit_card'
            };
            console.log('Payload enviado para o backend (cartão):', cardPayload);
            
            // Usar caminho dinâmico da integração de pagamento
            const paymentPath = getPaymentIntegrationPath();
            const response = await fetch(`/${paymentPath}/public/process.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(cardPayload)
            });

            let resultado;
            const responseText = await response.text();
            console.log('Resposta bruta do servidor:', responseText);

            try {
                resultado = JSON.parse(responseText);
            } catch (e) {
                console.error('Erro ao fazer parse da resposta:', e);
                
                // Registrar erro de parse usando a nova abordagem
                const dadosErro = capturarDadosParaLog('error', { 
                    tipo_erro: 'parse_error',
                        mensagem: e.message,
                    resposta_bruta: responseText.substring(0, 500)
                });
                
                registrarLogSimples('error', dadosErro);
                throw new Error('Resposta inválida do servidor');
            }

            if (!response.ok) {
                // Registrar erro de resposta usando a nova abordagem
                const dadosErro = capturarDadosParaLog('error', {
                    tipo_erro: 'http_error',
                        status: response.status,
                        statusText: response.statusText,
                    mensagem: resultado.message || 'Erro no servidor'
                });
                
                registrarLogSimples('error', dadosErro);
                
                // Salvar dados do formulário antes de redirecionar
                localStorage.setItem('formData', JSON.stringify(dadosComuns));
                // Redirecionar para página de erro com mensagem
                window.location.href = `views/sucesso.php?status=error&error_message=${encodeURIComponent(resultado.message + (resultado.details ? ' - ' + JSON.stringify(resultado.details) : ''))}`;
                return;
            }

            if (resultado.success) {
                // Registrar log de pagamento aprovado usando a nova abordagem
                const dadosAprovados = capturarDadosParaLog('approved', {
                    payment_id: resultado.payment_id,
                    status: 'approved',
                    detalhes_pagamento: {
                        id: resultado.payment_id,
                        status: resultado.status,
                        valor: dadosComuns.valor_total,
                        timestamp: new Date().toISOString()
                    }
                });
                
                registrarLogSimples('approved', dadosAprovados);

                // Salvar dados do formulário antes de redirecionar
                localStorage.setItem('formData', JSON.stringify(dadosComuns));
                showSuccessMessage('Pagamento processado com sucesso!');
                if (resultado.redirect) {
                    window.location.href = resultado.redirect;
                } else if (resultado.data && resultado.data.redirect) {
                    window.location.href = resultado.data.redirect;
                }
            } else {
                // Registrar erro de pagamento usando a nova abordagem
                const dadosErro = capturarDadosParaLog('error', {
                    tipo_erro: 'payment_error',
                        mensagem: resultado.message || 'Erro ao processar pagamento',
                        codigo: resultado.code,
                    detalhes: resultado.details ? JSON.stringify(resultado.details) : ''
                });
                
                registrarLogSimples('error', dadosErro);
                
                // Salvar dados do formulário antes de redirecionar
                localStorage.setItem('formData', JSON.stringify(dadosComuns));
                // Redirecionar para página de erro com mensagem
                window.location.href = `views/sucesso.php?status=error&error_message=${encodeURIComponent(resultado.message + (resultado.details ? ' - ' + JSON.stringify(resultado.details) : ''))}`;
                return;
            }
        }
    } catch (error) {
        console.error('Erro durante o processamento:', error);
        
        // Registrar erro genérico usando a nova abordagem
        const dadosErro = capturarDadosParaLog('error', {
            tipo_erro: 'exception',
            mensagem: error.message || 'Erro desconhecido',
            stack: error.stack || ''
        });
        
        registrarLogSimples('error', dadosErro);
        showErrorMessage(error.message || 'Erro ao processar pagamento. Por favor, tente novamente.');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('botao-pagar').disabled = false;
    }
}

// Nova função auxiliar para capturar dados do formulário para logs
function capturarDadosParaLog(tipo, dadosAdicionais = {}) {
    // Coletar dados básicos do formulário
    const dados = {
        // Dados pessoais
        nome: document.getElementById('nome')?.value || '',
        sobrenome: document.getElementById('sobrenome')?.value || '',
        cpf: document.getElementById('cpf')?.value.replace(/\D/g, '') || '',
        celular: window.phoneDDI ? window.phoneDDI.getFullNumber() : (document.getElementById('celular')?.value || ''),
        email: document.getElementById('email')?.value || '',
        qtd_filhos: document.getElementById('qtd_filhos')?.value || '0',
        
        // Dados de pagamento
        forma_pagamento: document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'pix',
        valor_total: document.getElementById('valor_total')?.value || '0',
        valor_cartao: document.getElementById('valor_cartao_total')?.value || '0',
        
        // Dados de endereço
        entrega_cep: document.getElementById('entrega_cep')?.value.replace(/\D/g, '') || '',
        entrega_endereco: document.getElementById('entrega_endereco')?.value || '',
        entrega_numero: document.getElementById('entrega_numero')?.value || '',
        entrega_complemento: document.getElementById('entrega_complemento')?.value || '',
        entrega_bairro: document.getElementById('entrega_bairro')?.value || '',
        entrega_cidade: document.getElementById('entrega_cidade')?.value || '',
        entrega_estado: document.getElementById('entrega_estado')?.value || '',
        
        // Endereço de faturamento
        mesmo_endereco: document.getElementById('mesmo_endereco')?.checked || false,
        faturamento_cep: document.getElementById('faturamento_cep')?.value.replace(/\D/g, '') || '',
        faturamento_endereco: document.getElementById('faturamento_endereco')?.value || '',
        faturamento_numero: document.getElementById('faturamento_numero')?.value || '',
        faturamento_complemento: document.getElementById('faturamento_complemento')?.value || '',
        faturamento_bairro: document.getElementById('faturamento_bairro')?.value || '',
        faturamento_cidade: document.getElementById('faturamento_cidade')?.value || '',
        faturamento_estado: document.getElementById('faturamento_estado')?.value || '',
        
        // Filhos e produtos (arrays vazios inicialmente)
        filhos: [],
        produtos: [],
        
        // Tipo de registro
        tipo_registro: tipo,
        store_id: getCurrentStoreId(),
        
        // Metadados
        metadata: {
            timestamp: new Date().toISOString(),
            timestamp_local: new Date().toString(),
            dispositivo: navigator.userAgent,
            tipo_dispositivo: /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            url: window.location.href,
            referer: document.referrer
        },
        
        // Mesclar dados adicionais específicos
        ...dadosAdicionais
    };
    
    // Coletar dados dos filhos
    const qtdFilhos = parseInt(dados.qtd_filhos) || 0;
    for (let i = 1; i <= qtdFilhos; i++) {
        const nomeFilho = document.getElementById(`nome_filho_${i}`)?.value || '';
        const serieFilho = document.getElementById(`serie_filho_${i}`)?.value || '';
        
        // Sempre incluir o filho, mesmo se nome estiver vazio (será preenchido depois)
        dados.filhos.push({
            indice: i,
            nome: nomeFilho,
            serie: serieFilho
        });
    }
    
    // Coletar dados dos produtos
    document.querySelectorAll('.produto').forEach((produto) => {
        const select = produto.querySelector('input[name^="quantidade"]');
        if (!select) return;
        
        const quantidade = parseInt(select.value) || 0;
        // Incluir todos os produtos, mesmo com quantidade zero para fins de rastreamento
        
        const nameAttr = select.getAttribute('name');
        const match = nameAttr.match(/quantidade\[(.*?)\]/);
        if (!match || !match[1]) return;
        
        const produtoId = match[1];
        const nome = produto.querySelector('.produto-nome')?.textContent.trim() || '';
        const valorPix = produto.querySelector('.valor-pix')?.textContent.trim() || '';
        const valorOriginal = produto.querySelector('.valor-original')?.textContent.trim() || '';
        const valorCartao = produto.querySelector('.valor-cartao')?.textContent.trim() || '';
        const produtoHabilitado = !produto.classList.contains('produto-disabled');
        
        dados.produtos.push({
            id: produtoId,
            nome: nome,
            quantidade: quantidade,
            valor_pix: valorPix,
            valor_original: valorOriginal,
            valor_cartao: valorCartao,
            habilitado: produtoHabilitado
        });
    });
    
    return dados;
}

// Nova função simplificada para registrar logs
function registrarLogSimples(tipo, dados) {
    // Obter o ID da loja dinamicamente
    const storeId = getCurrentStoreId();
    
    // CORREÇÃO CIRÚRGICA v2.1.5: URL corrigido para nova estrutura /stores/
    fetch('/stores/' + storeId + '/customers/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
            type: tipo,
            data: dados
        })
    })
    .then(response => response.json())
    .then(result => console.log(`Log de ${tipo} registrado:`, result))
    .catch(err => console.error(`Erro ao registrar log de ${tipo}:`, err));
}

// Função para obter dados do formulário
function getFormData() {
    const form = document.getElementById('form-pagamento');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Validação do formulário completo
function validarFormulario() {
    let isValid = true;
    let firstInvalid = null;
    let firstInvalidLabel = '';
    const campos = [
        { id: 'nome', validacao: (v) => v.length >= 3, label: 'Nome' },
        { id: 'sobrenome', validacao: (v) => v.length >= 3, label: 'Sobrenome' },
        { id: 'email', validacao: validarEmail, label: 'Email' },
        { id: 'cpf', validacao: validarCPF, label: 'CPF' },
        { id: 'celular', validacao: validarCelular, label: 'Celular' },
        { id: 'entrega_cep', validacao: validarCEP, label: 'CEP de entrega' },
        { id: 'entrega_endereco', validacao: (v) => v.length >= 5, label: 'Endereço de entrega' },
        { id: 'entrega_numero', validacao: (v) => v.length > 0, label: 'Número de entrega' },
        { id: 'entrega_bairro', validacao: (v) => v.length >= 3, label: 'Bairro de entrega' },
        { id: 'entrega_cidade', validacao: (v) => v.length >= 3, label: 'Cidade de entrega' },
        { id: 'entrega_estado', validacao: (v) => v.length === 2, label: 'Estado de entrega' }
    ];

    // Validação dos campos básicos
    campos.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento) {
            // Para celular, usa o valor do PhoneDDISelector se disponível
            let valorParaValidar = elemento.value;
            if (campo.id === 'celular' && window.phoneDDI && window.phoneDDI.getFormattedNumber) {
                valorParaValidar = window.phoneDDI.getFormattedNumber();
            }
            
            const valid = campo.validacao(valorParaValidar);
            
            // Sistema unificado de feedback
            elemento.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
            if (valorParaValidar.trim() === '') {
                elemento.classList.add('campo-neutro');
            } else if (valid) {
                elemento.classList.add('campo-valido');
            } else {
                elemento.classList.add('campo-invalido');
                elemento.classList.add('invalid'); // Mantém compatibilidade
            }
            
            const erro = document.getElementById(`${campo.id}-error`);
            if (erro) erro.style.display = valid ? 'none' : 'block';
            if (!valid) {
                isValid = false;
                if (!firstInvalid) {
                    // 🚨 CORREÇÃO CRÍTICA: Para celular, usar container visual para scroll
                    if (campo.id === 'celular') {
                        const phoneContainer = document.getElementById('phone-container-celular');
                        firstInvalid = phoneContainer || elemento;
                    } else {
                        firstInvalid = elemento;
                    }
                    firstInvalidLabel = campo.label;
                }
            }
        }
    });

    // Validação do endereço de faturamento
    const mesmoEndereco = document.getElementById('mesmo_endereco').checked;
    if (!mesmoEndereco) {
        const camposFaturamento = [
            { id: 'faturamento_cep', validacao: validarCEP, label: 'CEP de faturamento' },
            { id: 'faturamento_endereco', validacao: (v) => v.length >= 5, label: 'Endereço de faturamento' },
            { id: 'faturamento_numero', validacao: (v) => v.length > 0, label: 'Número de faturamento' },
            { id: 'faturamento_bairro', validacao: (v) => v.length >= 3, label: 'Bairro de faturamento' },
            { id: 'faturamento_cidade', validacao: (v) => v.length >= 3, label: 'Cidade de faturamento' },
            { id: 'faturamento_estado', validacao: (v) => v.length === 2, label: 'Estado de faturamento' }
        ];

        camposFaturamento.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) {
                const valid = campo.validacao(elemento.value);
                
                // Sistema unificado de feedback - faturamento
                elemento.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                if (elemento.value.trim() === '') {
                    elemento.classList.add('campo-neutro');
                } else if (valid) {
                    elemento.classList.add('campo-valido');
                } else {
                    elemento.classList.add('campo-invalido');
                    elemento.classList.add('invalid'); // Mantém compatibilidade
                }
                
                const erro = document.getElementById(`${campo.id}-error`);
                if (erro) erro.style.display = valid ? 'none' : 'block';
                if (!valid) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = elemento;
                        firstInvalidLabel = campo.label;
                    }
                }
            }
        });
    } else {
        // Se for mesmo endereço, copiar valores antes de submeter
        const campos = ['cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
        campos.forEach(campo => {
            const faturamentoInput = document.getElementById(`faturamento_${campo}`);
            const entregaInput = document.getElementById(`entrega_${campo}`);
            if (faturamentoInput && entregaInput) {
                faturamentoInput.value = entregaInput.value;
            }
        });
    }

    // Validação dos campos do cartão se for pagamento por cartão
    const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked').value;
    if (formaPagamento === 'cartao') {
        const camposCartao = [
            { id: 'nome_cartao', validacao: (v) => v.length >= 3, label: 'Nome no cartão' },
            { id: 'numero_cartao', validacao: validarCartao, label: 'Número do cartão' },
            { id: 'validade_cartao', validacao: validarValidade, label: 'Validade do cartão' },
            { id: 'cvv_cartao', validacao: validarCVV, label: 'CVV do cartão' }
        ];

        camposCartao.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) {
                const valid = campo.validacao(elemento.value);
                
                // Sistema unificado de feedback - cartão
                elemento.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                if (elemento.value.trim() === '') {
                    elemento.classList.add('campo-neutro');
                } else if (valid) {
                    elemento.classList.add('campo-valido');
                } else {
                    elemento.classList.add('campo-invalido');
                    elemento.classList.add('invalid'); // Mantém compatibilidade
                }
                
                const erro = document.getElementById(`${campo.id}-error`);
                if (erro) erro.style.display = valid ? 'none' : 'block';
                if (!valid) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = elemento;
                        firstInvalidLabel = campo.label;
                    }
                }
            }
        });
    }

    // Validação dos campos dos filhos (nome e série)
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos')?.value || '0');
    if (qtdFilhos > 0) {
        for (let i = 1; i <= qtdFilhos; i++) {
            // Validação do nome do filho
            const nomeFilho = document.getElementById(`nome_filho_${i}`);
            if (nomeFilho) {
                const nomeValido = nomeFilho.value.trim().length >= 2;
                // Sistema unificado de feedback - nomes filhos
                nomeFilho.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                if (nomeFilho.value.trim() === '') {
                    nomeFilho.classList.add('campo-neutro');
                } else if (nomeValido) {
                    nomeFilho.classList.add('campo-valido');
                } else {
                    nomeFilho.classList.add('campo-invalido');
                    nomeFilho.classList.add('invalid'); // Mantém compatibilidade
                }
                const erroNome = document.getElementById(`nome_filho_${i}-error`);
                if (erroNome) erroNome.style.display = nomeValido ? 'none' : 'block';
                if (!nomeValido) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = nomeFilho;
                        firstInvalidLabel = `Nome do ${i}º filho`;
                    }
                }
            }

            // Validação da série do filho
            const serieFilho = document.getElementById(`serie_filho_${i}`);
            if (serieFilho) {
                const serieValida = serieFilho.value.trim().length > 0;
                // Sistema unificado de feedback - séries filhos
                serieFilho.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                if (serieFilho.value.trim() === '') {
                    serieFilho.classList.add('campo-neutro');
                } else if (serieValida) {
                    serieFilho.classList.add('campo-valido');
                } else {
                    serieFilho.classList.add('campo-invalido');
                    serieFilho.classList.add('invalid'); // Mantém compatibilidade
                }
                const erroSerie = document.getElementById(`serie_filho_${i}-error`);
                if (erroSerie) erroSerie.style.display = serieValida ? 'none' : 'block';
                if (!serieValida) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = serieFilho;
                        firstInvalidLabel = `Série do ${i}º filho`;
                    }
                }
            }
        }
    }

    // Validação obrigatória de ao menos 1 unidade de produto liberado
    let produtoValido = false;
    // Seleciona apenas produtos liberados (não .produto-disabled)
    const produtosLiberados = document.querySelectorAll('.produto:not(.produto-disabled) input[name^="quantidade"]');
    produtosLiberados.forEach(input => {
        if (parseInt(input.value, 10) > 0) produtoValido = true;
    });
    const produtosSection = document.querySelector('.produtos');
    if (!produtoValido) {
        isValid = false;
        if (produtosSection) {
            produtosSection.classList.add('invalid');
            if (!firstInvalid) firstInvalid = produtosSection;
        }
        showErrorMessage('Selecione ao menos 1 unidade de algum produto liberado para continuar.');
    } else if (produtosSection) {
        produtosSection.classList.remove('invalid');
    }

    // 🚨 VALIDAÇÃO OBRIGATÓRIA DE ANO LETIVO
    const customerProjectYear = document.getElementById('customer_project_year')?.value;
    if (!customerProjectYear || customerProjectYear === '') {
        isValid = false;
        
        // Exibe mensagem específica para Ano Letivo
        showErrorMessage('Por favor, selecione o Ano Letivo para continuar.');
        
        // Adiciona destaque visual na seção
        const projectYearSection = document.querySelector('.project-year-section');
        if (projectYearSection) {
            projectYearSection.style.border = '2px solid #dc3545';
            projectYearSection.style.borderRadius = '14px';
            
            // Rola para a seção do Ano Letivo
            projectYearSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove o visual de erro após 4 segundos
            setTimeout(() => {
                projectYearSection.style.border = '';
                projectYearSection.style.borderRadius = '';
            }, 4000);
        }
        
        // Define como primeiro erro se não há outro
        if (!firstInvalid) {
            const firstYearOption = document.getElementById('project-year-2025');
            if (firstYearOption) {
                firstInvalid = firstYearOption;
                firstInvalidLabel = 'Ano Letivo';
            }
        }
    }

    // 🚨 VALIDAÇÃO OBRIGATÓRIA DE FRETE
    const freteEnabled = document.querySelector('meta[name="freight-enabled"]')?.content === 'true';
    if (freteEnabled) {
        const freteOption = document.getElementById('frete_opcao')?.value;
        const freteError = document.getElementById('frete-error');
        const containerFrete = document.querySelector('.container-frete');
        
        // Verifica se há uma opção de frete selecionada
        if (!freteOption || freteOption === '') {
            isValid = false;
            
            // Mostra erro estilizado seguindo o padrão dos outros campos
            if (freteError) {
                freteError.textContent = 'Selecione uma opção de entrega';
                freteError.style.display = 'block';
                freteError.style.opacity = '1';
            }
            
            // Adiciona borda vermelha na seção de frete
            if (containerFrete) {
                containerFrete.classList.add('invalid');
                containerFrete.style.border = '2px solid #dc3545';
                containerFrete.style.borderRadius = '14px';
                
                // Remove o visual de erro após 4 segundos
                setTimeout(() => {
                    containerFrete.style.border = '';
                    containerFrete.classList.remove('invalid');
                }, 4000);
                
                // Define como primeiro inválido se ainda não houver um
                if (!firstInvalid) {
                    firstInvalid = containerFrete;
                    firstInvalidLabel = 'Opção de entrega';
                }
            }
            
            console.log('🚨 Validação falhou: Nenhuma opção de frete selecionada');
        } else {
            // Se há frete selecionado, remove erros
            if (freteError) {
                freteError.style.opacity = '0';
                freteError.style.display = 'none';
            }
            if (containerFrete) {
                containerFrete.classList.remove('invalid');
                containerFrete.style.border = '';
            }
            console.log('✅ Validação de frete OK:', freteOption);
        }
    }

    // Scroll suave até o primeiro campo inválido
    if (!isValid && firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstInvalid.focus) setTimeout(() => firstInvalid.focus(), 400);
        if (firstInvalidLabel) {
            showErrorMessage(`Preencha o campo obrigatório: <b>${firstInvalidLabel}</b>.`);
        }
    }

    return isValid;
}

// Função para copiar código PIX
function copiarCodigoPix() {
    const codigoPix = document.getElementById('pix-code');
    codigoPix.select();
    document.execCommand('copy');
    
    const botao = document.getElementById('copy-pix-code');
    botao.textContent = 'Copiado!';
    setTimeout(() => {
        botao.textContent = 'Copiar';
    }, 2000);
}

// Função para iniciar timer PIX
function iniciarTimerPix() {
    let minutos = 30;
    let segundos = 0;
    
    const timer = setInterval(() => {
        if (segundos === 0) {
            minutos--;
            segundos = 59;
        } else {
            segundos--;
        }
        
        document.getElementById('pix-timer').textContent = 
            `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            
        if (minutos === 0 && segundos === 0) {
            clearInterval(timer);
            document.getElementById('bloco-pix').style.display = 'none';
            alert('O QR Code PIX expirou. Por favor, gere um novo código.');
        }
    }, 1000);
}

// Busca de CEP
async function buscarCEP(cep, tipo) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            // Preencher campos e aplicar feedback unificado
            const camposPreenchidos = [
                { id: `${tipo}_endereco`, valor: data.logradouro },
                { id: `${tipo}_bairro`, valor: data.bairro },
                { id: `${tipo}_cidade`, valor: data.localidade }
            ];
            
            camposPreenchidos.forEach(({ id, valor }) => {
                const elemento = document.getElementById(id);
                if (elemento && valor) {
                    elemento.value = valor;
                    
                    // Aplicar feedback unificado para campos preenchidos
                    elemento.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                    elemento.classList.add('campo-valido');
                }
            });
            
            // Atualizar estado
            const estadoSelect = document.getElementById(`${tipo}_estado`);
            if (estadoSelect && data.uf) {
                estadoSelect.value = data.uf;
                
                // Aplicar feedback unificado no select de estado
                estadoSelect.classList.remove('invalid', 'campo-valido', 'campo-invalido', 'campo-neutro');
                estadoSelect.classList.add('campo-valido');
                
                // Atualizar dropdown customizado se existir
                if (window.updateCustomDropdown && estadoSelect.dataset.customized === 'true') {
                    window.updateCustomDropdown(estadoSelect);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

function validarEndereco() {
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;

    let isValid = true;

    // CEP validation
    if (!/^\d{5}-?\d{3}$/.test(cep)) {
        document.getElementById('cep-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('cep-error').style.display = 'none';
    }

    // Address validation
    if (endereco.trim().length < 3) {
        document.getElementById('endereco-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('endereco-error').style.display = 'none';
    }

    // Number validation
    if (numero.trim().length === 0) {
        document.getElementById('numero-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('numero-error').style.display = 'none';
    }

    // Neighborhood validation
    if (bairro.trim().length < 2) {
        document.getElementById('bairro-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('bairro-error').style.display = 'none';
    }

    // City validation
    if (cidade.trim().length < 2) {
        document.getElementById('cidade-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('cidade-error').style.display = 'none';
    }

    // State validation
    if (!estado) {
        document.getElementById('estado-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('estado-error').style.display = 'none';
    }

    return isValid;
}

// Função para restaurar dados do formulário
function restoreFormData() {
    console.log('DEBUG: script.js restoreFormData() called');
    
    const formDataRaw = localStorage.getItem('formData');
    const formData = JSON.parse(formDataRaw);
    if (!formData) {
        console.log('DEBUG: Nenhum formData encontrado no localStorage');
        return;
    }
    
    console.log('DEBUG: script.js - FormData encontrado:', !!formData.filhos ? `${formData.filhos.length} filhos` : 'sem dados de filhos');

    const form = document.getElementById('form-pagamento');
    if (form) {
        // Primeiro, resetamos todas as quantidades para 0
        document.querySelectorAll('input[name^="quantidade"]').forEach(input => {
            input.value = '0';
        });
        
        // Primeiro, remover a classe 'active' de todos os botões de quantidade
        document.querySelectorAll('.btn-quantidade').forEach(botao => {
            botao.classList.remove('active');
        });
        
        // Restaurar campos básicos (exceto produtos)
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'filhos' && key !== 'mesmo_endereco' && !key.startsWith('quantidade[')) {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                }
            }
        });

        // Restaurar checkbox de endereço de faturamento
        const mesmoEndereco = document.getElementById('mesmo_endereco');
        if (mesmoEndereco) {
            mesmoEndereco.checked = formData.mesmo_endereco;
            mesmoEndereco.dispatchEvent(new Event('change'));
        }

        // NOVA: Detectar e converter formatos de dados de filhos
        let filhosData = null;
        let qtdFilhosDetectada = 0;
        
        // Formato 1: Dados estruturados (formData.filhos como array)
        if (formData.filhos && Array.isArray(formData.filhos) && formData.filhos.length > 0) {
            filhosData = formData.filhos;
            qtdFilhosDetectada = formData.filhos.length;
            console.log('Restaurando dados dos filhos - formato estruturado:', filhosData);
        }
        // Formato 2: Dados do FormData simples (nome_filho_1, serie_filho_1, etc.)
        else {
            const filhosConvertidos = [];
            // Detectar quantos filhos existem nos dados salvos
            for (let i = 1; i <= 4; i++) { // máximo 4 filhos
                const nomeKey = `nome_filho_${i}`;
                const serieKey = `serie_filho_${i}`;
                if (formData[nomeKey] || formData[serieKey]) {
                    filhosConvertidos.push({
                        nome: formData[nomeKey] || '',
                        serie: formData[serieKey] || ''
                    });
                    qtdFilhosDetectada = i;
                }
            }
            
            if (filhosConvertidos.length > 0) {
                filhosData = filhosConvertidos;
                console.log('Restaurando dados dos filhos - formato FormData convertido:', filhosData);
            }
        }

        // Restaurar dados dos filhos se encontrados
        if (filhosData && qtdFilhosDetectada > 0) {
            const qtdFilhosSelect = document.getElementById('qtd_filhos');
            if (qtdFilhosSelect) {
                // Define a quantidade de filhos e força a abertura dos campos
                qtdFilhosSelect.value = qtdFilhosDetectada;
                qtdFilhosSelect.dispatchEvent(new Event('change'));
                
                // Aguarda criação dos campos dos filhos
                setTimeout(() => {
                    console.log('DEBUG: Tentando restaurar dados dos filhos:', filhosData);
                    
                    // Preenche os dados dos filhos
                    filhosData.forEach((filho, index) => {
                        const nomeInput = document.getElementById(`nome_filho_${index + 1}`);
                        const serieSelect = document.getElementById(`serie_filho_${index + 1}`);
                        
                        console.log(`DEBUG: Filho ${index + 1}:`, {
                            nome: filho.nome,
                            serie: filho.serie,
                            nomeInputExists: !!nomeInput,
                            serieSelectExists: !!serieSelect
                        });
                        
                        if (nomeInput && filho.nome) {
                            nomeInput.value = filho.nome;
                            console.log(`DEBUG: Nome preenchido para filho ${index + 1}: ${filho.nome}`);
                        }
                        
                        if (serieSelect && filho.serie) {
                            serieSelect.value = filho.serie;
                            console.log(`DEBUG: Série preenchida para filho ${index + 1}: ${filho.serie} (value after set: ${serieSelect.value})`);
                            // Não disparamos o evento de change imediatamente
                        }
                    });
                    
                    // NOVA: Aguardar mais um pouco antes de disparar eventos
                    setTimeout(() => {
                        console.log('DEBUG: Disparando eventos de mudança das séries...');
                        
                        // Agora disparamos os eventos de mudança para todas as séries de uma vez
                        filhosData.forEach((filho, index) => {
                            const serieSelect = document.getElementById(`serie_filho_${index + 1}`);
                            if (serieSelect && filho.serie) {
                                console.log(`DEBUG: Disparando change event para série ${filho.serie} do filho ${index + 1}`);
                                serieSelect.dispatchEvent(new Event('change'));
                            }
                        });
                    }, 200); // NOVA: Delay adicional para garantir que os valores foram definidos
                    
                    // Após os produtos estarem habilitados/desabilitados corretamente,
                    // restauramos as quantidades apenas para produtos habilitados
                    setTimeout(() => {
                        // Os produtos desabilitados já estão com valor "0" (do início da função)
                        // Só restauramos os produtos habilitados
                        document.querySelectorAll('input[name^="quantidade"]:not([disabled])').forEach(input => {
                            const keyName = input.name;
                            const value = formData[keyName];
                            
                            // Só restaura se o produto estiver habilitado e tiver um valor salvo
                            if (value && value !== '0') { // Verificamos se o valor é diferente de '0'
                                input.value = value;
                                
                                // Encontra o produto ID a partir do nome do input
                                const produtoMatch = keyName.match(/quantidade\[(.*?)\]/);
                                if (produtoMatch && produtoMatch[1]) {
                                    const produtoId = produtoMatch[1];
                                    
                                    // Encontra e ativa o botão correspondente
                                    const botao = document.querySelector(`.btn-quantidade[data-produto="${produtoId}"][data-value="${value}"]`);
                                    if (botao) {
                                        // Remove a classe ativa de outros botões deste produto
                                        document.querySelectorAll(`.btn-quantidade[data-produto="${produtoId}"]`).forEach(b => {
                                            b.classList.remove('active');
                                        });
                                        // Ativa o botão correto
                                        botao.classList.add('active');
                                    }
                                }
                            }
                        });

                        // Atualiza os valores totais
                        atualizarValores();
                        console.log('DEBUG: Restauração concluída, valores atualizados');
                    }, 800); // NOVA: Tempo aumentado para aguardar processamento das séries
                }, 300);
            }
        } else {
            // Se não houver filhos, limpa as quantidades dos produtos (já feito no início)
            atualizarValores();
        }
    }
}

// Função para tratar erros de pagamento Pix
function handlePixError(error) {
    console.error('Erro no pagamento Pix:', error);
    let mensagem = 'Erro ao processar pagamento via Pix. Por favor, tente novamente.';
    if (error && error.message) {
        mensagem += '\n' + error.message;
    }
    showErrorMessage(mensagem);
    // Aqui você pode adicionar lógica extra, como registrar log, exibir modal, etc.
}

// Função para processar pagamento Pix via endpoint correto
async function processarPagamentoPix(dadosComuns) {
    try {
        // Obter o caminho da integração de pagamento dinamicamente
        const paymentIntegrationPath = getPaymentIntegrationPath();
        const endpoint = `/${paymentIntegrationPath}/public/process.php`;
        
        console.log('Enviando PIX para endpoint:', endpoint);
        console.log('Dados enviados:', dadosComuns);
        
        // 🚨 LOG CRÍTICO: Verificar dados de frete antes do envio
        console.log('🚨 === VERIFICAÇÃO CRÍTICA ANTES DO ENVIO ===');
        console.log('dadosComuns.freight_details:', dadosComuns.freight_details);
        console.log('dadosComuns.frete_valor:', dadosComuns.frete_valor);
        console.log('dadosComuns.frete_opcao:', dadosComuns.frete_opcao);
        
        // Criar o payload que será enviado
        const payloadToSend = { ...dadosComuns, type: 'pix' };
        console.log('🚨 PAYLOAD FINAL QUE SERÁ ENVIADO:', {
            freight_details: payloadToSend.freight_details,
            frete_valor: payloadToSend.frete_valor,
            frete_opcao: payloadToSend.frete_opcao,
            type: payloadToSend.type
        });
        
        // ⚡ LOG CRÍTICO: Testar serialização JSON
        console.log('🚨 === TESTE DE SERIALIZAÇÃO JSON ===');
        try {
            const jsonString = JSON.stringify(payloadToSend);
            console.log('✅ JSON serializado com sucesso! Tamanho:', jsonString.length + ' bytes');
            
            // Parse de volta para verificar se os dados persistem
            const parsed = JSON.parse(jsonString);
            console.log('🔍 DADOS APÓS PARSE DE VOLTA:');
            console.log('freight_details no parsed:', parsed.freight_details);
            console.log('frete_valor no parsed:', parsed.frete_valor);
            console.log('frete_opcao no parsed:', parsed.frete_opcao);
            console.log('frete_company no parsed:', parsed.frete_company);
            
            // Verificar se existe diferença entre original e parsed
            const freteDataOriginal = {
                freight_details: payloadToSend.freight_details,
                frete_valor: payloadToSend.frete_valor,
                frete_opcao: payloadToSend.frete_opcao,
                frete_company: payloadToSend.frete_company
            };
            
            const freteDataParsed = {
                freight_details: parsed.freight_details,
                frete_valor: parsed.frete_valor,
                frete_opcao: parsed.frete_opcao,
                frete_company: parsed.frete_company
            };
            
            console.log('🔍 COMPARAÇÃO ORIGINAL vs PARSED:');
            console.log('Original:', freteDataOriginal);
            console.log('Parsed:', freteDataParsed);
            
            // Verificar se há propriedades undefined que podem ser removidas na serialização
            console.log('🔍 PROPRIEDADES UNDEFINED NO PAYLOAD:');
            Object.keys(payloadToSend).forEach(key => {
                if (payloadToSend[key] === undefined) {
                    console.log(`❌ ${key}: undefined (será removido na serialização)`);
                }
            });
            
        } catch (e) {
            console.error('❌ ERRO na serialização JSON:', e);
            console.log('Payload que causou erro:', payloadToSend);
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadToSend)
        });
        
        // ⚡ LOG CRÍTICO: Interceptar o que foi realmente enviado
        console.log('🚨 === PAYLOAD JSON REAL ENVIADO AO BACKEND ===');
        console.log('JSON.stringify(payloadToSend):', JSON.stringify(payloadToSend));
        
        // Verificar especificamente os campos de frete no payload serializado
        const payloadString = JSON.stringify(payloadToSend);
        console.log('🔍 Verificando campos de frete no JSON string:');
        console.log('Contém frete_opcao:', payloadString.includes('frete_opcao'));
        console.log('Contém frete_company:', payloadString.includes('frete_company'));
        console.log('Contém freight_details:', payloadString.includes('freight_details'));
        
        // Extrair apenas a parte relevante do JSON para análise
        try {
            const parsed = JSON.parse(payloadString);
            console.log('🔍 DADOS DE FRETE NO JSON REAL ENVIADO:');
            console.log('frete_opcao no JSON:', parsed.frete_opcao);
            console.log('frete_company no JSON:', parsed.frete_company);
            console.log('frete_service no JSON:', parsed.frete_service);
            console.log('freight_details no JSON:', parsed.freight_details);
        } catch (e) {
            console.error('❌ Erro ao fazer parse do JSON enviado:', e);
        }
        
        let resultado;
        const responseText = await response.text();
        console.log('Resposta bruta do servidor:', responseText);

        try {
            resultado = JSON.parse(responseText);
        } catch (e) {
            console.error('Erro ao fazer parse da resposta:', e);
            
            // Registrar erro de parse usando a nova abordagem
            const dadosErro = capturarDadosParaLog('error', { 
                tipo_erro: 'parse_error',
                    mensagem: e.message,
                resposta_bruta: responseText.substring(0, 500)
            });
            
            registrarLogSimples('error', dadosErro);
            throw new Error('Resposta inválida do servidor');
        }

        if (!response.ok) {
            throw new Error(resultado.message || 'Erro ao processar pagamento Pix');
        }
        showPixModal(
            resultado.data.qr_code,
            resultado.data.pix_code,
            resultado.data.expiration,
            resultado.data.status,
            resultado.data.description,
            dadosComuns.valor_total // valor total da transação
        );
    } catch (error) {
        handlePixError(error);
    }
}

// Função para obter o ID da loja atual com base no caminho da URL
function getCurrentStoreId() {
    const path = window.location.pathname;
    // Extrair o ID da loja do caminho - formato: /stores/[store_id]/...
    const match = path.match(/^\/stores\/([^\/]+)\//);
    
    if (match && match[1]) {
        // CORREÇÃO: Preservar case real da pasta para store_id
        return match[1];
    }
    
    // SEGURANÇA: Tentar detectar dinamicamente através de meta tags
    const metaStore = document.querySelector('meta[name="store-id"]');
    if (metaStore && metaStore.content) {
        // CORREÇÃO: Preservar case real para store_id
        return metaStore.content;
    }
    
    // SEGURANÇA: Tentar detectar pela configuração global do JavaScript
    if (window.STORE_CONFIG && window.STORE_CONFIG.store_id) {
        // CORREÇÃO: Preservar case real para store_id
        return window.STORE_CONFIG.store_id;
    }
    
    // FALLBACK: Se não conseguir detectar, usar 'unknown_store'
    console.warn('Não foi possível detectar store_id automaticamente. Usando fallback.');
    return 'unknown_store';
}

// Função para obter o caminho da integração de pagamento
function getPaymentIntegrationPath() {
    // Tenta obter do meta tag primeiro
    const metaTag = document.querySelector('meta[name="payment-integration-path"]');
    if (metaTag && metaTag.content) {
        return metaTag.content;
    }
    
    // Se não encontrar, usa o valor padrão
    return 'payment_getnet';
}

function updateGalleryControls(productId) {
    const galleryData = window.productGalleriesData[productId];
    if (!galleryData) return;

    const prevButton = document.querySelector(`.product-gallery .main-image-container .carousel-arrow.prev[onclick*="'${productId}'"]`);
    const nextButton = document.querySelector(`.product-gallery .main-image-container .carousel-arrow.next[onclick*="'${productId}'"]`);

    // Com rolagem infinita, os botões só são desabilitados se houver menos de 2 imagens
    const disableButtons = galleryData.images.length < 2;

    if (prevButton) {
        prevButton.disabled = disableButtons;
        prevButton.style.display = disableButtons ? 'none' : 'flex'; // Esconde se desabilitado
    }
    if (nextButton) {
        nextButton.disabled = disableButtons;
        nextButton.style.display = disableButtons ? 'none' : 'flex'; // Esconde se desabilitado
    }

    // Obtém a URL da imagem ativa atual (pode ser qualquer uma das duas)
    const mainImage = document.getElementById('mainProductImage_' + productId);
    const secondaryImage = document.getElementById('secondaryProductImage_' + productId);
    const activeImage = mainImage.classList.contains('active') ? mainImage : secondaryImage;
    
    if (activeImage) {
        const currentImageUrl = activeImage.src;
        const productGallery = activeImage.closest('.product-gallery');
        if (productGallery) {
            const thumbnails = productGallery.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumb => {
                // Compara apenas o final da URL para evitar problemas com caminhos absolutos vs relativos
                if (thumb.src === currentImageUrl || 
                    thumb.src.endsWith(currentImageUrl.split('/').pop())) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
        }
    }
}

function changeMainImage(productId, newImageUrlOrIndex, clickedThumbnailElement = null) {
    const mainImage = document.getElementById('mainProductImage_' + productId);
    const secondaryImage = document.getElementById('secondaryProductImage_' + productId);
    const galleryData = window.productGalleriesData[productId];

    if (mainImage && secondaryImage && galleryData) {
        let targetImageUrl;
        let targetIndex;

        if (typeof newImageUrlOrIndex === 'number') { // Navegação por índice (setas)
            targetIndex = newImageUrlOrIndex;
            if (targetIndex < 0 || targetIndex >= galleryData.images.length) {
                return; // Índice fora dos limites
            }
            targetImageUrl = galleryData.images[targetIndex];
            galleryData.currentIndex = targetIndex;
        } else { // Navegação por URL (clique na miniatura)
            targetImageUrl = newImageUrlOrIndex;
            targetIndex = galleryData.images.indexOf(targetImageUrl);
            if (targetIndex === -1) return; // Imagem não encontrada na galeria
            galleryData.currentIndex = targetIndex;
        }

        // Implementação do crossfade
        const activeImage = mainImage.classList.contains('active') ? mainImage : secondaryImage;
        const inactiveImage = mainImage.classList.contains('active') ? secondaryImage : mainImage;

        // Função para executar após o carregamento da imagem
        const executeTransition = () => {
            // Troca as classes para fazer o crossfade
            activeImage.classList.remove('active');
            inactiveImage.classList.add('active');
            
            // Atualiza controles e centraliza miniaturas
            updateGalleryControls(productId);
            centerActiveThumbnail(productId);
        };

        // Prepara a imagem inativa com a nova URL
        // Verifica se a URL da imagem é a mesma que já está carregada
        if (inactiveImage.src.includes(targetImageUrl.split('/').pop())) {
            // Se for a mesma imagem, executa a transição imediatamente
            executeTransition();
        } else {
            // Prepara a imagem inativa com a nova URL
            inactiveImage.src = targetImageUrl;
            
            // Adiciona listener para o evento de carregamento completo da imagem
            const loadHandler = () => {
                executeTransition();
                inactiveImage.removeEventListener('load', loadHandler);
            };
            
            // Aguarda o carregamento da imagem ou executa após timeout como fallback
            inactiveImage.addEventListener('load', loadHandler);
            
            // Fallback caso a imagem demore muito para carregar (100ms)
            setTimeout(() => {
                if (!inactiveImage.classList.contains('active')) {
                    executeTransition();
                }
            }, 100);
        }

        // Atualiza as classes active nas miniaturas
        updateThumbnailActiveState(productId, targetIndex, clickedThumbnailElement);
    }
}

function updateThumbnailActiveState(productId, targetIndex, clickedThumbnailElement) {
    // Se o clique foi numa miniatura, o updateGalleryControls já trata a classe active
    if (!clickedThumbnailElement) {
        // Se foi navegação por seta, precisamos garantir que a miniatura correta seja ativada
        const productGallery = document.getElementById('mainProductImage_' + productId).closest('.product-gallery');
        if (productGallery) {
            const thumbnails = productGallery.querySelectorAll('.thumbnail');
            thumbnails.forEach((thumb, idx) => {
                if (idx === targetIndex) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
        }
    }
}

function navigateGallery(productId, direction) {
    const galleryData = window.productGalleriesData[productId];
    if (galleryData && galleryData.images.length > 0) { // Garante que há imagens
        let newIndex = galleryData.currentIndex + direction;
        const numImages = galleryData.images.length;

        if (newIndex < 0) {
            newIndex = numImages - 1; // Vai para a última imagem
        } else if (newIndex >= numImages) {
            newIndex = 0; // Vai para a primeira imagem
        }
        
        // Verifica se uma transição já está em andamento
        const mainImage = document.getElementById('mainProductImage_' + productId);
        const secondaryImage = document.getElementById('secondaryProductImage_' + productId);
        
        // Se ambas as imagens têm a mesma classe (ambas ativas ou inativas), 
        // significa que uma transição pode estar em andamento
        if ((mainImage.classList.contains('active') === secondaryImage.classList.contains('active'))) {
            return; // Evita sobreposição de transições
        }
        
        changeMainImage(productId, newIndex);
    }
}

function centerActiveThumbnail(productId) {
    const galleryData = window.productGalleriesData[productId];
    if (!galleryData || galleryData.images.length <= 1) return;

    const container = document.querySelector(`#mainProductImage_${productId}`).closest('.product-gallery').querySelector('.thumbnail-container');
    const track = container.querySelector('.thumbnail-track');
    const activeThumbnail = container.querySelector('.thumbnail.active');

    if (!container || !track || !activeThumbnail) {
        console.warn("CenterActiveThumbnail: Elementos não encontrados para", productId);
        return;
    }

    const containerWidth = container.clientWidth;
    const trackWidth = track.scrollWidth; // Largura total real do track com todas as miniaturas
    const activeThumbLeft = activeThumbnail.offsetLeft;
    const activeThumbWidth = activeThumbnail.offsetWidth;

    // Calcula o deslocamento ideal para centralizar a miniatura ativa
    let targetTranslateX = (containerWidth / 2) - (activeThumbLeft + activeThumbWidth / 2);

    // Se a largura total do track for menor ou igual à do container,
    // simplesmente centralizamos o próprio track dentro do container (ou alinhamos à esquerda se preferir)
    if (trackWidth <= containerWidth) {
        // Para centralizar o track quando ele é menor:
        // targetTranslateX = (containerWidth - trackWidth) / 2;
        // Para alinhar à esquerda quando ele é menor (como solicitado para as extremidades):
        targetTranslateX = 0;
    } else {
        // Limita o targetTranslateX para não criar espaços vazios nas extremidades
        // Não permitir que o início do track (translateX) seja > 0 (espaço à esquerda)
        if (targetTranslateX > 0) {
            targetTranslateX = 0;
        }
        // Não permitir que o final do track vá além do final do container
        // O final do track é trackWidth + targetTranslateX (lembre-se que targetTranslateX será negativo)
        // Se trackWidth + targetTranslateX < containerWidth, significa que há espaço à direita.
        // Então, targetTranslateX deve ser, no mínimo, containerWidth - trackWidth.
        if ((trackWidth + targetTranslateX) < containerWidth) {
            targetTranslateX = containerWidth - trackWidth;
        }
    }

    track.style.transform = `translateX(${targetTranslateX}px)`;
}

// ==== SISTEMA DE ACOMPANHAMENTO DE PEDIDOS ====

function redirecionarParaMeusPedidos() {
    // Redireciona para a página de acompanhamento de pedidos
    window.location.href = 'meus-pedidos';
}

// Adiciona event listener para o botão "Meus Pedidos"
document.addEventListener('DOMContentLoaded', function() {
    const btnMeusPedidos = document.getElementById('btnMeusPedidos');
    if (btnMeusPedidos) {
        btnMeusPedidos.addEventListener('click', redirecionarParaMeusPedidos);
    }
});

// ========== MODAL PEDIDO AUTOMÁTICO ==========
let modalPedidoAutomaticoJaMostrado = false;

function mostrarModalPedidoAutomatico() {
    // Só mostra o modal se ainda não foi mostrado nesta sessão
    if (modalPedidoAutomaticoJaMostrado) {
        return;
    }
    
    const modal = document.getElementById('modal-pedido-automatico');
    if (modal) {
        modal.classList.add('show');
        modalPedidoAutomaticoJaMostrado = true;
        
        // Previne scroll da página quando modal está aberto
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalPedidoAutomatico() {
    const modal = document.getElementById('modal-pedido-automatico');
    if (modal) {
        modal.classList.remove('show');
        
        // Restaura scroll da página
        document.body.style.overflow = 'auto';
    }
}

// Event listener para o botão "Ok. Entendi!"
document.addEventListener('DOMContentLoaded', function() {
    const btnModalEntendi = document.getElementById('btn-modal-entendi');
    if (btnModalEntendi) {
        btnModalEntendi.addEventListener('click', fecharModalPedidoAutomatico);
    }
    
    // Event listener para fechar modal clicando no overlay
    const modalOverlay = document.getElementById('modal-pedido-automatico');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            // Só fecha se clicou no overlay, não no conteúdo do modal
            if (e.target === modalOverlay) {
                fecharModalPedidoAutomatico();
            }
        });
    }
    
    // Event listener para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            fecharModalPedidoAutomatico();
        }
    });
});

// Função de debug para testar o modal (usar no console)
function forcarModalPedidoAutomatico() {
    modalPedidoAutomaticoJaMostrado = false;
    mostrarModalPedidoAutomatico();
    console.log('Modal de Pedido Automático forçado a aparecer');
}

// Função para resetar o controle do modal (usar no console)
function resetModalControl() {
    modalPedidoAutomaticoJaMostrado = false;
    console.log('Controle do modal resetado - modal aparecerá novamente na próxima seleção');
}

// ========== TOOLTIP DE INFORMAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    const tooltipBtns = document.querySelectorAll('.info-tooltip-btn');
    
    tooltipBtns.forEach(btn => {
        let tooltipTimeout;
        let isTooltipVisible = false;
        
        // Função para mostrar tooltip
        function showTooltip() {
            btn.classList.add('tooltip-active');
            isTooltipVisible = true;
        }
        
        // Função para esconder tooltip
        function hideTooltip() {
            btn.classList.remove('tooltip-active');
            isTooltipVisible = false;
        }
        
        // Clique para dispositivos móveis
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isTooltipVisible) {
                hideTooltip();
            } else {
                // Esconder outros tooltips ativos
                document.querySelectorAll('.info-tooltip-btn.tooltip-active').forEach(activeBtn => {
                    if (activeBtn !== btn) activeBtn.classList.remove('tooltip-active');
                });
                
                showTooltip();
                
                // Auto-esconder após 4 segundos
                clearTimeout(tooltipTimeout);
                tooltipTimeout = setTimeout(hideTooltip, 4000);
            }
        });
        
        // Hover para desktop
        btn.addEventListener('mouseenter', function() {
            clearTimeout(tooltipTimeout);
            showTooltip();
        });
        
        btn.addEventListener('mouseleave', function() {
            tooltipTimeout = setTimeout(hideTooltip, 200);
        });
    });
    
    // Fechar tooltip ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.info-tooltip-btn')) {
            document.querySelectorAll('.info-tooltip-btn.tooltip-active').forEach(btn => {
                btn.classList.remove('tooltip-active');
            });
        }
    });
});

// Adiciona aqui outras funções ou lógicas do script.js se necessário...