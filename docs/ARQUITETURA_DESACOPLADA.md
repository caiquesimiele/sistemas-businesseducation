# ARQUITETURA DESACOPLADA - BUSINESS EDUCATION

## OBJETIVO

Garantir que alterações no código da loja NÃO quebrem integrações (Omie, Getnet, Melhor Envio) e vice-versa.

**Princípio:** Código modular + Comunicação via eventos

---

## PROBLEMA QUE ESTAMOS RESOLVENDO

### ANTES (Acoplado - ruim):

```javascript
// loja-service/OrderManager.php
function aprovarPedido($orderId) {
    $this->saveOrder($orderId);
    
    // Chama integração DIRETAMENTE ❌
    $omie = new OmieIntegrator();
    $omie->createOrder($orderId);
    
    $getnet = new GetnetClient();
    $getnet->confirmPayment($orderId);
}
```

**Problema:**
- Mudar OrderManager pode quebrar Omie
- Mudar Omie pode quebrar OrderManager
- Adicionar campo novo quebra tudo
- **Altamente acoplado**

---

### DEPOIS (Desacoplado - bom):

```javascript
// loja-service/OrderController.js
async function aprovarPedido(orderId) {
    await saveOrder(orderId);
    
    // Apenas PUBLICA EVENTO ✅
    eventBus.publish('order.approved', {
        orderId: orderId,
        total: 150,
        timestamp: Date.now()
    });
    
    // FIM! Não sabe que Omie/Getnet existem
}
```

```javascript
// integration-service/omie/OmieSubscriber.js
eventBus.subscribe('order.approved', async (data) => {
    const omieClient = new OmieClient();
    await omieClient.createOrder(data);
});
```

```javascript
// integration-service/getnet/GetnetSubscriber.js
eventBus.subscribe('order.approved', async (data) => {
    const getnetClient = new GetnetClient();
    await getnetClient.confirmPayment(data);
});
```

**Vantagens:**
- ✅ OrderController não sabe que Omie existe
- ✅ Omie não sabe que OrderController existe
- ✅ Adicionar nova integração = criar novo subscriber
- ✅ Remover integração = deletar subscriber
- ✅ **Totalmente independentes**

---

## ESTRUTURA DE PASTAS

```
sistemas-businesseducation/
│
├── services/
│   │
│   ├── loja-service/                    ← Loja (não sabe de integrações)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── OrderController.js   ← Só gerencia pedidos
│   │   │   ├── services/
│   │   │   │   └── OrderService.js
│   │   │   ├── models/
│   │   │   │   └── Order.js
│   │   │   └── events/
│   │   │       └── OrderPublisher.js    ← Publica eventos
│   │   │
│   │   └── package.json
│   │
│   ├── integration-service/             ← Integrações (não sabem da loja)
│   │   ├── src/
│   │   │   ├── omie/                    ← Integração Omie ISOLADA
│   │   │   │   ├── OmieClient.js        ← Fala com API Omie
│   │   │   │   ├── OmieMapper.js        ← Converte dados
│   │   │   │   ├── OmieSubscriber.js    ← Escuta eventos
│   │   │   │   └── config.js            ← Configs Omie
│   │   │   │
│   │   │   ├── getnet/                  ← Integração Getnet ISOLADA
│   │   │   │   ├── GetnetClient.js
│   │   │   │   ├── GetnetSubscriber.js
│   │   │   │   └── config.js
│   │   │   │
│   │   │   └── melhorenvio/             ← Integração Melhor Envio ISOLADA
│   │   │       ├── MelhorEnvioClient.js
│   │   │       ├── MelhorEnvioSubscriber.js
│   │   │       └── config.js
│   │   │
│   │   └── package.json
│   │
│   └── shared/
│       └── eventBus.js                  ← Sistema de eventos central
│
└── data/
    └── (pedidos, logs, etc)
```

---

## FLUXO DE COMUNICAÇÃO

```
1. Cliente faz pedido
      ↓
2. OrderController salva pedido
      ↓
3. OrderPublisher publica evento "order.approved"
      ↓
4. Event Bus distribui para subscribers
      ↓
   ┌──────┴──────┬──────────────┐
   ↓             ↓              ↓
Omie         Getnet      Melhor Envio
Subscriber   Subscriber   Subscriber
   ↓             ↓              ↓
Cria NF    Confirma pgto  Calcula frete
```

**Cada integração trabalha INDEPENDENTEMENTE.**

---

## EVENTOS DO SISTEMA

