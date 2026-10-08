# MK Lanches — publicação final corrigida

Projeto **totalmente separado do NEXXORA**.

## Estrutura
- `/` — site público de pedidos
- `/admin/` — painel administrativo
- `netlify/functions/` — API segura do painel, upload de imagens e pedidos
- `public/` — único diretório publicado pelo Netlify

## O que foi corrigido nesta versão
- Upload de fotos de produtos e logo usando Netlify Blobs.
- Salvamento real no servidor; o painel não usa `localStorage` como banco.
- Validação de produtos, preços, promoções, categorias e dados da loja no servidor.
- Login administrativo por cookie `HttpOnly`, `Secure` e `SameSite=Lax`.
- Sessão assinada com `ADMIN_SESSION_SECRET`.
- Senha administrativa verificada com scrypt e credenciais mantidas em variáveis privadas.
- Código das Netlify Functions fica fora do diretório público.
- Proteções básicas de segurança e `no-store` no painel/API.
- Carrinho remove produtos que ficaram inativos/removidos.
- Preços de adicionais do carrinho são conferidos novamente com o catálogo atual.
- Escape dos valores dinâmicos inseridos em HTML e validação de URLs de imagem e cores.
- Estrutura pronta para `/admin/` funcionar em produção.

## Configuração obrigatória no Netlify
No site novo, abra **Project configuration → Environment variables** e configure:

- `ADMIN_EMAIL`: e-mail usado para entrar no painel.
- `ADMIN_PASSWORD_HASH`: hash scrypt da nova senha administrativa, no formato `scrypt$<salt-base64>$<hash-base64>`.
- `ADMIN_SESSION_SECRET`: chave aleatória com pelo menos 32 caracteres.

Gere o hash localmente com Node.js em um terminal interativo; o prompt não exibe a senha. Use uma senha forte de pelo menos 12 caracteres ASCII imprimíveis. Guarde somente a linha `ADMIN_PASSWORD_HASH=...` no ambiente privado do Netlify:

```powershell
node scripts/generate-admin-password-hash.js
```

Trate a credencial anterior como comprometida e escolha uma senha nova. Não coloque a senha, o hash ou a chave de sessão no frontend, no ZIP público ou no GitHub. Faça um novo deploy após configurar as três variáveis.


## Importante antes de apagar o site antigo
Não apague o site antigo antes de validar o novo. O catálogo salvo no Netlify Blobs é vinculado ao armazenamento do projeto; um novo site começa com o catálogo inicial desta versão. Se houver alterações importantes no site antigo que precisam ser preservadas, elas devem ser exportadas/migradas antes da exclusão.

## Checklist de publicação
1. Suba este ZIP em um novo site Netlify.
2. Não altere a estrutura interna do ZIP.
3. Confirme que o Netlify está usando o `netlify.toml` incluído.
4. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET`.
5. Faça um novo deploy após configurar as variáveis.
6. Abra `/admin/` e teste o login.
7. Teste alterar nome, preço, promoção, descrição, ingredientes, adicionais, categoria, ativo/inativo e foto.
8. Recarregue o painel e confirme que as alterações continuam salvas.
9. Abra o site público em outro navegador/dispositivo e confirme as alterações.
10. Faça pedidos de retirada e delivery, com Pix, cartão e dinheiro/troco.
11. Só depois da aprovação final, encerre o site antigo.

## WhatsApp
Os pedidos usam WhatsApp Click-to-Chat para o número `5569984496963`. Não é necessário token da Meta para esse fluxo.
