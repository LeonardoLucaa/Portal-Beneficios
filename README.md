# Portal Benefícios: solicitação de bolsa de estudos

Protótipo funcional de um portal em que o aluno acompanha e completa a solicitação de uma bolsa de estudos. O projeto parte do design que criei no Figma, e esta versão implementa o fluxo principal em HTML, CSS e JavaScript puros.

**Design completo (Figma/Behance):** Não incluí devido aos dados pessoais dos alunos.

> Todos os dados são fictícios. O arquivo enviado nos documentos não sai do navegador.

## O que o protótipo faz

- **Login** por usuário e código de acesso (validação simples, sem servidor).
- **Ficha da bolsa** dividida em cards: dados do beneficiário, grupo familiar e renda, moradia, despesas, bens, declaração e observações.
- **Ciclo de correção:** cards e documentos com pendência ficam marcados em vermelho. Ao corrigir um item, a marcação some e o contador de pendências diminui.
- **Etapas do processo:** a barra de progresso muda sozinha e, sem pendências, mostra "Bolsa validada" com o botão **Imprimir ficha**.
- **Documentos** com estados (verificado, correção necessária, enviado e pendente) e envio de PDF.
- **Dados salvos no navegador** (`localStorage`), com botão para restaurar o exemplo.

## O que este projeto pratica

- DOM e eventos em JavaScript puro, com delegação de eventos.
- Estado da aplicação centralizado e renderização a partir dele.
- Janelas de edição com o elemento `<dialog>`, formulários e validação nativa do HTML.
- CSS responsivo com Grid e Flexbox, foco visível e contraste dos botões revisado.
- Proteção contra injeção de HTML nos valores digitados.

## Como rodar

Abra o `index.html` no navegador. Não precisa instalar nada.

## Simplificações e próximos passos

- Não há back-end: o login e o envio de arquivos são simulados.
- Telas do design ainda fora do protótipo: início com as 8 etapas, anexos com busca, feedback e a visão do setor de Benefícios.
- A marca da instituição foi removida para uso em portfólio.