### Estrutura de um evento:

```javascript
{
    eventName: 'order.approved',
    timestamp: 1730672400000,
    data: {
        orderId: '123',
        total: 150.00,
        customerId: '456'
    }
}
```

### Eventos principais:

| Evento | Quando acontece | Quem escuta |
|--------|-----------------|-------------|
| `order.created` | Pedido criado | Getnet (gera pagamento) |
| `order.approved` | Pedido aprovado | Omie (emite NF), Melhor Envio (calcula frete) |
| `payment.confirmed` | Pagamento confirmado | Loja (atualiza status) |
| `order.shipped` | Pedido despachado | Cliente (email), Omie (baixa estoque) |
| `order.cancelled` | Pedido cancelado | Getnet (estorna), Omie (cancela NF) |

---

## IMPLEMENTAÇÃO PRÁTICA

### 1. Event Bus (sistemas-businesseducation/services/shared/eventBus.js)

```javascript
const EventEmitter = require('events');
const Redis = require('ioredis');

class EventBus {
    constructor() {
        this.emitter = new EventEmitter();
        this.redis = new Redis(process.env.REDIS_URL);
        this.subscribers = new Map();
    }

    // Publicar evento
    publish(eventName, data) {
        const event = {
            eventName,
            timestamp: Date.now(),
            data
        };
        
        // Emite localmente
        this.emitter.emit(eventName, event);
        
        // Publica no Redis (para outros services)
        this.redis.publish(eventName, JSON.stringify(event));
        
        console.log(`[EventBus] Published: ${eventName}`, data);
    }

    // Subscrever a evento
    subscribe(eventName, handler) {
        // Local
        this.emitter.on(eventName, handler);
        
        // Redis
        const subscriber = this.redis.duplicate();
        subscriber.subscribe(eventName);
        subscriber.on('message', (channel, message) => {
            if (channel === eventName) {
                const event = JSON.parse(message);
                handler(event);
            }
        });
        
        this.subscribers.set(eventName, subscriber);
        
        console.log(`[EventBus] Subscribed to: ${eventName}`);
    }
}

module.exports = new EventBus();
```

---

### 2. Publicador (loja-service/src/events/OrderPublisher.js)

```javascript
const eventBus = require('../../../shared/eventBus');

class OrderPublisher {
    publishOrderApproved(order) {
        eventBus.publish('order.approved', {
            orderId: order.id,
            total: order.total,
            customerId: order.customerId,
            items: order.items
        });
    }

    publishOrderCancelled(orderId) {
        eventBus.publish('order.cancelled', {
            orderId
        });
    }

    publishOrderShipped(orderId, trackingCode) {
        eventBus.publish('order.shipped', {
            orderId,
            trackingCode
        });
    }
}

module.exports = new OrderPublisher();
```

---

### 3. Controller da Loja (loja-service/src/controllers/OrderController.js)

```javascript
const OrderService = require('../services/OrderService');
const OrderPublisher = require('../events/OrderPublisher');

class OrderController {
    async aprovarPedido(req, res) {
        try {
            const { orderId } = req.params;
            
            // 1. Lógica de negócio
            const order = await OrderService.approveOrder(orderId);
            
            // 2. Publica evento (não chama integrações)
            OrderPublisher.publishOrderApproved(order);
            
            // 3. Responde imediatamente
            res.json({
                success: true,
                message: 'Pedido aprovado com sucesso',
                orderId: order.id
            });
            
            // Integrações processam em background
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();
```

---

### 4. Subscriber Omie (integration-service/src/omie/OmieSubscriber.js)

```javascript
const eventBus = require('../../../shared/eventBus');
const OmieClient = require('./OmieClient');

class OmieSubscriber {
    constructor() {
        this.client = new OmieClient();
        this.setupListeners();
    }

    setupListeners() {
        // Escuta evento de pedido aprovado
        eventBus.subscribe('order.approved', async (event) => {
            try {
                console.log('[Omie] Processando pedido aprovado:', event.data.orderId);
                
                await this.client.createOrder(event.data);
                
                console.log('[Omie] Nota fiscal emitida com sucesso');
            } catch (error) {
                console.error('[Omie] Erro ao processar:', error);
                // TODO: Retry logic ou Dead Letter Queue
            }
        });

        // Escuta evento de pedido cancelado
        eventBus.subscribe('order.cancelled', async (event) => {
            try {
                console.log('[Omie] Cancelando nota fiscal:', event.data.orderId);
                
                await this.client.cancelOrder(event.data.orderId);
                
                console.log('[Omie] Nota fiscal cancelada');
            } catch (error) {
                console.error('[Omie] Erro ao cancelar:', error);
            }
        });
    }
}

module.exports = new OmieSubscriber();
```

