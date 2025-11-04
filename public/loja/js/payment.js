// Funções de UI para pagamento
function initPaymentUI() {
    // Inicialização dos elementos de pagamento
    const formaPagamentoInputs = document.querySelectorAll('input[name="forma_pagamento"]');
    formaPagamentoInputs.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Configura estado inicial do método de pagamento
    const formaPagamentoSelecionada = document.querySelector('input[name="forma_pagamento"]:checked');
    if (formaPagamentoSelecionada) {
        formaPagamentoSelecionada.dispatchEvent(new Event('change'));
    }
}

function handlePaymentMethodChange() {
    const blocoCartao = document.getElementById('bloco-cartao');
    const camposCartao = blocoCartao.querySelectorAll('input, select');
    
    if (this.value === 'cartao') {
        blocoCartao.style.display = 'block';
        camposCartao.forEach(campo => campo.required = true);
    } else {
        blocoCartao.style.display = 'none';
        camposCartao.forEach(campo => campo.required = false);
    }
}

// Adiciona QRCode.js via CDN se não existir
if (!document.getElementById('qrcodejs-cdn')) {
    const script = document.createElement('script');
    script.id = 'qrcodejs-cdn';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.onload = function() {
        if (window._pendingPixCode) {
            window._pendingPixCode();
            window._pendingPixCode = null;
        }
    };
    document.head.appendChild(script);
}

// Função para obter o caminho da integração de pagamento
function getPaymentIntegrationPath() {
    const metaTag = document.querySelector('meta[name="payment-integration-path"]');
    return metaTag ? metaTag.content : 'payment_getnet'; // Fallback para 'payment_getnet' se não encontrar
}

// Implementação do sistema de polling - Adicionar estes novos métodos no início do arquivo, antes das outras funções
function startPaymentStatusPolling(order_id, payment_id = null) {
    // Armazena IDs para referência futura
    window.currentPaymentData = {
        order_id: order_id,
        payment_id: payment_id,
        polling: true
    };

    // Inicia o polling
    checkPaymentStatus();
    
    // Retorna uma função para parar o polling se necessário
    return stopPolling;
}

function stopPolling() {
    if (window.currentPaymentData) {
        window.currentPaymentData.polling = false;
    }
}

