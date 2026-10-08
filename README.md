# MK Lanches — projeto separado

Projeto independente do NEXXORA.

## Estrutura
- `public/` — site público de pedidos.
- `admin/` — painel administrativo separado.
- `api/` — base para API/banco de produção.
- `public/assets/` — logo e fotos extraídas do PDF enviado para esta conversa.

## Importante
A prévia visual já usa a identidade e imagens do material fornecido. Os produtos/prices mostrados são somente os dados que puderam ser lidos com segurança do PDF e do material da conversa; itens incompletos devem ser confirmados antes da publicação comercial.

Para executar a prévia com a API e as Netlify Functions (incluindo `/api/store`), instale as dependências e use o Netlify Dev:

```powershell
npm install
npm run dev
```

Abra `http://localhost:4173/`. Não use um servidor HTTP estático (`python -m http.server`) para testar o catálogo: ele não executa os redirects nem a função de armazenamento, então `/api/store` retorna 404. Em produção, publique o projeto no Netlify com `netlify.toml` e as variáveis administrativas configuradas; a leitura do catálogo usa Netlify Blobs, não Supabase.

WhatsApp configurado na prévia: +55 69 98449-6963.
