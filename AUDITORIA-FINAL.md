# Auditoria final — MK Lanches

## Correções de segurança
- Removidos o e-mail, salt fixo e hash SHA-256 rápido do código.
- Login agora exige `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (scrypt) e `ADMIN_SESSION_SECRET` configurados no ambiente privado.
- Valores dinâmicos de catálogo são escapados nos templates HTML do site e painel.
- URLs de imagem e cores são validadas no servidor; número do WhatsApp é normalizado antes de ser usado em links.

## Verificações executadas após as correções
- `node --check` passou nos arquivos JavaScript do projeto.
- Login com senha correta e incorreta, token assinado, cookie e rejeição de token inválido foram testados com credenciais temporárias.
- PUT do catálogo aceitou texto que contém caracteres HTML, normalizou o WhatsApp e rejeitou URL de imagem e cor inválidas em armazenamento simulado.
- `npm run dev` com Netlify Dev retornou HTTP 200 em `/api/store`, com 4 categorias, 16 produtos e o preço esperado do X-Bacon; a página pública foi verificada sem o aviso de fallback.

## Causa do aviso no desenvolvimento local
O aviso aparecia porque a prévia anterior usava um servidor HTTP estático: `/api/store` retornava 404 e não executava os redirects/funções. Ao trocar para Netlify Dev, a função era executada, mas o Lambda compatibility não inicializava automaticamente o contexto do Netlify Blobs e retornava HTTP 500 (`MissingBlobsEnvironmentError`). As funções que usam Blobs agora chamam `connectLambda(event)` antes de abrir o store.

## Configuração obrigatória antes da publicação
Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET` no Netlify. O hash SHA-256 antigo não é mais aceito; gere um hash scrypt para uma senha nova com `node scripts/generate-admin-password-hash.js`. Sem as variáveis novas, o login não funcionará.

O endereço Netlify previamente documentado respondeu HTTP 404 tanto na página inicial quanto nas rotas da função durante esta verificação. Portanto, o deploy de produção não está acessível nesse endereço e não foi possível testar Blobs real ou confirmar a correção na hospedagem. Publique um novo deploy para validar em produção; não é necessária configuração Supabase para o catálogo.