function checkPaymentStatus() {
    if (!window.currentPaymentData || !window.currentPaymentData.polling) return;
    
    const paymentPath = getPaymentIntegrationPath(); // <-- USA A NOVA FUNÇÃO

    // Constrói a URL de verificação de status
    const params = new URLSearchParams();
    if (window.currentPaymentData.order_id) {
        params.append('order_id', window.currentPaymentData.order_id);
    }
    if (window.currentPaymentData.payment_id) {
        params.append('payment_id', window.currentPaymentData.payment_id);
    }
    
    // Adiciona store_id para que status.php possa carregar a configuração correta da loja
    const storeId = getCurrentStoreId();
    if (storeId) {
        params.append('store', storeId);
    }
    
    // Evita cache com timestamp
    params.append('_t', Math.floor(Date.now()/1000));
    
    // Faz a requisição para verificar o status
    fetch(`/${paymentPath}/public/status.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Status do pagamento:', data);
            
            // Verificações adicionais para garantir uma confirmação real de pagamento
            if (data.success) {
                // Atualiza window.currentPaymentData com as informações mais recentes do servidor
                if (data.order_id && data.order_id !== window.currentPaymentData.order_id) {
                    console.log('Atualizando order_id de', window.currentPaymentData.order_id, 'para', data.order_id);
                    window.currentPaymentData.order_id = data.order_id;
                }

                // Atualiza os elementos de UI baseado no status atual
                updatePixModalStatus(data.status, data.confirmed_by_callback);
                
                // Redireciona para a página de sucesso:
                // 1. Se o status for 'approved' E confirmedByCallback for true
                // 2. OU se tiver redirect explícito na resposta (que só acontece quando o backend confirma pagamento)
                if (((data.status === 'approved' || data.status === 'APPROVED') && data.confirmed_by_callback === true) || data.redirect) {
                    stopPolling();
                    if (data.redirect) {
                        console.log('Redirecionando para URL fornecida pelo servidor:', data.redirect);
                        window.location.href = data.redirect;
                    } else {
                        // Fallback se não houver URL de redirecionamento
                        const redirectParams = new URLSearchParams({
                            status: 'approved',
                            payment_id: data.payment_id || window.currentPaymentData.payment_id || '',
                            order_number: data.order_id || window.currentPaymentData.order_id || ''
                        });
                        const redirectUrl = `/stores/${getCurrentStoreId()}/views/sucesso.php?${redirectParams.toString()}`;
                        console.log('Redirecionando para URL construída localmente:', redirectUrl);
                        window.location.href = redirectUrl;
                    }
                    return;
                }
                // Se o pagamento foi negado, mostra mensagem de erro detalhada
                else if (data.status === 'denied') {
                    stopPolling();
                    // Cria um objeto de erro mais informativo para passar para handlePixError
                    const errorInfo = {
                        code: 'PAYMENT_DENIED',
                        message: 'Pagamento PIX não aprovado',
                        details: data.description || 'A operação foi negada pela instituição financeira ou houve um erro na transação PIX.'
                    };
                    handlePixError(errorInfo);
                    closePixModal();
                    return;
                }
            }
            
            // Se o polling deve continuar e não foi aprovado nem negado, agenda a próxima verificação
            if (window.currentPaymentData && window.currentPaymentData.polling) {
                setTimeout(checkPaymentStatus, 3000); // Verifica a cada 3 segundos
            }
        })
        .catch(error => {
            console.error('Erro ao verificar status do pagamento:', error);
            // Continua verificando mesmo com erro
            if (window.currentPaymentData && window.currentPaymentData.polling) {
                setTimeout(checkPaymentStatus, 3000);
            }
        });
}

// Função para atualizar o status visual do modal PIX com base nas informações atuais
function updatePixModalStatus(status, confirmedByCallback) {
    console.log(`Atualizando status modal PIX: ${status} (confirmado por callback: ${confirmedByCallback})`);
    
    // Obtém elementos do DOM
    const statusElement = document.getElementById('pix-status');
    const timerElement = document.getElementById('pix-timer');
    if (!statusElement) return; // Retorna se o modal não estiver aberto
    
    // Define classe CSS e texto baseado no status
    let statusClass = 'pix-status-waiting';
    let timerClass = 'pix-timer-waiting';
    let statusText = 'Aguardando pagamento';
    
    // Mapeia os diferentes formatos de status para estados consistentes
    if (status === 'approved' || status === 'APPROVED' || 
        status === 'success' || status === 'SUCCESS' ||
        status === 'aprovado' || status === 'APROVADO') {
        
        statusClass = 'pix-status-approved';
        timerClass = 'pix-timer-approved';
        statusText = 'Pagamento aprovado';
        
        // Se aprovado, temos que parar o timer e redirecionar
        stopPolling(); // Para o polling para evitar múltiplas chamadas
    } else if (status === 'error' || status === 'ERROR' || 
               status === 'erro' || status === 'ERRO' ||
               status === 'expired' || status === 'EXPIRED' ||
               status === 'expirado' || status === 'EXPIRADO' ||
               status === 'canceled' || status === 'CANCELED' ||
               status === 'cancelado' || status === 'CANCELADO' ||
               status === 'denied' || status === 'DENIED' ||
               status === 'negado' || status === 'NEGADO' ||
               status === 'failed' || status === 'FAILED' ||
               status === 'falha' || status === 'FALHA') {
        
        statusClass = 'pix-status-error';
        timerClass = 'pix-timer-error';
        
        // Define o texto com base no status exato
        if (status.toLowerCase().includes('expir')) {
            statusText = 'Pagamento Expirado';
            
            // Se expirou, registrar no log de erro
            try {
                // Recupera os dados do pagamento atual
                const dadosFormulario = coletarDadosFormulario();
                const orderId = (window.currentPaymentData && window.currentPaymentData.order_id) ? window.currentPaymentData.order_id : null;
                const paymentId = (window.currentPaymentData && window.currentPaymentData.payment_id) ? window.currentPaymentData.payment_id : null;
                
                // Registro no log de erro para expiração do PIX via callback/polling
                if (typeof registrarLogClienteLoja === 'function') {
                    console.log('Registrando PIX expirado (confirmado por callback) no log de erros');
                    registrarLogClienteLoja('error', {
                        ...dadosFormulario,
                        tipo_erro: 'pix_expirado_callback',
                        order_id: orderId,
                        payment_id: paymentId,
                        timestamp_expiracao: new Date().toISOString(),
                        message: 'Pagamento PIX expirado confirmado por callback/polling',
                        confirmedByCallback: confirmedByCallback
                    }).catch(err => console.error('Erro ao registrar expiração PIX (callback):', err));
                }
            } catch (e) {
                console.warn('Falha ao registrar log de expiração PIX via callback:', e);
            }
        } else if (status.toLowerCase().includes('cancel')) {
            statusText = 'Pagamento Cancelado';
        } else {
            statusText = 'Pagamento não aprovado';
        }
        
        // Para o polling para evitar múltiplas chamadas de status
        stopPolling();
    }
    
    if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.parentElement.className = 'pix-status ' + statusClass;
    }
    
    // Atualiza o elemento de timer se necessário
    if (timerElement && timerElement.parentElement) {
        timerElement.parentElement.className = 'pix-timer ' + timerClass;
    }
}

// Modificar a função showPixModal para implementar polling e redirecionamento com status
function showPixModal(qrCode, codigoPix, expiration, status, description, valorFormatado, orderId, paymentId) {
    // Remove modal anterior se existir
    const oldModal = document.querySelector('.modal-pix');
    if (oldModal) oldModal.remove();

    // Adiciona CSS moderno, responsivo e animado
    if (!document.getElementById('pix-modal-style')) {
        const style = document.createElement('style');
        style.id = 'pix-modal-style';
        style.textContent = `
        .modal-pix {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
            z-index: 99999; display: flex; align-items: center; justify-content: center;
            animation: pixFadeIn 0.5s cubic-bezier(.68,-0.55,.27,1.55);
            pointer-events: auto !important; /* Protege contra interferências */
        }
        @keyframes pixFadeIn { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: translateY(0);} }
        .modal-pix .modal-content {
            background: #121F4B;
            border-radius: 28px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.13);
            border: 2px solid #1a2b5f;
            padding: 32px 32px 24px 32px;
            max-width: 820px !important;
            width: 96vw !important;
            display: flex; flex-direction: column; align-items: center;
            position: relative; animation: modalPopIn 0.7s cubic-bezier(.68,-0.55,.27,1.55);
            max-height: 90vh; overflow-y: auto;
            scrollbar-width: none; /* Remove scrollbar no Firefox */
            scrollbar-color: transparent transparent; /* Torna scrollbar invisível no Firefox */
            min-width: 320px !important; /* Largura mínima para evitar redução excessiva */
            transform: none !important; /* Protege contra alterações de transform */
        }
        /* Remove scrollbar em navegadores Webkit (Chrome, Safari, Edge) */
        .modal-pix .modal-content::-webkit-scrollbar {
            display: none; /* Remove completamente a scrollbar */
        }
        .modal-pix .modal-content {
            -ms-overflow-style: none; /* Remove scrollbar no Internet Explorer */
        }
        @keyframes modalPopIn { 0% { opacity: 0; transform: scale(0.92);} 100% { opacity: 1; transform: scale(1);} }
        .pix-title-row {
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            margin-bottom: 0;
            width: 100%;
            justify-content: center;
            animation: fadeInUp 0.5s 0.1s both;
        }
        .pix-logo {
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
        }
        .pix-logo img { width: 32px; height: 32px; }
        .pix-title {
            color: white; font-size: 1.7rem;
            font-weight: 700; letter-spacing: -0.5px;
            text-align: center;
            width: 100%;
        }
        .pix-valor-topo {
            color: #4CAF50;
            font-size: 36px;
            font-weight: bold;
            font-family: 'Segoe UI', sans-serif;
            margin: 18px 0 10px 0;
            letter-spacing: -0.5px;
            text-align: center;
            animation: zoomIn 0.5s 0.2s both;
        }
        @keyframes zoomIn { 0% { opacity: 0; transform: scale(0.8);} 100% { opacity: 1; transform: scale(1);} }
        .pix-status-timer-row {
            display: flex; gap: 10px; width: 100%; justify-content: center; margin-bottom: 12px;
            animation: fadeInUp 0.5s 0.3s both;
        }
        .pix-status span, .pix-timer span {
            display: inline-block;
            font-weight: bold;
            text-transform: capitalize;
            padding: 7px 18px;
            border-radius: 18px;
            border: 1px solid transparent;
            font-size: 1.18rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: background 0.2s, color 0.2s, border 0.2s;
            color: #111;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .pix-status-waiting span, .pix-timer-waiting span {
            background: #ffd129;
            color: #111;
            border: 1px solid #ffd129;
        }
        .pix-status-approved span, .pix-timer-approved span {
            background: #4CAF50;
            color: #111;
            border: 1px solid #4CAF50;
        }
        .pix-status-error span, .pix-timer-error span {
            background: #dc3545;
            color: #111;
            border: 1px solid #dc3545;
        }
        .pix-timer span {
            animation: timerPulse 1s infinite;
        }
        @keyframes timerPulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0.08); }
            50% { transform: scale(1.12); box-shadow: 0 0 8px 2px rgba(0,0,0,0.10); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0.08); }
        }
        .pix-main-row {
            display: flex;
            flex-direction: row;
            gap: 40px;
            width: 100%;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
        }
        @media (max-width: 900px) {
            .pix-main-row { flex-direction: column; align-items: center; gap: 18px; }
        }
        .qr-code-container {
            margin: 0;
            padding: 4px;
            background: white;
            border-radius: 18px;
            box-shadow: 0 4px 24px 0 rgba(0,0,0,0.1);
            animation: fadeInUp 0.5s 0.4s both, pulseQR 2.5s infinite alternate;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid rgba(255, 255, 255, 0.2);
            width: 260px;
            height: 260px;
        }
        @keyframes pulseQR { 0% { box-shadow: 0 4px 24px 0 rgba(0,0,0,0.1); } 100% { box-shadow: 0 8px 32px 0 rgba(0,0,0,0.2); } }
        #pix-qrcode-canvas {
            width: 252px !important;
            height: 252px !important;
            max-width: 252px;
            max-height: 252px;
            display: block; margin: 0 auto;
            border-radius: 12px;
            background: transparent;
        }
        .pix-steps-timeline {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            position: relative;
            height: 100%;
            min-height: 220px;
            gap: 18px;
        }
        .pix-steps-timeline::before {
            content: '';
            position: absolute;
            left: 19px;
            top: 24px;
            bottom: 24px;
            width: 4px;
            background: linear-gradient(to bottom, #e0e0e0 0%, #1976d233 100%);
            z-index: 0;
        }
        .pix-step {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            position: relative;
            background: none;
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
            z-index: 1;
        }
        .pix-step:last-child { margin-bottom: 0; }
        .pix-step-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
            max-width: 38px;
            max-height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: white;
            color: #121F4B;
            font-size: 1.15rem;
            font-weight: 800;
            border: 2.5px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 2;
            transition: background 0.2s, color 0.2s, border 0.2s;
        }
        .pix-step-text {
            font-size: 1.08rem;
            color: white;
            font-weight: 500;
            line-height: 1.3;
            text-align: left;
            margin-top: 0;
            z-index: 2;
        }
        .pix-step.active .pix-step-text {
            color: #4CAF50;
            font-weight: 700;
        }
        @media (max-width: 900px) {
            .pix-steps-timeline { flex-direction: column; min-height: 0; flex-wrap: wrap; align-items: flex-start; }
            .pix-steps-timeline::before { left: 19px; top: 24px; bottom: 24px; }
            .pix-step { flex-direction: row; margin: 0 0 0 0; gap: 12px; align-items: center; }
            .pix-step:last-child { margin-right: 0; }
        }
        .pix-code-label {
            margin: 0 0 4px 0;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            letter-spacing: 0.2px;
            width: 100%;
            text-align: center;
        }
        .pix-code-container {
            display: flex; width: 100%;
            margin: 0 0 16px 0;
            gap: 0;
            animation: fadeInUp 0.5s 0.6s both;
        }
        .pix-code-container input {
            flex: 1;
            font-size: 1rem;
            padding: 12px 10px;
            border-radius: 8px 0 0 8px;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            background: rgba(255, 255, 255, 0.1) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            transition: box-shadow 0.2s;
        }
        .pix-code-container input:focus {
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3) !important;
            background: rgba(255, 255, 255, 0.1) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        .pix-code-container button {
            border-radius: 0 8px 8px 0;
            border: none;
            background: #4CAF50;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            padding: 0 18px;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }
        .pix-code-container button:hover {
            background: #43A047;
            transform: scale(1.04);
        }
        .pix-code-container button:active {
            background: #388E3C;
            transform: scale(0.98);
        }
        .pix-error {
            color: #dc3545;
            background: #fff5f5;
            border-radius: 8px;
            padding: 14px;
            margin: 16px 0;
            font-size: 1.08rem;
            text-align: center;
            font-weight: 700;
        }
        .pix-actions-row {
            display: flex;
            gap: 10px;
            width: 100%;
            justify-content: center;
            margin-top: 4px;
            animation: fadeInUp 0.5s 0.7s both;
        }
        @media (max-width: 700px) {
            .modal-pix .modal-content { padding: 24px 4vw; }
            .pix-steps-timeline { flex-direction: row; min-height: 0; flex-wrap: wrap; }
            .pix-steps-timeline::before { display: none; }
            .pix-step { flex-direction: row; margin: 0 12px 0 0; gap: 8px; align-items: center; }
            .pix-step:last-child { margin-right: 0; }
            .pix-actions-row { flex-direction: column; gap: 10px; }
        }
        .close-modal {
            width: 100%;
            max-width: 260px;
            margin: 0 auto;
            background: transparent;
            color: white;
            border: 1.5px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 700;
            padding: 10px 0;
            cursor: pointer;
            transition: all 0.2s, transform 0.1s;
            display: block;
        }
        .close-modal:hover {
            background: #dc3545;
            color: #fff;
            border: 1.5px solid #dc3545;
            transform: scale(1.04);
        }
        .close-modal:active {
            background: #b71c1c;
            color: #fff;
            border: 1.5px solid #b71c1c;
            transform: scale(0.98);
        }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(30px);} 100% { opacity: 1; transform: translateY(0);} }
        `;
        document.head.appendChild(style);
    }

    // Calcula o tempo de expiração baseado no timestamp fornecido pelo backend
    // expiration pode ser um timestamp de expiração ou o tempo restante em segundos
    let expiraEm;
    if (expiration) {
        console.log("Valor original de expiração:", expiration, "Tipo:", typeof expiration);
        
        // Se for timestamp (valor grande) - Getnet geralmente envia um timestamp Unix em segundos
        if (typeof expiration === 'number' && expiration > 100000) {
            // É um timestamp Unix - calcula o tempo restante em segundos
            expiraEm = Math.max(0, Math.floor(expiration - (Date.now() / 1000)));
            console.log("Expiration interpretado como timestamp Unix, tempo restante:", expiraEm, "segundos");
        } 
        // Se for data ISO 8601 como string (formato 2023-10-20T15:30:00Z)
        else if (typeof expiration === 'string' && expiration.includes('T')) {
            const expirationDate = new Date(expiration);
            expiraEm = Math.max(0, Math.floor((expirationDate.getTime() - Date.now()) / 1000));
            console.log("Expiration interpretado como data ISO, tempo restante:", expiraEm, "segundos");
        }
        // Se for um número de segundos diretamente (formato antigo)
        else {
            expiraEm = Math.max(0, Math.floor(Number(expiration)));
            console.log("Expiration interpretado como segundos diretos:", expiraEm);
        }
    } else {
        // Fallback para 190 segundos se não for fornecido
        expiraEm = 190;
        console.log("Usando tempo de expiração padrão:", expiraEm, "segundos");
    }
    
    // --- CORREÇÃO: valorFormatado fallback ---
    let valorPixExibir = valorFormatado;
    if (!valorPixExibir || valorPixExibir === 'undefined') {
        // Tenta buscar do input do formulário
        const inputValor = document.getElementById('valor_total');
        if (inputValor && inputValor.value) {
            valorPixExibir = Number(inputValor.value.replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
            valorPixExibir = '';
        }
    }
    
    const pixCodeFinal = codigoPix || qrCode || '';
    let qrCodeHtml = '';
    if (pixCodeFinal && pixCodeFinal.length > 20) {
        qrCodeHtml = `<canvas id='pix-qrcode-canvas' width='252' height='252'></canvas>`;
    } else {
        qrCodeHtml = `<div class='pix-error'>Não foi possível gerar o QR Code. Use o código abaixo para pagar no app do seu banco.</div>`;
    }
    // Logo do Pix do Banco Central (SVG inline, versão azul e fiel ao original)
    const pixLogo = '';
    // Instruções passo a passo com ícones
    const steps = [
        { number: '1', text: 'Abra o app do seu banco e acesse a área Pix' },
        { number: '2', text: 'Escaneie o QR Code ou copie o código Pix abaixo' },
        { number: '3', text: 'Confirme o pagamento no seu aplicativo' }
    ];
    // Montagem do modal com nova distribuição
    // Passos com linha do tempo vertical, passo 1 ativo
    const stepsTimelineHtml = steps.map((s, idx) => {
        const isActive = idx === 0;
        return `<div class='pix-step${isActive ? ' active' : ''}'>
            <span class='pix-step-icon'>${s.number}</span>
            <span class='pix-step-text'>${s.text}</span>
        </div>`;
    }).join('');
    const stepsBlock = `<div class='pix-steps-timeline'>${stepsTimelineHtml}</div>`;
    const modal = document.createElement('div');
    modal.className = 'modal-pix';
    // Atualiza status/timer conforme status recebido
    let statusClass = 'pix-status-waiting';
    let timerClass = 'pix-timer-waiting';
    let statusText = 'Aguardando pagamento';
    if (status === 'aprovado' || status === 'approved' || status === 'success') {
        statusClass = 'pix-status-approved';
        timerClass = 'pix-timer-approved';
        statusText = 'Pagamento aprovado';
    } else if (status === 'erro' || status === 'error' || status === 'expirado' || status === 'expired') {
        statusClass = 'pix-status-error';
        timerClass = 'pix-timer-error';
        statusText = 'Pagamento não realizado';
    }
    modal.innerHTML = `
        <div class="modal-content">
            <div class="pix-title-row">
                <div class="pix-logo" style="width: 100%; height: auto; margin: 0 auto 32px auto; display: flex; align-items: center; justify-content: center;">
                    <img src="${window.storeImages?.logo_primary || '../imagens/logo-loja.png'}" alt="Logo da Loja" style="max-width: 256px; width: 100%; height: auto; display: block;" />
                </div>
                <span class="pix-title">Pagamento por PIX</span>
            </div>
            <div class="pix-valor-topo">${valorPixExibir}</div>
            <div class="pix-status-timer-row">
                <div class="pix-status ${statusClass}"><span id="pix-status">${statusText}</span></div>
                <div class="pix-timer ${timerClass}"><span id="pix-timer"></span></div>
            </div>
            <div class="pix-main-row">
            <div class="qr-code-container">
                    ${qrCodeHtml}
            </div>
                ${stepsBlock}
            </div>
            <div class="pix-code-label">Ou copie o código Pix:</div>
            <div class="pix-code-container">
                <input type="text" id="pix-code" value="${pixCodeFinal}" readonly>
                <button id="copy-pix-code" onclick="copiarCodigoPix()">Copiar Código</button>
            </div>
            <div id="pix-code-fallback" style="display:none; color:#d32f2f; font-size:0.98rem; margin:8px 0 0 0; text-align:center;">Não foi possível carregar o QR Code. Use o código acima no app do seu banco.</div>
            <div class="pix-actions-row">
                <button class="close-modal" onclick="closePixModal()">Cancelar Pagamento</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    iniciarTimerPix(expiraEm, status);

    // --- INÍCIO DO POLLING DE STATUS PIX ---
    // Iniciar polling se tivermos um order_id ou payment_id
    if (orderId || paymentId) {
        startPaymentStatusPolling(orderId, paymentId);
        
        // Parar polling ao fechar modal
        modal.querySelector('.close-modal').addEventListener('click', stopPolling);
    }
    // --- FIM DO POLLING ---

    // Gera o QR Code localmente após o script carregar
    if (pixCodeFinal && pixCodeFinal.length > 20) {
        window._pendingPixCode = function() {
            if (window.QRious) {
                const qr = new QRious({
                    element: document.getElementById('pix-qrcode-canvas'),
                    value: pixCodeFinal,
                    size: 260,
                    background: 'white',
                    foreground: '#1a1a1a',
                    level: 'H'
                });
            }
        };
        if (window.QRious) {
            window._pendingPixCode();
            window._pendingPixCode = null;
        }
    }
    // Força o valor do input após renderização
    setTimeout(() => {
        const input = document.getElementById('pix-code');
        if (input) input.value = pixCodeFinal;
    }, 200);
}

