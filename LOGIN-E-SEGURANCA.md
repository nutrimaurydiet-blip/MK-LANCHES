# Login administrativo

O painel usa login por servidor e cookie HttpOnly. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET` como variáveis privadas do Netlify. A senha não é gravada no código; o backend verifica o hash com scrypt e comparação em tempo constante.

`ADMIN_PASSWORD_HASH` deve usar o formato `scrypt$<salt-base64>$<hash-base64>`, com salt aleatório de 16 bytes e hash de 64 bytes. O guia [README-PUBLICACAO.md](./README-PUBLICACAO.md) mostra como gerar o valor localmente. Como a versão anterior guardava um hash rápido e fixo no código, defina uma senha nova e forte antes de publicar esta versão.

No primeiro login após configurar o hash, o painel exige uma troca imediata antes de liberar o dashboard. A senha provisória é verificada pelo hash de ambiente; a senha nova é armazenada somente como hash scrypt no Netlify Blobs (`mk-lanches-auth`). Depois da troca, a senha de ambiente deixa de ser a credencial ativa. O novo registro gera uma versão de sessão diferente e invalida as sessões anteriores.

`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET` devem estar disponíveis para as Functions em Production, e um novo deploy é necessário depois de criá-las ou alterá-las. O hash salvo pelo fluxo de troca não deve ser copiado para o código ou para o repositório.

As alterações de produtos/categorias/dados da loja são gravadas no Netlify Blobs, portanto não dependem de localStorage e podem aparecer para clientes em outros aparelhos.

O projeto é independente do NEXXORA.
