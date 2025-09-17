# Configuração do Sentry - Monitoramento de Erros

## Visão Geral

O Sentry foi integrado ao sistema DEA PDI para monitoramento de erros e performance do frontend. Esta documentação detalha como configurar e usar o Sentry em diferentes ambientes.

## Configuração Inicial

### 1. Criar Conta no Sentry

1. Acesse [sentry.io](https://sentry.io) e crie uma conta
2. Crie um novo projeto para "React"
3. Copie o DSN fornecido (formato: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configurar Variáveis de Ambiente

#### Desenvolvimento Local
```env
# .env (opcional para desenvolvimento)
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

#### Staging
```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_ENV=staging
VITE_APP_VERSION=1.0.0
VITE_APP_BASE_URL=https://staging.seudominio.com
```

#### Produção
```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_BASE_URL=https://app.seudominio.com
```

### 3. Configurar no CI/CD (GitHub Secrets)

No seu repositório GitHub, vá em Settings > Secrets and variables > Actions e adicione:

- `SENTRY_DSN_STAGING`: DSN para ambiente de staging
- `SENTRY_DSN_PRODUCTION`: DSN para ambiente de produção

## Funcionalidades Implementadas

### 1. Captura Automática de Erros

- **Erros JavaScript não tratados**: Capturados automaticamente
- **Promise rejections**: Capturadas automaticamente
- **Erros de componentes React**: Via ErrorBoundary integrado
- **Erros de autenticação**: Capturados no AuthContext

### 2. Contexto de Usuário

Quando um usuário faz login, suas informações são automaticamente associadas aos erros:
- ID do usuário
- Email
- Nome
- Role (admin, gestor, colaborador, rh)

### 3. Filtragem Inteligente

Erros filtrados automaticamente:
- Erros de HMR/hot reload em desenvolvimento
- Erros de rede temporários
- Logs de console desnecessários

### 4. Performance Monitoring

- **Tracing**: 100% em dev/staging, 10% em produção
- **Core Web Vitals**: Monitoramento automático
- **Navegação**: Tracking de mudanças de rota

## Como Usar

### Captura Manual de Erros

```typescript
import { captureError, captureMessage } from '../lib/sentry';

// Capturar erro com contexto
try {
  // código que pode falhar
} catch (error) {
  captureError(error as Error, {
    context: 'user_action',
    userId: user.id,
    action: 'create_pdi_objective'
  });
}

// Capturar mensagem informativa
captureMessage('Operação importante realizada', 'info', {
  userId: user.id,
  operation: 'bulk_update'
});
```

### Hook para Componentes

```typescript
import { useSentryErrorHandler } from '../lib/sentry';

const MyComponent = () => {
  const { captureComponentError } = useSentryErrorHandler();
  
  const handleError = (error: Error) => {
    captureComponentError(error, { component: 'MyComponent' });
  };
};
```

## Monitoramento e Alertas

### Dashboard do Sentry

Acesse o dashboard do Sentry para:
- Visualizar erros em tempo real
- Analisar trends de erros
- Configurar alertas por email/Slack
- Revisar performance metrics

### Alertas Recomendados

Configure alertas para:
- **Novos erros**: Quando um erro nunca visto antes ocorre
- **Picos de erro**: Quando a taxa de erro aumenta significativamente
- **Erros críticos**: Erros que afetam funcionalidades principais
- **Performance**: Quando métricas de performance degradam

### Integração com Slack/Email

1. No Sentry, vá em Settings > Integrations
2. Configure Slack ou Email notifications
3. Defina regras de alerta baseadas em:
   - Frequência de erros
   - Severidade
   - Ambiente (staging vs produção)

## Testes da Integração

### Teste Manual

Para testar se o Sentry está funcionando:

```typescript
// Adicione temporariamente em qualquer componente
const testSentry = () => {
  throw new Error('Teste do Sentry - pode ignorar este erro');
};

// Ou teste captura de mensagem
import { captureMessage } from '../lib/sentry';
captureMessage('Teste de integração do Sentry', 'info');
```

### Verificação no Dashboard

1. Execute o teste acima
2. Acesse o dashboard do Sentry
3. Verifique se o erro/mensagem aparece em "Issues"
4. Confirme que o contexto do usuário está presente

## Troubleshooting

### Sentry não está capturando erros

1. **Verificar DSN**: Confirme que `VITE_SENTRY_DSN` está configurado
2. **Verificar ambiente**: Em desenvolvimento, o DSN é opcional
3. **Verificar console**: Procure por mensagens de inicialização do Sentry
4. **Verificar filtros**: Alguns erros podem estar sendo filtrados

### Performance Impact

O Sentry tem impacto mínimo na performance:
- **Bundle size**: ~50KB gzipped
- **Runtime overhead**: <1ms por erro capturado
- **Network**: Apenas quando erros ocorrem

### Privacidade e LGPD

O Sentry está configurado para:
- **Não capturar dados sensíveis** automaticamente
- **Filtrar informações pessoais** dos breadcrumbs
- **Permitir controle** sobre quais dados são enviados

Para compliance total com LGPD:
- Configure data scrubbing no dashboard do Sentry
- Implemente consentimento do usuário se necessário
- Configure retenção de dados apropriada

## Próximos Passos

1. **Configurar projeto no Sentry**
2. **Adicionar DSN às variáveis de ambiente**
3. **Testar integração em desenvolvimento**
4. **Configurar alertas básicos**
5. **Integrar ao pipeline de CI/CD**

## Custos

- **Plano gratuito**: 5.000 erros/mês
- **Plano pago**: A partir de $26/mês para mais volume
- **Recomendação**: Começar com plano gratuito e monitorar uso