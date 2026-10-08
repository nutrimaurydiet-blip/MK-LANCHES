# Conexão API — MK Lanches

## WhatsApp dos pedidos
Número configurado: +55 69 98449-6963 (`5569984496963`).

O pedido usa **WhatsApp Click-to-Chat** (`wa.me`). Isso é diferente da WhatsApp Cloud API: o cliente abre o próprio WhatsApp e envia a mensagem para a MK Lanches. Para o fluxo de pedidos, não é necessário token da Meta.

Existe também a função `/.netlify/functions/order`, exposta como `/api/order`, que recebe a mensagem e devolve a URL do WhatsApp. Se a função estiver indisponível, o site faz fallback direto para `wa.me`.

## Para WhatsApp Cloud API
Só é necessária se você quiser que o sistema envie mensagens automaticamente pela conta da empresa (por exemplo, confirmação automática, mudança de status, mensagens de entrega). Nesse caso serão necessários, configurados como variáveis privadas no servidor:
- Meta Business/WhatsApp Business Platform;
- Phone Number ID;
- Access Token;
- Verify Token/webhook, quando aplicável.

Não envie esses tokens no chat e não os coloque no frontend.

## Catálogo e armazenamento do painel
O catálogo e as imagens usam Netlify Blobs nas funções `store`, `upload-image` e `image`; não dependem de Supabase nem das variáveis `SUPABASE_URL`/`SUPABASE_ANON_KEY`. A função de catálogo retorna JSON diretamente no formato `{ company, categories, products }`, lido pelo site em `/api/store`.

As funções CommonJS usam o modo Lambda compatibility do Netlify. Elas inicializam o contexto Blobs de cada evento com `connectLambda(event)` antes de acessar o armazenamento. Isso também é necessário em `netlify dev`, que fornece o armazenamento local isolado. Para produção, publique pelo Netlify com o diretório de funções definido em `netlify.toml`.

O arquivo `supabase/schema.sql` é apenas um schema inicial para uma integração Supabase futura; não faz parte do caminho ativo de leitura/salvamento do catálogo.