---

### 5. Subscriber Getnet (integration-service/src/getnet/GetnetSubscriber.js)

```javascript
const eventBus = require('../../../shared/eventBus');
const GetnetClient = require('./GetnetClient');

class GetnetSubscriber {
    constructor() {
        this.client = new GetnetClient();
        this.setupListeners();
    }

    setupListeners() {
        eventBus.subscribe('order.created', async (event) => {
            try {
                console.log('[Getnet] Gerando pagamento:', event.data.orderId);
                
                const payment = await this.client.createPayment(event.data);
                
                // Publica evento de volta
                eventBus.publish('payment.created', {
                    orderId: event.data.orderId,
                    paymentId: payment.id,
                    qrCode: payment.qrCode
                });
                
            } catch (error) {
                console.error('[Getnet] Erro ao gerar pagamento:', error);
            }
        });
    }
}

module.exports = new GetnetSubscriber();
```

---

## REGRAS DE OURO

### ✅ PODE:
- Service publicar eventos
- Service escutar eventos
- Múltiplos subscribers para o mesmo evento
- Subscriber publicar novo evento (cascata controlada)

### ❌ NÃO PODE:
- Loja importar código de integração diretamente
- Integração importar código da loja diretamente
- Eventos circulares (A → B → A)
- Lógica de negócio dentro de subscribers (só chamadas API)

---

## VANTAGENS DESSA ARQUITETURA

### 1. Independência
- Mudar loja não quebra Omie
- Mudar Omie não quebra loja
- Adicionar nova integração = criar novo subscriber

### 2. Testabilidade
```javascript
// Testar OrderController sem integrações
test('aprovar pedido publica evento', () => {
    const spy = jest.spyOn(eventBus, 'publish');
    controller.aprovarPedido(orderId);
    expect(spy).toHaveBeenCalledWith('order.approved', {...});
});
```

### 3. Escalabilidade
- Cada integração pode rodar em servidor diferente
- Fácil adicionar workers para processar eventos
- Load balancing automático

### 4. Resiliência
- Se Omie cair, loja continua funcionando
- Eventos ficam na fila (Redis)
- Retry automático

### 5. Rastreabilidade
- Cada evento logado
- Fácil debugar fluxo completo
- Histórico de eventos

---

## MIGRATION STRATEGY

### FASE 1: Criar Event Bus
- Implementar `eventBus.js`
- Testar publicar/subscrever

### FASE 2: Migrar Loja
- Manter código atual funcionando
- Adicionar publishers em paralelo
- Testar eventos sendo publicados

### FASE 3: Criar Subscribers
- OmieSubscriber escuta eventos
- Ainda mantém código antigo funcionando
- Validar que ambos funcionam

### FASE 4: Remover Código Antigo
- Quando subscribers estáveis
- Remover chamadas diretas
- Só eventos

---

## MONITORAMENTO

### Logs importantes:
```javascript
console.log('[EventBus] Published: order.approved', data);
console.log('[Omie] Processando pedido:', orderId);
console.log('[Omie] Nota fiscal emitida:', nfId);
console.log('[Getnet] Pagamento confirmado:', paymentId);
```

### Métricas para acompanhar:
- Eventos publicados/minuto
- Eventos processados/minuto
- Latência média de processamento
- Taxa de erro por integração
- Tamanho da fila de eventos

---

## PRÓXIMOS PASSOS

1. ✅ Estrutura de pastas criada
2. ✅ GitHub configurado
3. ⏳ VPS configurar
4. ⏳ Implementar Event Bus
5. ⏳ Migrar OrderController para eventos
6. ⏳ Criar OmieSubscriber
7. ⏳ Criar GetnetSubscriber
8. ⏳ Criar MelhorEnvioSubscriber
9. ⏳ Testar em staging
10. ⏳ Deploy produção

---

## REFERÊNCIAS

- Event-Driven Architecture: https://martinfowler.com/articles/201701-event-driven.html
- Microservices Patterns: https://microservices.io/patterns/data/event-driven-architecture.html
- Redis Pub/Sub: https://redis.io/topics/pubsub

---

**Documento criado em:** 03/11/2025  
**Versão:** 1.0  
**Autor:** Assistente AI + Caique Simiele