function showCardForm() {
    const blocoCartao = document.getElementById('bloco-cartao');
    blocoCartao.style.display = 'block';
}

function copiarCodigoPix() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    showSuccessMessage('Código PIX copiado!');
}

function iniciarTimerPix(tempoRestante, status) {
    const timerElement = document.getElementById('pix-timer');
    
    // Garante que seja um número e que tenha um valor mínimo para evitar problemas
    let restante = Number(tempoRestante);
    if (isNaN(restante) || restante <= 0) {
        console.warn('Tempo restante inválido ou expirado, usando valor padrão:', tempoRestante);
        restante = 190; // 190 segundos (fallback)
    }
    
    console.log('Iniciando timer PIX com', restante, 'segundos (' + Math.floor(restante/60) + 'm' + (restante%60) + 's)');
    
    // Configura a classe CSS baseada no status atual
    let timerClass = 'pix-timer-waiting';
    if (status === 'aprovado' || status === 'approved' || status === 'success') {
        timerClass = 'pix-timer-approved';
    } else if (status === 'erro' || status === 'error' || status === 'expirado' || status === 'expired') {
        timerClass = 'pix-timer-error';
    }
    timerElement.parentElement.className = 'pix-timer ' + timerClass;
    
    // Registra o tempo de início para cálculos mais precisos
    const inicioTimer = Date.now();
    const duracaoTotal = restante;
    
    // Função para atualizar o timer que será chamada a cada intervalo
    const atualizarTimer = () => {
        // Calcula tempo decorrido considerando o tempo real
        const decorrido = Math.floor((Date.now() - inicioTimer) / 1000);
        
        // Calcula tempo restante (garante que não fica negativo)
        restante = Math.max(0, duracaoTotal - decorrido);
        
        // Atualiza a exibição do timer
        const minutos = Math.floor(restante / 60);
        const segundos = restante % 60;
        timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Verifica se o timer expirou
        if (restante <= 0) {
            clearInterval(timer);
            console.log('Timer PIX expirado');
            timerElement.textContent = 'Expirado';
            const statusElement = document.getElementById('pix-status');
            if (statusElement) {
                statusElement.textContent = 'Pagamento Expirado';
                statusElement.parentElement.className = 'pix-status pix-status-error';
            }
            if (timerElement.parentElement) {
                timerElement.parentElement.className = 'pix-timer pix-timer-error';
            }
            if (typeof stopPolling === 'function') {
                stopPolling();
            }
            
            // Coleta os dados completos do formulário para enviar ao backend
            let dadosFormularioCompleto = {};
            try {
                const dadosColetados = coletarDadosFormulario();
                dadosFormularioCompleto = prepararDadosPedido(dadosColetados);
                // Garante que o order_id e payment_id do contexto atual sejam usados, se disponíveis
                // e se não foram já definidos por prepararDadosPedido (que gera um novo order_id)
                if (window.currentPaymentData && window.currentPaymentData.order_id) {
                    dadosFormularioCompleto.order_id = window.currentPaymentData.order_id;
                }
                if (window.currentPaymentData && window.currentPaymentData.payment_id) {
                    dadosFormularioCompleto.payment_id = window.currentPaymentData.payment_id;
                }

            } catch (e) {
                console.error("Erro ao coletar/preparar dados do formulário para expiração:", e);
                // Preenche com o mínimo necessário se a coleta falhar
                dadosFormularioCompleto = {
                    order_id: (window.currentPaymentData && window.currentPaymentData.order_id) ? window.currentPaymentData.order_id : getCurrentStoreId().toUpperCase() + '-' + Math.floor(Date.now()/1000),
                            payment_id: (window.currentPaymentData && window.currentPaymentData.payment_id) ? window.currentPaymentData.payment_id : null,
                    store_id: getCurrentStoreId(),
                    produtos: [],
                        filhos: [],
                    customer: {}
                };
            }

            // Log dos dados que serão enviados para expire.php
            console.log("[Timer PIX Expirado] Enviando dados para expire.php:", dadosFormularioCompleto);
                    
            // Verifica se existem as funções de captura direta de dados e registro simples
            // ... (lógica de log de erro local, pode ser mantida ou simplificada se o backend tratar tudo)
            
            // Notifica o backend sobre a expiração do PIX, enviando os dados completos do pedido
            const paymentPath = getPaymentIntegrationPath(); // Obter caminho dinâmico
            const storeId = getCurrentStoreId(); // Obter store_id atual
            fetch(`/${paymentPath}/public/expire.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...dadosFormularioCompleto, // Envia todos os dados preparados
                    expired: true, // Sinaliza que é uma expiração
                    timestamp_frontend_expiration: new Date().toISOString(), // Timestamp da expiração no frontend
                    // store_id já está em dadosFormularioCompleto
                    // order_id e payment_id também, se disponíveis e atualizados
                    browser_info: { // Adiciona browser_info aqui, como antes
                        user_agent: navigator.userAgent,
                        language: navigator.language,
                        screen: {
                            width: window.screen.width,
                            height: window.screen.height
                        },
                        referrer: document.referrer
                    }
                })
            })
            .then(response => {
                if (response.ok) {
                    console.log("Notificação de expiração enviada com sucesso para expire.php");
                    return response.json();
                } else {
                    console.error("Erro ao enviar notificação de expiração para expire.php:", response.status);
                    throw new Error("Falha ao enviar notificação de expiração para expire.php");
                }
            })
            .then(data => {
                console.log("Resposta do expire.php:", data);
            })
            .catch(error => {
                console.error("Erro na requisição para expire.php:", error);
            });
        }
    };
    
    // Configuração inicial da exibição
    atualizarTimer();
    
    // Inicia o intervalo para atualizar o timer a cada segundo
    const timer = setInterval(atualizarTimer, 1000);
    
    // Retorna uma função para cancelar o timer se necessário
    return () => clearInterval(timer);
}

function closePixModal() {
    const modal = document.querySelector('.modal-pix');
    if (modal) {
        modal.remove();
    }
    // Remove o backdrop se existir
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    // Remove o estilo do modal
    const style = document.getElementById('pix-modal-style');
    if (style) {
        style.remove();
    }
    
    // NOVA: Marcar que PIX foi cancelado (não é refresh)
    localStorage.setItem('pix_cancelled', 'true');
    
    // Restaura os dados do formulário
    restoreFormData();
}

// Função para salvar os dados do formulário
function saveFormData() {
    const form = document.getElementById('form-pagamento');
    if (!form) return;
    
    // NOVA: Coletar dados básicos do FormData
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // NOVA: Coletar dados dos filhos diretamente do DOM (estão fora do form)
    const qtdFilhosSelect = document.getElementById('qtd_filhos');
    const qtdFilhos = parseInt(qtdFilhosSelect?.value || '0');
    if (qtdFilhos > 0) {
        const filhos = [];
        for (let i = 1; i <= qtdFilhos; i++) {
            const nomeInput = document.getElementById(`nome_filho_${i}`);
            const serieSelect = document.getElementById(`serie_filho_${i}`);
            const nome = nomeInput?.value?.trim() || '';
            const serie = serieSelect?.value || '';
            
            if (nome || serie) {
                filhos.push({
                    nome: nome,
                    serie: serie,
                    indice: i
                });
            }
        }
        if (filhos.length > 0) {
            data.filhos = filhos;
            data.qtd_filhos = qtdFilhos.toString(); // Garantir que qtd_filhos está salva
            console.log('SaveFormData: Dados dos filhos capturados do DOM:', filhos);
        }
    }
    
    // NOVA: Coletar dados de frete explicitamente
    const freteValor = document.getElementById('frete_valor')?.value || '0';
    const freteOpcao = document.getElementById('frete_opcao')?.value || '';
    const freteCompany = document.getElementById('frete_company')?.value || '';
    const freteService = document.getElementById('frete_service')?.value || '';
    const freteDeliveryTime = document.getElementById('frete_delivery_time')?.value || '0';
    const freteNomeCompleto = document.getElementById('frete_nome_completo')?.value || '';
    
    if (freteOpcao && freteValor !== '0') {
        data.frete_opcao = freteOpcao;
        data.frete_valor = freteValor;
        data.frete_company = freteCompany;
        data.frete_service = freteService;
        data.frete_delivery_time = freteDeliveryTime;
        data.frete_nome_completo = freteNomeCompleto;
        console.log('SaveFormData: Dados de frete capturados:', {
            opcao: freteOpcao,
            valor: freteValor,
            company: freteCompany,
            service: freteService
        });
    }
    
    // NOVA: Coletar dados de celular do PhoneDDISelector
    if (window.phoneDDI && window.phoneDDI.getFormattedNumber) {
        const celular = window.phoneDDI.getFormattedNumber();
        if (celular) {
            data.celular = celular;
            console.log('SaveFormData: Celular capturado do PhoneDDI:', celular);
        }
    }
    
    localStorage.setItem('formData', JSON.stringify(data));
    console.log('SaveFormData: Dados completos salvos:', {
        temFilhos: !!data.filhos,
        qtdFilhos: data.filhos?.length || 0,
        temFrete: !!data.frete_opcao,
        temCelular: !!data.celular
    });
}

// Função para restaurar os dados do formulário
function restoreFormData() {
    console.log('DEBUG: payment.js restoreFormData() called');
    
    const form = document.getElementById('form-pagamento');
    if (!form) {
        console.log('DEBUG: payment.js - form não encontrado');
        return;
    }
    
    const savedData = localStorage.getItem('formData');
    console.log('DEBUG: payment.js - savedData from localStorage:', savedData);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restaurar campos básicos
        for (let key in data) {
            const input = form.elements[key];
            if (input) {
                input.value = data[key];
            }
        }
        
        // NOVA: Preencher campos dos filhos se existirem dados estruturados
        if (data.filhos && Array.isArray(data.filhos) && data.filhos.length > 0) {
            console.log('DEBUG: payment.js - Dados dos filhos encontrados:', data.filhos);
            
            // Forçar abertura dos campos filhos
            const qtdFilhosSelect = document.getElementById('qtd_filhos');
            if (qtdFilhosSelect) {
                qtdFilhosSelect.value = data.filhos.length;
                qtdFilhosSelect.dispatchEvent(new Event('change'));
                
                // Aguardar criação dos campos e preencher
                setTimeout(() => {
                    if (typeof mostrarCamposFilhos === 'function') {
                        mostrarCamposFilhos();
                    }
                    
                    // NOVA: Preencher dados estruturados dos filhos
                    setTimeout(() => {
                        console.log('DEBUG: payment.js - Preenchendo campos dos filhos...');
                        
                        // NOVA: Desabilitar auto-seleção durante restauração
                        window.autoSelecaoDesabilitada = true;
                        console.log('DEBUG: payment.js - Auto-seleção desabilitada durante restauração');
                        
                        data.filhos.forEach((filho, index) => {
                            const nomeInput = document.getElementById(`nome_filho_${index + 1}`);
                            const serieSelect = document.getElementById(`serie_filho_${index + 1}`);
                            
                            console.log(`DEBUG: payment.js - Filho ${index + 1}:`, {
                                nome: filho.nome,
                                serie: filho.serie,
                                nomeInputExists: !!nomeInput,
                                serieSelectExists: !!serieSelect
                            });
                            
                            if (nomeInput && filho.nome) {
                                nomeInput.value = filho.nome;
                                console.log(`DEBUG: payment.js - Nome preenchido: ${filho.nome}`);
                            }
                            
                            if (serieSelect && filho.serie) {
                                serieSelect.value = filho.serie;
                                console.log(`DEBUG: payment.js - Série preenchida: ${filho.serie} (value after set: ${serieSelect.value})`);
                                
                                // NOVA: Atualizar dropdown customizado se existir
                                setTimeout(() => {
                                    if (window.updateCustomDropdown && serieSelect.dataset.customized === 'true') {
                                        console.log(`DEBUG: payment.js - Atualizando dropdown customizado para série: ${filho.serie}`);
                                        window.updateCustomDropdown(serieSelect);
                                    } else if (window.updateCustomDropdown) {
                                        console.log(`DEBUG: payment.js - Dropdown ainda não customizado, aguardando... (dataset.customized: ${serieSelect.dataset.customized})`);
                                        // Tentar novamente caso o dropdown ainda não esteja customizado
                                        setTimeout(() => {
                                            if (serieSelect.dataset.customized === 'true') {
                                                console.log(`DEBUG: payment.js - Atualizando dropdown customizado (2ª tentativa) para série: ${filho.serie}`);
                                                window.updateCustomDropdown(serieSelect);
                                            } else {
                                                console.log(`DEBUG: payment.js - Dropdown nunca foi customizado para: ${serieSelect.id}`);
                                            }
                                        }, 200);
                                    } else {
                                        console.log('DEBUG: payment.js - updateCustomDropdown não disponível');
                                    }
                                }, 50);
                                
                                // REMOVIDO: dispatchEvent individual (causa múltiplas chamadas conflitantes)
                            }
                        });
                        
                        // NOVA: Reabilitar auto-seleção e executar uma única vez
                        window.autoSelecaoDesabilitada = false;
                        console.log('DEBUG: payment.js - Auto-seleção reabilitada');
                        
                        // NOVA: Chamada única de auto-seleção após TODOS os filhos estarem preenchidos
                        console.log('DEBUG: payment.js - Todos os filhos preenchidos, executando auto-seleção...');
                        if (typeof autoSelecionarProdutos === 'function') {
                            autoSelecionarProdutos();
                        }
                        
                        // Atualizar produtos visíveis e valores
                        if (typeof atualizarProdutosVisiveis === 'function') {
                            atualizarProdutosVisiveis();
                        }
                        if (typeof atualizarValores === 'function') {
                            atualizarValores();
                        } else if (typeof atualizarTotais === 'function') {
                            atualizarTotais();
                        }
                        
                        // NOVA: Restaurar seleção de frete após produtos serem ativados
                        if (data.frete_opcao && data.frete_valor) {
                            console.log('DEBUG: payment.js - Restaurando frete:', data.frete_company, 'R$', data.frete_valor);
                            
                            const tentarRestaurarFrete = (tentativas = 0) => {
                                const maxTentativas = 15;
                                const intervalo = 500;
                                
                                if (tentativas >= maxTentativas) {
                                    console.log('DEBUG: payment.js - Não foi possível restaurar frete após', maxTentativas, 'tentativas');
                                    return;
                                }
                                
                                // Verificar se FreteManager e opções estão disponíveis
                                if (window.freteManager && typeof window.freteManager.selectFreightOption === 'function') {
                                    const opcaoElement = document.querySelector(`[data-option-id="${data.frete_opcao}"]`);
                                    if (opcaoElement) {
                                        console.log('DEBUG: payment.js - Frete restaurado com sucesso:', data.frete_company, 'R$', data.frete_valor);
                                        window.freteManager.selectFreightOption(data.frete_opcao, parseFloat(data.frete_valor));
                                        return; // Sucesso, parar tentativas
                                    }
                                }
                                
                                console.log(`DEBUG: payment.js - Tentativa ${tentativas + 1}/${maxTentativas} de restaurar frete...`);
                                setTimeout(() => tentarRestaurarFrete(tentativas + 1), intervalo);
                            };
                            
                            // Iniciar tentativas após delay para aguardar carregamento do frete
                            setTimeout(() => tentarRestaurarFrete(), 2000);
                        }
                    }, 400); // Aguarda mais tempo para campos serem criados
                }, 300);
            }
        } 
        // Forçar abertura dos campos filhos se necessário (fallback para dados não estruturados)
        else {
            const qtdFilhosSelect = document.getElementById('qtd_filhos');
            if (qtdFilhosSelect && qtdFilhosSelect.value && parseInt(qtdFilhosSelect.value) > 0) {
                // Disparar evento de mudança para mostrar os campos dos filhos
                qtdFilhosSelect.dispatchEvent(new Event('change'));
                
                // Após um tempo, garantir que a função mostrarCamposFilhos foi chamada
                setTimeout(() => {
                    if (typeof mostrarCamposFilhos === 'function') {
                        mostrarCamposFilhos();
                    }
                    // Atualizar produtos visíveis
                    if (typeof atualizarProdutosVisiveis === 'function') {
                        atualizarProdutosVisiveis();
                    }
                    // Atualizar valores
                    if (typeof atualizarValores === 'function') {
                        atualizarValores();
                    } else if (typeof atualizarTotais === 'function') {
                        atualizarTotais();
                    }
                }, 300);
            }
        }
        
        // NOVA: Restaurar celular no PhoneDDISelector se existir
        if (data.celular && window.phoneDDI) {
            console.log('DEBUG: payment.js - Restaurando celular:', data.celular);
            setTimeout(() => {
                try {
                    // Usar método correto setFullNumber para PhoneDDISelector
                    if (window.phoneDDI.setFullNumber) {
                        const sucesso = window.phoneDDI.setFullNumber(data.celular);
                        console.log('DEBUG: payment.js - Celular restaurado via setFullNumber:', sucesso ? 'sucesso' : 'falhou');
                    } else {
                        console.log('DEBUG: payment.js - Método setFullNumber não encontrado');
                    }
                } catch (e) {
                    console.log('DEBUG: payment.js - Erro ao restaurar celular:', e);
                }
            }, 500);
        }
    }
}

// Adiciona evento para salvar dados quando o formulário é alterado
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-pagamento');
    if (form) {
        form.addEventListener('change', saveFormData);
        form.addEventListener('input', saveFormData);
        
        // Adiciona um ID de pedido e um store_id no momento do carregamento da página
        // Isso garante que sempre tenhamos esses dados ao submeter o formulário
        const storeId = getCurrentStoreId();
        const orderId = storeId.toUpperCase() + '-' + Math.floor(Date.now()/1000); // ORDER_ID sempre maiúsculo
        
        // CORREÇÃO CRÍTICA: Usar chaves específicas por loja para evitar conflito entre lojas
        localStorage.setItem(`current_order_id_${storeId}`, orderId);
        console.log('ID de pedido gerado: ' + orderId);
        
        // Usa o store_id da função getCurrentStoreId
        localStorage.setItem(`current_store_id_${storeId}`, storeId);
        console.log('Store ID detectado: ' + storeId);
        
        // MIGRAÇÃO: Limpar chaves antigas sem store_id para evitar conflitos
        if (localStorage.getItem('current_order_id')) {
            console.log('⚠️ Removendo chave antiga current_order_id (sem store_id específico)');
            localStorage.removeItem('current_order_id');
        }
        if (localStorage.getItem('current_store_id')) {
            console.log('⚠️ Removendo chave antiga current_store_id (sem store_id específico)');
            localStorage.removeItem('current_store_id');
        }
        
        // Adiciona campos ocultos ao formulário
        const orderIdInput = document.createElement('input');
        orderIdInput.type = 'hidden';
        orderIdInput.name = 'order_id';
        orderIdInput.value = orderId;
        form.appendChild(orderIdInput);
        
        const storeIdInput = document.createElement('input');
        storeIdInput.type = 'hidden';
        storeIdInput.name = 'store_id';
        storeIdInput.value = storeId;
        form.appendChild(storeIdInput);
    }
});

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPaymentUI); 

function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 12) + '_' + Math.floor(Date.now()/1000);
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

function getFingerprint() {
    let fp = localStorage.getItem('device_fp');
    if (!fp) {
        fp = 'fp_' + Math.random().toString(36).substr(2, 12) + '_' + Math.floor(Date.now()/1000);
        localStorage.setItem('device_fp', fp);
    }
    return fp;
}

// Função para tratar erros de cartão de forma mais detalhada e com opção de copiar
function showCardErrorDetails(errorResult) {
    const oldPopup = document.getElementById('custom-error-popup');
    if (oldPopup) oldPopup.remove();

    console.log('showCardErrorDetails recebeu:', errorResult);

    let displayErrorCode = 'N/A';
    let displayMessage = 'Não foi possível processar seu pagamento.'; // Mensagem padrão inicial
    let displayDetails = 'Por favor, verifique os dados do cartão e tente novamente.'; // Detalhe padrão inicial
    let rawErrorDataForCopy = errorResult; // Para cópia, usa o objeto original ou o que foi passado

    if (typeof errorResult === 'string') {
        displayMessage = errorResult;
    } else if (typeof errorResult === 'object' && errorResult !== null) {
        // Tentativa de extrair da resposta do gateway Getnet (geralmente em errorResult.data)
        const gatewayResponse = errorResult.data; // $result do Payment.php

        if (typeof gatewayResponse === 'object' && gatewayResponse !== null) {
            // Cenário 1: Erro principal da Getnet (nível raiz da resposta do gateway)
            displayErrorCode = gatewayResponse.error_code || gatewayResponse.code || displayErrorCode;
            displayMessage = gatewayResponse.reason || gatewayResponse.message || displayMessage; // 'reason' da Getnet costuma ser bom
            displayDetails = gatewayResponse.description_detail || gatewayResponse.status_detail || displayDetails;
            
            // Cenário 2: Detalhes aninhados em payment_data.details (comum para erros de transação)
            if (gatewayResponse.payment_data && gatewayResponse.payment_data.details && Array.isArray(gatewayResponse.payment_data.details) && gatewayResponse.payment_data.details.length > 0) {
                const detail = gatewayResponse.payment_data.details[0];
                displayErrorCode = detail.error_code || displayErrorCode;
                displayMessage = detail.description || displayMessage; // 'description' aqui é a mensagem principal do erro do item
                displayDetails = detail.description_detail || displayDetails;
            } else if (gatewayResponse.details && Array.isArray(gatewayResponse.details) && gatewayResponse.details.length > 0) {
                 // Fallback para 'details' no nível raiz do gatewayResponse (menos comum para Getnet, mas possível)
                const detail = gatewayResponse.details[0];
                displayErrorCode = detail.error_code || displayErrorCode;
                displayMessage = detail.description || displayMessage;
                displayDetails = detail.description_detail || displayDetails;
        }

            // Se a mensagem principal ainda for genérica, mas houver uma mensagem no payment_data do gateway
            if ((displayMessage === 'Não foi possível processar seu pagamento.' || displayMessage === 'DENY') && gatewayResponse.payment_data && gatewayResponse.payment_data.message) {
                displayMessage = gatewayResponse.payment_data.message; // ex: "Erro ao efetuar transação de crédito"
            }
             // Se o código do erro ainda for N/A ou unknown, tenta pegar do antifraude se existir
            if ((displayErrorCode === 'N/A' || displayErrorCode === 'unknown') && gatewayResponse.payment_data && gatewayResponse.payment_data.details && gatewayResponse.payment_data.details[0] && gatewayResponse.payment_data.details[0].antifraud && gatewayResponse.payment_data.details[0].antifraud.code) {
                displayErrorCode = gatewayResponse.payment_data.details[0].antifraud.code; // ex: "DENY" do antifraude
                if (displayMessage === 'Não foi possível processar seu pagamento.' && gatewayResponse.payment_data.details[0].antifraud.description) {
                    displayMessage = gatewayResponse.payment_data.details[0].antifraud.description; // ex: "Transacao negada.afpd!"
                }
            }
            } else {
            // Fallback para estrutura de erro mais simples, não vinda do gateway Getnet aninhado em .data
            displayErrorCode = errorResult.error_code || errorResult.code || displayErrorCode;
            displayMessage = errorResult.message || errorResult.error_message || displayMessage;
            displayDetails = errorResult.details || errorResult.error_details || displayDetails;
        }
    }
    
    // Limpa a mensagem se for apenas "DENY" e temos um código de erro mais específico
    if (displayMessage === 'DENY' && displayErrorCode !== 'N/A' && displayErrorCode !== 'DENY') {
        displayMessage = 'Pagamento recusado.'; // Ou busca no friendlyMessages
    }

    // Mapeamento de códigos de erro da Getnet para mensagens mais amigáveis
    const friendlyMessages = {
        // Códigos oficiais da Getnet
        'PAYMENTS-077': 'Número do cartão inválido. Verifique os dados.',
        'PAYMENTS-113': 'Saldo insuficiente. Tente outro cartão.',
        'PAYMENTS-114': 'Cartão expirado. Verifique a validade.',
        'PAYMENTS-115': 'Transação não autorizada pelo banco emissor.',
        'PAYMENTS-116': 'Transação não permitida para este cartão.',
        'PAYMENTS-117': 'Cartão não habilitado para compras online.',
        'PAYMENTS-118': 'Cartão bloqueado. Entre em contato com seu banco.',
        'PAYMENTS-122': 'Cartão com problema. Entre em contato com seu banco.',
        'PAYMENTS-123': 'Valor da transação excede o limite do cartão.',
        'PAYMENTS-125': 'Cartão inválido ou não autorizado.',
        'PAYMENTS-130': 'Falha na comunicação com o banco emissor. Tente novamente.',
        'PAYMENTS-132': 'Código de segurança inválido. Verifique o CVV do cartão.',
        'PAYMENTS-155': 'Senha do cartão inválida. Verifique e tente novamente.',
        'PAYMENTS-157': 'Transação não permitida para este tipo de cartão.',
        'PAYMENTS-208': 'Cartão vencido ou com data de validade inválida.',
        'PAYMENTS-220': 'Problemas com o processamento do cartão. Tente outro cartão.',
        'PAYMENTS-300': 'Problema de comunicação com o banco. Tente novamente mais tarde.',
        
        // Códigos derivados que criamos no backend para cartão
        'CARD-BALANCE': 'Saldo insuficiente no cartão. Tente outro meio de pagamento.',
        'CARD-INVALID': 'Cartão inválido. Verifique os dados informados.',
        'CARD-EXPIRED': 'Cartão com validade expirada. Verifique a data de validade.',
        'CARD-BLOCKED': 'Cartão bloqueado. Entre em contato com seu banco.',
        'CARD-TRANSACTION': 'Transação não permitida para este cartão.',
        'AUTH-REJECTED': 'Transação não autorizada pelo banco emissor.',
        'AUTH-FAILED': 'Falha na autorização. Tente novamente ou use outro cartão.',
        'CVV-INVALID': 'Código de segurança (CVV) inválido. Verifique os dados.',
        'CARD-DENIED': 'Cartão recusado pelo banco emissor.',
        'TRANSACTION-DENIED': 'Transação negada. Verifique os dados ou contate o emissor do cartão.',
        'RISK-ANALYSIS': 'Transação bloqueada pela análise de risco. Tente outro cartão.',
        'FRAUD-ANALYSIS': 'Transação bloqueada por suspeita de fraude. Use outro método de pagamento.',
        
        // Códigos derivados para PIX
        'PIX-EXPIRED': 'O código PIX expirou. Gere um novo código para pagamento.',
        'PIX-TIMEOUT': 'Tempo limite excedido para pagamento PIX. Tente novamente.',
        'PIX-NOT-FOUND': 'Pagamento PIX não encontrado. Verifique os dados.',
        'PIX-DUPLICATE': 'Pagamento PIX duplicado detectado.',
        'PIX-PROCESSING': 'Erro no processamento do PIX. Tente novamente.',
        'PIX-INVALID': 'Dados do PIX inválidos. Verifique as informações.',
        'PIX-LIMIT': 'Limite de transação PIX excedido. Tente um valor menor.',
        'PIX-AMOUNT': 'Problema com o valor da transação PIX.',
        'PIX-KEY': 'Problema com a chave PIX. Verifique os dados.',
        'PIX-RECIPIENT': 'Problema com o destinatário do PIX.',
        'PIX-BANK': 'Problema de comunicação com o banco para PIX.',
        'PIX-FAILURE': 'Falha na transação PIX. Tente novamente.',
        'PIX-REJECTED': 'Pagamento PIX rejeitado.',
        'PIX-DENIED': 'Pagamento PIX recusado.',
        'PIX-TRANSACTION-DENIED': 'Transação PIX negada. Tente novamente ou use outro método de pagamento.',
        
        'DENY': 'Transação negada. Verifique os dados ou contate o emissor do cartão.'
    };
    
    if (friendlyMessages[displayErrorCode]) {
        displayMessage = friendlyMessages[displayErrorCode];
    } else if (displayMessage === 'Não foi possível processar seu pagamento.' && displayErrorCode !== 'N/A' && displayErrorCode !== 'unknown') {
        // Se temos um código de erro mas a mensagem ainda é genérica, usa uma mensagem de erro mais direta.
        displayMessage = `Pagamento não aprovado. (Cód: ${displayErrorCode})`;
    }
    
    // Evita que displayDetails seja igual a displayMessage ou vazio por padrão, a menos que seja a única info.
    if (displayDetails === 'Por favor, verifique os dados do cartão e tente novamente.' || displayDetails === displayMessage || displayDetails === null || (typeof displayDetails === 'string' && displayDetails.trim() === '')) {
        displayDetails = (displayErrorCode !== 'N/A' && displayErrorCode !== 'unknown') ? 
            `Consulte o código ${displayErrorCode} com o suporte, se necessário.` : 
            (displayMessage !== 'Pagamento não aprovado.' ? displayMessage : 'Tente novamente ou contate o suporte.');
    }
    if (displayDetails === displayMessage) displayDetails = ''; // Não repete se for igual

    // ... (resto da função para criar o HTML do popup, botão de cópia, etc., permanece o mesmo que na última versão funcional que você aceitou) ...
    // O HTML do popup usará displayMessage, displayErrorCode, displayDetails atualizados.
    // O botão de cópia usará rawErrorDataForCopy.

    const backdrop = document.createElement('div');
    backdrop.id = 'custom-error-popup';
    backdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6); z-index: 10000; display: flex;
        align-items: center; justify-content: center; padding: 15px; box-sizing: border-box;`

    const popup = document.createElement('div');
    popup.style.cssText = `
        background: #fff; padding: 0; max-height: 90vh; overflow-y: auto;
        border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        max-width: 500px; width: 100%;
        font-family: 'Segoe UI', Arial, sans-serif;
        display: flex; flex-direction: column;
        animation: popupInError 0.4s cubic-bezier(.68,-0.55,.27,1.55);`
    
    const header = document.createElement('div');
    header.style.cssText = `
        background: #d32f2f; color: white; padding: 15px 20px;
        font-size: 1.25rem; font-weight: 600; text-align: center;
        border-top-left-radius: 10px; border-top-right-radius: 10px;`
    header.textContent = 'Pagamento Não Aprovado';
    
    const content = document.createElement('div');
    content.style.cssText = `padding: 20px; color: #333; font-size: 1rem;`

    let detailsHtml = '';
    if (typeof displayDetails === 'string' && displayDetails.trim() !== '') {
        detailsHtml = `<p style="margin-bottom:20px; font-size:0.9em; color:#555;"><strong>Detalhes:</strong> ${displayDetails}</p>`;
    } else if (Array.isArray(displayDetails) && displayDetails.length > 0) {
         detailsHtml = `<p style="margin-bottom:20px; font-size:0.9em; color:#555;"><strong>Detalhes:</strong> ${JSON.stringify(displayDetails)}</p>`;
    }

    content.innerHTML = `
        <p style="margin-top:0; margin-bottom:15px; font-size: 1.1em;">${displayMessage}</p>
        ${displayErrorCode !== 'N/A' ? `<p style="margin-bottom:10px;"><strong>Código do Erro:</strong> ${displayErrorCode}</p>` : ''}
        ${detailsHtml}
        <p style="font-size:0.9em; color:#777;">Se o problema persistir, por favor, clique no botão abaixo para copiar os detalhes do erro e entre em contato com nosso suporte.</p>
    `;

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copiar Detalhes para Suporte';
    copyButton.style.cssText = `
        background: #f0f0f0; color: #333; border: 1px solid #ccc; border-radius: 5px;
        font-size: 0.95rem; font-weight: 500; padding: 10px 15px;
        cursor: pointer; width: 100%; margin-top: 10px; margin-bottom:10px;
        transition: background 0.2s;`
    copyButton.onmouseover = () => copyButton.style.background = '#e0e0e0';
    copyButton.onmouseout = () => copyButton.style.background = '#f0f0f0';
    
    copyButton.onclick = () => {
        const now = new Date();
        let orderIdForCopy = 'N/A';
        let paymentIdForCopy = 'N/A';
        
        // Tenta pegar order_id e payment_id do contexto, se possível
        if (window.currentPaymentData) {
            orderIdForCopy = window.currentPaymentData.order_id || orderIdForCopy;
            paymentIdForCopy = window.currentPaymentData.payment_id || paymentIdForCopy;
        } 
        // Tenta pegar do objeto de erro, caso ele tenha essas informações no nível raiz
        if (errorResult && errorResult.order_id) orderIdForCopy = errorResult.order_id;
        if (errorResult && errorResult.payment_id) paymentIdForCopy = errorResult.payment_id;
        // Ou de dentro de data, se for a estrutura da Getnet
        if (errorResult && errorResult.data && errorResult.data.order_id) orderIdForCopy = errorResult.data.order_id;
        if (errorResult && errorResult.data && errorResult.data.payment_id) paymentIdForCopy = errorResult.data.payment_id;

        const errorLogForSupport = `
------------------------------------------
DETALHES DO ERRO PARA SUPORTE - LOJA RÁPIDA
------------------------------------------
Data/Hora do Erro (Frontend): ${now.toLocaleString('pt-BR')} (${now.toISOString()})
Loja (Store ID): ${getCurrentStoreId()}
Order ID (Contexto): ${orderIdForCopy}
Payment ID (Contexto): ${paymentIdForCopy}

Código do Erro (Display): ${displayErrorCode}
Mensagem (Display): ${displayMessage}
Detalhes (Display): ${displayDetails}

Navegador: ${navigator.userAgent}

Dados Brutos do Erro (JSON):
${JSON.stringify(rawErrorDataForCopy, null, 2)}
------------------------------------------`
        navigator.clipboard.writeText(errorLogForSupport.trim()).then(() => {
            showSuccessMessage('Detalhes do erro copiados!');
        }).catch(err => {
            console.error('Falha ao copiar detalhes do erro:', err);
            showErrorMessage('Não foi possível copiar os detalhes.');
        });
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK'; // Apenas 'OK', sem (Fechar)
    closeButton.style.cssText = `
        background: #c62828; color: #fff; border: none; border-radius: 5px;
        font-size: 1rem; font-weight: 600; padding: 12px 20px;
        cursor: pointer; width: 100%; margin-top:10px;
        transition: background 0.2s, transform 0.1s;`
    closeButton.onmouseover = () => closeButton.style.background = '#b71c1c';
    closeButton.onmouseout = () => closeButton.style.background = '#c62828';
    closeButton.onclick = () => backdrop.remove();
    
    content.appendChild(copyButton);
    content.appendChild(closeButton);
    popup.appendChild(header);
    popup.appendChild(content);
    
    const style = document.createElement('style');
    style.textContent = `@keyframes popupInError { 0% { opacity: 0; transform: translateY(20px) scale(0.95);} 100% { opacity: 1; transform: translateY(0) scale(1);} }`
    document.head.appendChild(style);

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);
    console.log('Exibindo popup de erro detalhado.');
}

// Ajustar handlePixError para usar uma estrutura similar ou chamar showCardErrorDetails
function handlePixError(error) {
    console.error('Erro no pagamento Pix:', error);
    // Para consistência, podemos chamar showCardErrorDetails, 
    // já que ela foi generalizada para tratar diferentes formatos de erro.
    // Apenas garantimos que a mensagem padrão seja mais específica para PIX se for um erro genérico.
    let processedError = error;
    if (typeof error === 'object' && error !== null) {
        if (!error.message && !error.error_message) {
            processedError.message = 'Ocorreu um erro ao processar seu pagamento PIX.';
        }
    } else if (typeof error === 'string') {
        processedError = { message: error };
    } else {
        processedError = { message: 'Erro desconhecido no processamento PIX.' };
    }
    showCardErrorDetails(processedError);
}

// Função para processar dados de cartão de acordo com o formato esperado pela Getnet
function preparaDadosCartao(cardData) {
    // Certifica-se de que número não tem espaços
    const cardNumber = cardData.number.replace(/\D/g, '');
    
    // Certifica-se que o número está dentro do limite exigido
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error('Número de cartão inválido');
    }
    
    // Certifica-se que ano tem SEMPRE 2 dígitos (últimos 2 dígitos do ano)
    let expYear = cardData.expiration_year;
    if (expYear.length === 4) {
        expYear = expYear.substring(2, 4); // Pega apenas os 2 últimos dígitos
    } else if (expYear.length > 2) {
        expYear = expYear.substring(expYear.length - 2); // Garante que pegamos os 2 últimos dígitos em qualquer caso
    } else if (expYear.length === 1) {
        expYear = '0' + expYear; // Adiciona zero à esquerda se for apenas um dígito
    }
    
    // Certifica-se que o mês tem 2 dígitos com zero à esquerda
    const expMonth = cardData.expiration_month.padStart(2, '0');
    
    // Detectar bandeira corretamente - não confiar na entrada do usuário
    let brand = cardData.brand.toLowerCase();
    // Se a bandeira não for uma das reconhecidas, usar "mastercard" como fallback
    const validBrands = ['visa', 'mastercard', 'amex', 'elo', 'hipercard'];
    if (!validBrands.includes(brand)) {
        brand = 'mastercard'; // Fallback para mastercard se não reconhecida
    }
    
    console.log('Dados do cartão formatados para Getnet:', {
        expMonth,
        expYear,
        brand,
        numberStart: cardNumber.substring(0, 4) + '****',
        numberEnd: '****' + cardNumber.substring(cardNumber.length - 4)
    });
    
    // Retorna dados formatados exatamente como esperado pela Getnet
    return {
        number: cardNumber,
        cardholder_name: cardData.holder_name.toUpperCase().trim(), // Nome do titular em maiúsculas e sem espaços extras
        security_code: cardData.security_code.trim(),
        brand: brand,
        expiration_month: expMonth,
        expiration_year: expYear
    };
}

async function processarPagamento() {
    if (!validarFormulario()) {
        console.log('Validação do formulário falhou');
        return;
    }

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('botao-pagar').disabled = true;

    try {
        const dadosComuns = coletarDadosFormulario();

        if (dadosComuns.forma_pagamento === 'pix') {
            try {
                // NOVA: Salvar dados completos antes de abrir modal PIX
                console.log('DEBUG: Salvando dados antes de abrir modal PIX...');
                saveFormData();
                
                await processarPagamentoPix(dadosComuns);
            } catch (error) {
                handlePixError(error);
            }
        } else if (dadosComuns.forma_pagamento === 'cartao') {
            // Detectar a bandeira do cartão
            const brand = detectarBandeira(dadosComuns.card_number);
            
            // Preparar dados do cartão
            const cardData = {
                number: dadosComuns.card_number,
                holder_name: dadosComuns.nome_cartao,
                expiration_month: dadosComuns.validade_mes,
                expiration_year: dadosComuns.validade_ano,
                security_code: dadosComuns.cvv,
                brand: brand
            };
            
            try {
                // Formata dados do cartão conforme exigido pela Getnet
                const formattedCardData = preparaDadosCartao(cardData);
                
                // Prepara os dados padronizados para o pedido
                const dadosPedido = prepararDadosPedido(dadosComuns);
                
                // Montar payload conforme exigido pela Getnet
                const cardPayload = {
                    ...dadosPedido,
                    number_installments: parseInt(dadosComuns.parcelas, 10) || 1,
                    type: 'credit_card',
                    payment_type: 'credit_card',
                    card: formattedCardData,
                    fraud_analysis: {
                        customer_browser: navigator.userAgent,
                        customer_phone: dadosComuns.celular,
                        customer_ip: '',
                        shipping_address: dadosPedido.customer.delivery_address,
                        risk_assessment: {
                            channel: 'ECOMMERCE',
                            customer_is_risk: false,
                            customer_has_history: false,
                            shipping_method: 'DIGITAL',
                            delivery_timeframe: 'SAME_DAY',
                            purchase_by_third: false,
                            product_category: 'EDUCATION',
                            product_subcategory: 'DIGITAL_GOODS'
                        }
                    }
                };
                
                console.log('Payload enviado para o backend (cartão):', cardPayload);
                const paymentPath = getPaymentIntegrationPath(); // Obter caminho dinâmico
                const response = await fetch(`/${paymentPath}/public/process.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    body: JSON.stringify(cardPayload)
                });
                
                // Captura o texto bruto da resposta para diagnóstico
                const responseText = await response.text();
                console.log('Resposta do servidor (texto):', responseText);
                
                let result = null;
                try {
                    // Converte a resposta de texto para JSON
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Erro ao fazer parse da resposta:', e);
                    showErrorMessage('Erro inesperado na resposta do servidor.');
                    return;
                }
                
                console.log('Resposta do servidor (parsed):', result);
                
                // Se o status for negado ou houver erro, extrai os detalhes do erro para exibição
                if (!response.ok || (result.status !== 'APPROVED' && result.status !== 'approved')) {
                    showCardErrorDetails(result);
                    return;
                }
                
                // Sucesso: redireciona para a página de sucesso
                if (result.redirect) {
                    // Backend forneceu URL de redirecionamento - usar essa
                    console.log('Redirecionando para URL fornecida pelo backend:', result.redirect);
                    window.location.href = result.redirect;
                } else {
                    // Fallback: construir URL manualmente
                    const params = new URLSearchParams({
                        status: result.status || 'APPROVED',
                        payment_id: result.payment_id || '',
                        order_number: result.order_id || cardPayload.order_id
                    });
                    const fallbackUrl = `/stores/${getCurrentStoreId()}/views/sucesso.php?${params.toString()}`;
                    console.log('Backend não forneceu redirect, usando URL construída:', fallbackUrl);
                    window.location.href = fallbackUrl;
                }
            } catch (error) {
                console.error('Erro ao preparar dados de cartão:', error);
                showCardErrorDetails({
                    error_code: 'FORMAT_ERROR',
                    error_message: error.message || 'Dados do cartão em formato inválido'
                });
            }
        }
    } catch (error) {
        console.error('Erro durante o processamento:', error);
        showErrorMessage(error.message || 'Erro ao processar pagamento. Por favor, tente novamente.');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('botao-pagar').disabled = false;
    }
}

// Função para coletar dados do formulário
function coletarDadosFormulario() {
    // Obtém os dados básicos do formulário
    const form = document.getElementById('form-pagamento');
    
    // Captura valores dos campos
    const formData = new FormData(form);
    const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'pix';
    
    // Seleciona o valor correto com base na forma de pagamento
    const valor_total = formaPagamento === 'pix' 
        ? document.getElementById('valor_total')?.value || '0'
        : document.getElementById('valor_cartao_total')?.value || '0';
    
    // Processa os dados de cartão se for cartão de crédito
    let cartaoData = {};
    if (formaPagamento === 'cartao') {
        const numeroCartao = (document.getElementById('numero_cartao')?.value || '').replace(/\D/g, '');
        const validadeCartao = document.getElementById('validade_cartao')?.value || '';
        const [mes, ano] = validadeCartao.split('/');
        
        cartaoData = {
            card_number: numeroCartao,
            nome_cartao: document.getElementById('nome_cartao')?.value || '',
            validade_mes: mes || '',
            validade_ano: ano || '',
            cvv: document.getElementById('cvv_cartao')?.value || '',
            parcelas: document.getElementById('parcelas')?.value || '1'
        };
    }

    // NOVO: Coletar filhos
    const filhos = [];
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos')?.value || '0');
    for (let i = 1; i <= qtdFilhos; i++) {
        const nomeFilho = document.getElementById(`nome_filho_${i}`)?.value || '';
        const serieFilho = document.getElementById(`serie_filho_${i}`)?.value || '';
        if (nomeFilho || serieFilho) {
            filhos.push({
                indice: i,
                nome: nomeFilho,
                serie: serieFilho
            });
        }
    }

    // NOVO: Coletar produtos
    const produtos = [];
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
        produtos.push({
            id: produtoId,
            nome: nome,
            quantidade: quantidade,
            valor: valorPix
        });
    });

    // ⚡ CORREÇÃO CRÍTICA: Coletar dados de frete
    console.log('🚨 === PAYMENT.JS: Coletando dados de frete ===');
    
    // Capturar campos hidden de frete
    const freteValor = document.getElementById('frete_valor')?.value || '0';
    const freteOpcao = document.getElementById('frete_opcao')?.value || '';
    const freteCompany = document.getElementById('frete_company')?.value || '';
    const freteService = document.getElementById('frete_service')?.value || '';
    const freteDeliveryTime = document.getElementById('frete_delivery_time')?.value || '0';
    const freteDeliveryRange = document.getElementById('frete_delivery_range')?.value || '';
    const freteMelhorEnvioId = document.getElementById('frete_melhor_envio_id')?.value || '';
    
    console.log('🔍 CAMPOS DE FRETE CAPTURADOS NO PAYMENT.JS:', {
        frete_valor: freteValor,
        frete_opcao: freteOpcao,
        frete_company: freteCompany,
        frete_service: freteService,
        frete_melhor_envio_id: freteMelhorEnvioId
    });
    
    // Estrutura de dados de frete
    const freightDetails = {
        selected_option: freteOpcao,
        valor: parseFloat(freteValor) || 0,
        company: freteCompany || null,
        service: freteService || null,
        delivery_time: parseInt(freteDeliveryTime) || 0,
        delivery_range: freteDeliveryRange || null,
        melhor_envio_id: freteMelhorEnvioId || null,
        selected_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('✅ FREIGHT_DETAILS CRIADO NO PAYMENT.JS:', freightDetails);

    // Retorna o objeto com todos os dados coletados
    return {
        forma_pagamento: formaPagamento,
        valor_total: valor_total,
        nome: document.getElementById('nome')?.value || '',
        sobrenome: document.getElementById('sobrenome')?.value || '',
        cpf: (document.getElementById('cpf')?.value || '').replace(/\D/g, ''),
        // ⚡ CORREÇÃO CRÍTICA: Usar phoneDDI para capturar celular com DDI
        celular: (window.phoneDDI && window.phoneDDI.getFormattedNumber) ? 
                 window.phoneDDI.getFormattedNumber() : 
                 (document.getElementById('celular_hidden')?.value || '').replace(/\D/g, ''),
        email: document.getElementById('email')?.value || '',
        entrega_cep: (document.getElementById('entrega_cep')?.value || '').replace(/\D/g, ''),
        entrega_endereco: document.getElementById('entrega_endereco')?.value || '',
        entrega_numero: document.getElementById('entrega_numero')?.value || '',
        entrega_complemento: document.getElementById('entrega_complemento')?.value || '',
        entrega_bairro: document.getElementById('entrega_bairro')?.value || '',
        entrega_cidade: document.getElementById('entrega_cidade')?.value || '',
        entrega_estado: document.getElementById('entrega_estado')?.value || '',
        mesmo_endereco: document.getElementById('mesmo_endereco')?.checked || false,
        faturamento_cep: (document.getElementById('faturamento_cep')?.value || '').replace(/\D/g, ''),
        faturamento_endereco: document.getElementById('faturamento_endereco')?.value || '',
        faturamento_numero: document.getElementById('faturamento_numero')?.value || '',
        faturamento_complemento: document.getElementById('faturamento_complemento')?.value || '',
        faturamento_bairro: document.getElementById('faturamento_bairro')?.value || '',
        faturamento_cidade: document.getElementById('faturamento_cidade')?.value || '',
        faturamento_estado: document.getElementById('faturamento_estado')?.value || '',
        filhos: filhos,
        produtos: produtos,
        
        // ⚡ NOVO: Incluir ano-projeto selecionado pelo cliente  
        customer_project_year: document.getElementById('customer_project_year')?.value || '',
        
        // ⚡ CORREÇÃO CRÍTICA: Adicionar dados de frete
        freight_details: freightDetails,
        frete_valor: parseFloat(freteValor) || 0,
        frete_opcao: freteOpcao,
        frete_company: freteCompany,
        frete_service: freteService,
        frete_delivery_time: parseInt(freteDeliveryTime) || 0,
        frete_delivery_range: freteDeliveryRange,
        frete_melhor_envio_id: freteMelhorEnvioId,
        
        // Adicionar dados do cupom do window.couponManager
        coupon_code: (window.couponManager && window.couponManager.isApplied) ? (window.couponManager.currentCoupon?.code || '') : '',
        coupon_discount_amount: (window.couponManager && window.couponManager.isApplied) ? window.couponManager.calculateCurrentDiscount() : 0,
        coupon_type: (window.couponManager && window.couponManager.isApplied) ? (window.couponManager.currentCoupon?.type || '') : '',
        coupon_id: (window.couponManager && window.couponManager.isApplied) ? (window.couponManager.currentCoupon?.id || '') : '',
        coupon_value: (window.couponManager && window.couponManager.isApplied) ? (window.couponManager.currentCoupon?.value || 0) : 0,
        coupon_applies_to_shipping: (window.couponManager && window.couponManager.isApplied) ? (window.couponManager.currentCoupon?.appliesToShipping || false) : false,
        
        ...cartaoData
    };
}

// Função para detectar bandeira do cartão
function detectarBandeira(numero) {
    numero = numero.replace(/\D/g, '');
    if (/^4/.test(numero)) return 'visa';
    if (/^5[1-5]/.test(numero)) return 'mastercard';
    if (/^3[47]/.test(numero)) return 'amex';
    if (/^6/.test(numero)) return 'elo';
    if (/^35/.test(numero)) return 'jcb';
    if (/^3(?:0[0-5]|[68])/.test(numero)) return 'diners';
    return 'desconhecida';
}

// Nova função para preparar dados do pedido de forma padronizada
function prepararDadosPedido(dadosFormulario) {
    // ⚡ LOG CRÍTICO: Verificar se dados de frete chegaram na função
    console.log('🚨 === PREPARAR DADOS PEDIDO: Verificando dados de frete ===');
    console.log('dadosFormulario.freight_details:', dadosFormulario.freight_details);
    console.log('dadosFormulario.frete_opcao:', dadosFormulario.frete_opcao);
    console.log('dadosFormulario.frete_company:', dadosFormulario.frete_company);
    
    // Order_id deve ser fornecido pelo formulário ou localStorage específico da loja
    const storeId = getCurrentStoreId();
    let order_id = dadosFormulario.order_id || localStorage.getItem(`current_order_id_${storeId}`);
    
    if (!order_id) {
        console.error('ALERTA: order_id não encontrado para store:', storeId, '- Gerando usando store_id atual');
        // Usa o store_id atual (que pode ser 'unknown_store') no prefixo
        order_id = storeId.toUpperCase() + '-' + Math.floor(Date.now()/1000);
    }
    
    // Formata filhos no formato esperado pelo backend
    const filhos = dadosFormulario.filhos.map(filho => ({
        nome: filho.nome,
        serie: filho.serie,
        indice: filho.indice
    }));
    
    // Formata endereços no formato esperado pelo backend
    const delivery_address = {
        street: dadosFormulario.entrega_endereco,
        number: dadosFormulario.entrega_numero,
        complement: dadosFormulario.entrega_complemento,
        district: dadosFormulario.entrega_bairro,
        city: dadosFormulario.entrega_cidade,
        state: dadosFormulario.entrega_estado,
        country: 'Brasil',
        postal_code: dadosFormulario.entrega_cep
    };
    
    const billing_address = dadosFormulario.mesmo_endereco ? 
        delivery_address : 
        {
            street: dadosFormulario.faturamento_endereco,
            number: dadosFormulario.faturamento_numero,
            complement: dadosFormulario.faturamento_complemento,
            district: dadosFormulario.faturamento_bairro,
            city: dadosFormulario.faturamento_cidade,
            state: dadosFormulario.faturamento_estado,
            country: 'Brasil',
            postal_code: dadosFormulario.faturamento_cep
        };
    
    // ⚡ CORREÇÃO CRÍTICA: Preparar objeto incluindo TODOS os dados de frete
    const dadosPreparados = {
        // Identificadores
        order_id: order_id,
        store_id: getCurrentStoreId(), // CORREÇÃO: Preservar case real do store_id
        name_store: getCurrentStoreName(),
        
        // Dados de pagamento
        forma_pagamento: dadosFormulario.forma_pagamento,
        valor_total: dadosFormulario.valor_total,
        amount: Math.round(parseFloat(dadosFormulario.valor_total.replace(',', '.')) * 100),
        currency: 'BRL',
        
        // Dados do cliente
        nome: dadosFormulario.nome,
        sobrenome: dadosFormulario.sobrenome,
        cpf: dadosFormulario.cpf,
        celular: dadosFormulario.celular,
        email: dadosFormulario.email,
        
        // Estrutura customer para compatibilidade com API
        customer: {
            customer_id: dadosFormulario.cpf,
            first_name: dadosFormulario.nome,
            last_name: dadosFormulario.sobrenome,
            name: `${dadosFormulario.nome} ${dadosFormulario.sobrenome}`,
            email: dadosFormulario.email,
            phone_number: dadosFormulario.celular,
            document_type: 'CPF',
            document_number: dadosFormulario.cpf,
            // Informações adicionais
            children: dadosFormulario.filhos.map(filho => ({
                name: filho.nome,
                grade: filho.serie
            })),
            // Endereços formatados
            delivery_address: delivery_address,
            billing_address: billing_address
        },
        
        // Dados de endereço original (para compatibilidade)
        entrega_cep: dadosFormulario.entrega_cep,
        entrega_endereco: dadosFormulario.entrega_endereco,
        entrega_numero: dadosFormulario.entrega_numero,
        entrega_complemento: dadosFormulario.entrega_complemento,
        entrega_bairro: dadosFormulario.entrega_bairro,
        entrega_cidade: dadosFormulario.entrega_cidade,
        entrega_estado: dadosFormulario.entrega_estado,
        mesmo_endereco: dadosFormulario.mesmo_endereco,
        faturamento_cep: dadosFormulario.faturamento_cep,
        faturamento_endereco: dadosFormulario.faturamento_endereco,
        faturamento_numero: dadosFormulario.faturamento_numero,
        faturamento_complemento: dadosFormulario.faturamento_complemento,
        faturamento_bairro: dadosFormulario.faturamento_bairro,
        faturamento_cidade: dadosFormulario.faturamento_cidade,
        faturamento_estado: dadosFormulario.faturamento_estado,
        
        // Dados dos produtos e filhos (replicados para facilitar acesso)
        produtos: dadosFormulario.produtos,
        filhos: filhos,
        
        // ⚡ CORREÇÃO CRÍTICA: Incluir TODOS os dados de frete
        freight_details: dadosFormulario.freight_details,
        frete_valor: dadosFormulario.frete_valor,
        frete_opcao: dadosFormulario.frete_opcao,
        frete_company: dadosFormulario.frete_company,
        frete_service: dadosFormulario.frete_service,
        frete_delivery_time: dadosFormulario.frete_delivery_time,
        frete_delivery_range: dadosFormulario.frete_delivery_range,
        frete_melhor_envio_id: dadosFormulario.frete_melhor_envio_id,
        
        // Dispositivo e identificadores para fraude
        device: {
            ip_address: '',  // será preenchido pelo backend
            device_id: getDeviceId(),
            fingerprint: getFingerprint()
        },
        
        // ⚡ CORREÇÃO CRÍTICA: Incluir customer_project_year no objeto final
        customer_project_year: dadosFormulario.customer_project_year
    };
    
    // ⚡ LOG CRÍTICO: Verificar dados de frete no objeto final
    console.log('✅ DADOS PREPARADOS COM FRETE:', {
        freight_details: dadosPreparados.freight_details,
        frete_opcao: dadosPreparados.frete_opcao,
        frete_company: dadosPreparados.frete_company
    });
    
    // ⚡ LOG CRÍTICO: Verificar name_store no objeto final
    console.log('🏪 NAME_STORE INCLUÍDO:', dadosPreparados.name_store);
    
    return dadosPreparados;
}

// Modifica a função processarPagamentoPix para usar o padrão de dados
async function processarPagamentoPix(dadosComuns) {
    try {
        // Prepara os dados padronizados para o pedido
        const dadosPedido = prepararDadosPedido(dadosComuns);
        
        // Complementa dados específicos para PIX
        const pixPayload = { 
            ...dadosPedido,
            type: 'pix',
            payment_type: 'pix'
        };
        
        console.log("Enviando dados PIX para processamento:", pixPayload);
        
        const paymentPath = getPaymentIntegrationPath(); // Obter caminho dinâmico
        const response = await fetch(`/${paymentPath}/public/process.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pixPayload)
        });
        
        // Verificar se a resposta é válida
        console.log('Response status:', response.status, 'Status text:', response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Capturar o texto da resposta primeiro
        const responseText = await response.text();
        console.log('Response text length:', responseText.length);
        console.log('Response text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
        
        // Tentar fazer parse do JSON
        let resultado;
        try {
            resultado = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Erro ao fazer parse do JSON:', jsonError);
            throw new Error('Resposta inválida do servidor. Erro: ' + jsonError.message + '. Resposta: ' + responseText.substring(0, 200));
        }
        
        if (!response.ok || !resultado.success) {
            throw new Error(resultado.message || resultado.error || 'Erro ao processar pagamento Pix');
        }
        
        // Extrair IDs importantes
        const paymentId = resultado.data.payment_id;
        const orderId = resultado.data.order_id || pixPayload.order_id;
        
        // Log detalhado da resposta para debug
        console.log('Resposta PIX completa:', resultado);
        
        // Formatar valor para exibição
        let valorFormatado = '';
        if (dadosComuns.valor_total) {
            valorFormatado = Number(dadosComuns.valor_total.replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        
        // Exibe o QR Code e inicia polling
        showPixModal(
            resultado.data.qr_code,
            resultado.data.pix_code,
            resultado.data.expiration,
            resultado.data.status,
            resultado.data.description,
            valorFormatado,
            orderId,
            paymentId
        );
        
    } catch (error) {
        handlePixError(error);
    }
} 

// Função para obter o ID da loja atual com base no caminho da URL
function getCurrentStoreId() {
    const path = window.location.pathname;
    
    // Primeiro tenta extrair do caminho URL - formato: /stores/[store_id]/...
    const match = path.match(/^\/stores\/([^\/]+)\//);
    if (match && match[1]) {
        // CORREÇÃO: Preservar case real da pasta para store_id
        return match[1];
    }
    
    // Segunda tentativa, extrai do referrer se existir (CORRIGIDO: só aceita formato /stores/)
    if (document.referrer) {
        try {
        const referrerUrl = new URL(document.referrer);
        const referrerMatch = referrerUrl.pathname.match(/^\/stores\/([^\/]+)\//);
        if (referrerMatch && referrerMatch[1]) {
            // CORREÇÃO: Preservar case real da pasta para store_id
            return referrerMatch[1];
            }
        } catch (e) {
            console.warn('Erro ao processar referrer URL:', e);
        }
    }
    
    // Terceira tentativa: Meta tag store-id
    const storeIdMeta = document.querySelector('meta[name="store-id"]');
    if (storeIdMeta && storeIdMeta.content) {
        // CORREÇÃO: Preservar case real para store_id
        return storeIdMeta.content;
    }
    
    // Quarta tentativa: Configuração global do JavaScript
    if (window.STORE_CONFIG && window.STORE_CONFIG.store_id) {
        // CORREÇÃO: Preservar case real para store_id
        return window.STORE_CONFIG.store_id;
    }
    
    // Quinta tentativa: Buscar em data attributes do body
    const bodyStoreId = document.body.dataset.storeId;
    if (bodyStoreId) {
        // CORREÇÃO: Preservar case real para store_id
        return bodyStoreId;
    }
    
    // FALLBACK: Se não conseguir detectar, usar 'unknown_store'
    console.warn('Não foi possível detectar o store_id automaticamente. Usando fallback.');
    return 'unknown_store';
}

// Modifica a função de registro de logs para incluir o store_id
function registrarLogClienteLoja(type, data) {
    const storeId = getCurrentStoreId();
    // CORREÇÃO CIRÚRGICA v2.1.5: URL corrigido para nova estrutura /stores/
    return fetch('/stores/' + storeId + '/customers/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
            type: type,
            data: data,
            store_id: storeId // Adiciona explicitamente o store_id
        })
    })
    .then(response => response.json())
    .catch(err => console.error('Erro ao registrar log:', err));
}

// Função para tratar erros de PIX de forma mais detalhada e com opção de copiar
function showPixErrorDetails(errorResult) {
    const oldPopup = document.getElementById('custom-error-popup');
    if (oldPopup) oldPopup.remove();

    console.log('showPixErrorDetails recebeu:', errorResult);

    let displayErrorCode = 'N/A';
    let displayMessage = 'Ocorreu um erro ao processar seu pagamento PIX.';
    let displayDetails = 'Por favor, tente novamente ou gere um novo QR Code. Se o erro persistir, entre em contato com o suporte.';
    let rawErrorDataForCopy = {};

    if (typeof errorResult === 'string') {
        displayMessage = errorResult;
        rawErrorDataForCopy = { message: errorResult };
    } else if (typeof errorResult === 'object' && errorResult !== null) {
        rawErrorDataForCopy = errorResult;

        displayErrorCode = errorResult.code || errorResult.error_code || errorResult.errorCode || displayErrorCode;
        let specificMessage = errorResult.message || errorResult.error_message || errorResult.errorMessage;
        displayMessage = specificMessage || displayMessage;
        displayDetails = errorResult.details || errorResult.error_details || errorResult.errorDetails || displayDetails;

        if (typeof errorResult.data === 'object' && errorResult.data !== null) {
            const errorResponseData = errorResult.data;
            displayErrorCode = errorResponseData.code || errorResponseData.error_code || displayErrorCode;
            let messageFromData = errorResponseData.message || errorResponseData.error_message;
            if (messageFromData) displayMessage = messageFromData;
            if (errorResponseData.details && Array.isArray(errorResponseData.details) && errorResponseData.details.length > 0) {
                const firstDetail = errorResponseData.details[0];
                displayMessage = firstDetail.message || firstDetail.description || displayMessage;
                displayDetails = firstDetail.description_detail || displayDetails;
                displayErrorCode = firstDetail.error_code || displayErrorCode;
            } else if (errorResponseData.description && !messageFromData) {
                 displayMessage = errorResponseData.description;
            }
            let detailsFromData = errorResponseData.description_detail || errorResponseData.details;
            if (detailsFromData && detailsFromData !== displayMessage) {
                 displayDetails = detailsFromData;
            } else if (typeof detailsFromData === 'string' && detailsFromData === displayMessage) {
                 if (displayDetails === 'Por favor, tente novamente ou gere um novo QR Code. Se o erro persistir, entre em contato com o suporte.') {
                 }
            }
        }
    }

    const friendlyMessagesPix = {
        'PIX_EXPIRED': 'O código PIX expirou. Por favor, gere um novo.',
        'PAYMENT_DENIED': 'Pagamento PIX não aprovado pela instituição.',
    };

    if (friendlyMessagesPix[displayErrorCode]) {
        displayMessage = friendlyMessagesPix[displayErrorCode];
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'custom-error-popup';
    backdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6); z-index: 10000; display: flex;
        align-items: center; justify-content: center; padding: 15px; box-sizing: border-box;`

    const popup = document.createElement('div');
    popup.style.cssText = `
        background: #fff; padding: 0; max-height: 90vh; overflow-y: auto;
        border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        max-width: 500px; width: 100%;
        font-family: 'Segoe UI', Arial, sans-serif;
        display: flex; flex-direction: column;
        animation: popupInError 0.4s cubic-bezier(.68,-0.55,.27,1.55);`
    
    const header = document.createElement('div');
    header.style.cssText = `
        background: #d32f2f; color: white; padding: 15px 20px;
        font-size: 1.25rem; font-weight: 600; text-align: center;
        border-top-left-radius: 10px; border-top-right-radius: 10px;`
    header.textContent = 'Erro no Pagamento PIX';

    const content = document.createElement('div');
    content.style.cssText = `padding: 20px; color: #333; font-size: 1rem;`

    let detailsHtml = '';
    if (typeof displayDetails === 'string' && displayDetails.trim() !== '' && displayDetails !== displayMessage) {
        detailsHtml = `<p style="margin-bottom:20px; font-size:0.9em; color:#555;"><strong>Detalhes:</strong> ${displayDetails}</p>`;
    } else if (Array.isArray(displayDetails) && displayDetails.length > 0) {
         detailsHtml = `<p style="margin-bottom:20px; font-size:0.9em; color:#555;"><strong>Detalhes:</strong> ${JSON.stringify(displayDetails)}</p>`;
    }

    content.innerHTML = `
        <p style="margin-top:0; margin-bottom:15px; font-size: 1.1em;">${displayMessage}</p>
        ${displayErrorCode !== 'N/A' ? `<p style="margin-bottom:10px;"><strong>Código do Erro:</strong> ${displayErrorCode}</p>` : ''}
        ${detailsHtml}
        <p style="font-size:0.9em; color:#777;">Se o problema persistir, por favor, clique no botão abaixo para copiar os detalhes do erro e entre em contato com nosso suporte.</p>
    `;

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copiar Detalhes para Suporte (PIX)';
    copyButton.style.cssText = `
        background: #f0f0f0; color: #333; border: 1px solid #ccc; border-radius: 5px;
        font-size: 0.95rem; font-weight: 500; padding: 10px 15px;
        cursor: pointer; width: 100%; margin-top: 10px; margin-bottom:10px;
        transition: background 0.2s;`
    copyButton.onmouseover = () => copyButton.style.background = '#e0e0e0';
    copyButton.onmouseout = () => copyButton.style.background = '#f0f0f0';
    
    copyButton.onclick = () => {
        const now = new Date();
        let orderIdForCopy = 'N/A';
        let paymentIdForCopy = 'N/A';
        
        if (window.currentPaymentData) {
            orderIdForCopy = window.currentPaymentData.order_id || orderIdForCopy;
            paymentIdForCopy = window.currentPaymentData.payment_id || paymentIdForCopy;
        } 
        if (errorResult && errorResult.order_id) orderIdForCopy = errorResult.order_id;
        if (errorResult && errorResult.payment_id) paymentIdForCopy = errorResult.payment_id;
        if (errorResult && errorResult.data && errorResult.data.order_id) orderIdForCopy = errorResult.data.order_id;
        if (errorResult && errorResult.data && errorResult.data.payment_id) paymentIdForCopy = errorResult.data.payment_id;

        const errorLogForSupport = `
------------------------------------------
DETALHES DO ERRO PIX PARA SUPORTE - LOJA RÁPIDA
------------------------------------------
Data/Hora do Erro (Frontend): ${now.toLocaleString('pt-BR')} (${now.toISOString()})
Loja (Store ID): ${getCurrentStoreId()}
Order ID (Contexto): ${orderIdForCopy}
Payment ID (Contexto): ${paymentIdForCopy}

Tipo de Pagamento: PIX
Código do Erro (Display): ${displayErrorCode}
Mensagem (Display): ${displayMessage}
Detalhes (Display): ${(typeof displayDetails === 'string' && displayDetails.trim() !== '' && displayDetails !== displayMessage) ? displayDetails : 'N/A'}

Navegador: ${navigator.userAgent}

Dados Brutos do Erro PIX (JSON):
${JSON.stringify(rawErrorDataForCopy, null, 2)}
------------------------------------------`
        navigator.clipboard.writeText(errorLogForSupport.trim()).then(() => {
            showSuccessMessage('Detalhes do erro PIX copiados!');
        }).catch(err => {
            console.error('Falha ao copiar detalhes do erro PIX:', err);
            showErrorMessage('Não foi possível copiar os detalhes do erro PIX.');
        });
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK'; // Apenas 'OK', sem (Fechar)
    closeButton.style.cssText = `
        background: #c62828; color: #fff; border: none; border-radius: 5px;
        font-size: 1rem; font-weight: 600; padding: 12px 20px;
        cursor: pointer; width: 100%; margin-top:10px;
        transition: background 0.2s, transform 0.1s;`
    closeButton.onmouseover = () => closeButton.style.background = '#b71c1c';
    closeButton.onmouseout = () => closeButton.style.background = '#c62828';
    closeButton.onclick = () => backdrop.remove();

    content.appendChild(copyButton);
    content.appendChild(closeButton);
    popup.appendChild(header);
    popup.appendChild(content);
    
    const style = document.createElement('style');
    style.textContent = `@keyframes popupInError { 0% { opacity: 0; transform: translateY(20px) scale(0.95);} 100% { opacity: 1; transform: translateY(0) scale(1);} }`
    document.head.appendChild(style);

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);
    console.log('Exibindo popup de erro PIX detalhado.');
}

// ATENÇÃO: ESTA É A MODIFICAÇÃO PARA handlePixError
function handlePixError(error) {
    console.error('Erro no pagamento Pix:', error);
    let processedError = error;
    // Garante que temos um objeto para showPixErrorDetails e uma mensagem padrão se necessário
    if (typeof error !== 'object' || error === null) {
        processedError = { 
            message: String(error) || 'Erro desconhecido no processamento PIX.',
            originalError: String(error) // Mantém o erro original para o log de cópia
        };
    } else if (!error.message && !error.error_message && !error.errorMessage) {
        // Adiciona uma mensagem padrão se o objeto de erro não tiver uma mensagem clara
        processedError.message = 'Ocorreu um erro ao processar seu pagamento PIX. Verifique os detalhes ou tente novamente.';
    }
    showPixErrorDetails(processedError); // Chama a nova função específica para PIX
}

// Função para obter o nome da loja
function getCurrentStoreName() {
    console.log('🔍 getCurrentStoreName: Buscando nome da loja...');
    
    // Primeira tentativa: Meta tag store-name
    const storeNameMeta = document.querySelector('meta[name="store-name"]');
    if (storeNameMeta && storeNameMeta.content) {
        console.log('✅ getCurrentStoreName: Encontrado via meta tag:', storeNameMeta.content);
        return storeNameMeta.content;
    }
    
    // Segunda tentativa: Configuração global do JavaScript
    if (window.STORE_CONFIG && window.STORE_CONFIG.store_name) {
        console.log('✅ getCurrentStoreName: Encontrado via window.STORE_CONFIG:', window.STORE_CONFIG.store_name);
        return window.STORE_CONFIG.store_name;
    }
    
    // Terceira tentativa: Buscar em data attributes do body
    const bodyStoreName = document.body.dataset.storeName;
    if (bodyStoreName) {
        console.log('✅ getCurrentStoreName: Encontrado via body dataset:', bodyStoreName);
        return bodyStoreName;
    }
    
    // Fallback: usar nome padrão baseado no store_id
    const storeId = getCurrentStoreId();
    const fallbackName = storeId.charAt(0).toUpperCase() + storeId.slice(1).replace(/[_-]/g, ' ');
    console.log('⚠️ getCurrentStoreName: Usando fallback baseado no store_id:', fallbackName);
    return fallbackName;
}

