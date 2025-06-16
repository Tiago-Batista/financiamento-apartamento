# Financiamento Apartamento

Aplicativo para gerenciar o financiamento de um apartamento, incluindo entradas, evolução da obra e parcelas do financiamento.

## Descrição

Este projeto é uma aplicação web moderna construída com React e TypeScript para ajudar no acompanhamento financeiro da compra de um imóvel. Ele permite:

- Registrar e configurar valores globais do financiamento (valor do imóvel, subsídios, FGTS, etc.).
- Detalhar pagamentos de entrada (F/Entrada).
- Acompanhar pagamentos da evolução da obra.
- Gerenciar parcelas do financiamento bancário (Caixa).
- Anexar comprovantes para cada transação (cadastro individual).
- Visualizar resumos e históricos de pagamentos.
- Gerar relatórios para impressão.

## Funcionalidades Principais

- **Dashboard Geral:** Visão consolidada do financiamento e configurações globais.
- **F/Entrada:** Controle de pagamentos da entrada do imóvel, com cadastro individual e em lote (sem comprovantes para lote).
- **Evolução da Obra:** Registro de pagamentos da fase de construção, com cadastro individual e em lote (sem comprovantes para lote).
- **Financiamento Caixa:** Gerenciamento de parcelas do financiamento, com cadastro individual e em lote (sem comprovantes para lote).
- **Anexo de Comprovantes:** Suporte para arquivos PDF e PNG como comprovantes para entradas individuais.
- **Relatórios Imprimíveis:** Cada seção principal possui uma opção para imprimir um relatório detalhado.
- **Compartilhamento via WhatsApp:** Resumos mensais de pagamentos podem ser compartilhados.
- **Persistência Local:** Os dados são salvos no LocalStorage do navegador.
- **Responsividade:** Interface adaptada para desktops, tablets e dispositivos móveis.

## Tecnologias Utilizadas

- **React:** Biblioteca JavaScript para construção de interfaces de usuário.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **React Router:** Para navegação declarativa no lado do cliente.
- **Tailwind CSS:** Framework CSS utility-first para estilização rápida.
- **ES Modules (esm.sh):** Para importação de dependências diretamente no navegador.
- **html2canvas, jsPDF:** Para geração de relatórios em PDF.

## Configuração e Execução

1.  **Clone o repositório (se aplicável) ou baixe os arquivos.**
2.  **Abra o `index.html` em um navegador moderno.**
    *   Não são necessárias chaves de API externas para a funcionalidade principal, pois as integrações com serviços Google (Drive, Gemini) foram removidas.

## Estrutura do Projeto (Simplificada)

-   `index.html`: Ponto de entrada da aplicação.
-   `index.tsx`: Script principal que renderiza o aplicativo React.
-   `App.tsx`: Componente raiz com as rotas da aplicação.
-   `metadata.json`: Metadados da aplicação.
-   `types.ts`: Definições de tipos TypeScript.
-   `components/`: Contém os componentes React.
    -   `ui/`: Componentes de UI genéricos (Botão, Card, Input, etc.).
    -   `layout/`: Componentes de layout (Layout principal com navegação).
    -   Outros componentes de tela (HomeScreen, DashboardScreen, etc.).
-   `contexts/`: Contém os contextos React (AppContext).
-   `utils/`: Funções utilitárias (generatePdf).
-   `config.ts`: Pode ser usado para configurações futuras da aplicação.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto é para fins de demonstração e aprendizado. Verifique as licenças das dependências utilizadas.