# Login administrativo

O painel usa login por servidor e cookie HttpOnly. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET` como variáveis privadas do Netlify. A senha não é gravada no código; o backend verifica o hash com scrypt e comparação em tempo constante.

`ADMIN_PASSWORD_HASH` deve usar o formato `scrypt$<salt-base64>$<hash-base64>`, com salt aleatório de 16 bytes e hash de 64 bytes. O guia [README-PUBLICACAO.md](./README-PUBLICACAO.md) mostra como gerar o valor localmente. Como a versão anterior guardava um hash rápido e fixo no código, defina uma senha nova e forte antes de publicar esta versão.

As alterações de produtos/categorias/dados da loja são gravadas no Netlify Blobs, portanto não dependem de localStorage e podem aparecer para clientes em outros aparelhos.

O projeto é independente do NEXXORA.
