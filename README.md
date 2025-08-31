# Obsidian-Minimal

Um aplicativo de notas minimalista inspirado no Obsidian, construído com HTML, CSS e JavaScript puro. Ideal para quem busca uma solução leve e simples para gerenciar conhecimento pessoal.

## Funcionalidades

- **Interface minimalista**: Design limpo e focado para uma experiência sem distrações.
- **Suporte a Markdown básico**: Formatação para negrito, itálico e títulos.
- **Busca de notas**: Pesquise notas por título ou conteúdo.
- **Armazenamento local**: Notas salvas diretamente no navegador via localStorage.
- **Auto-salvamento**: Salvamento automático a cada 30 segundos.

## Como Usar

1. Baixe ou clone o repositório:
   ```
   git clone https://github.com/LuizPaulo1002/Obsidian-Minimal.git
   ```
2. Abra o arquivo `index.html` em um navegador.
3. Comece a criar e gerenciar suas notas.

### Teclas de Atalho

- `Ctrl + N`: Criar nova nota
- `Ctrl + S`: Salvar nota manualmente
- Clique direito: Deletar nota

### Criando Links Entre Notas

Use a sintaxe `[[Nome da Nota]]` para criar links internos. Se a nota referenciada não existir, ela será criada automaticamente ao clicar no link.

### Formatação Markdown

- **Negrito**: `**texto**`
- **Itálico**: `*texto*`
- **Títulos**: `# Título`, `## Subtítulo`, `### Sub-subtítulo`

### Busca

Utilize o campo de busca na barra lateral para localizar notas por título ou conteúdo.

### Armazenamento

- **Localização**: As notas são salvas no `localStorage` do navegador (Navegador > Configurações > Cookies e dados do site).
- **Limite**: Aproximadamente 5-10 MB, dependendo do navegador.
- **Backup**: Exporte manualmente copiando o conteúdo das notas.

## Próximas Funcionalidades

- Exportação e importação de notas (JSON, Markdown)
- Suporte a temas (claro/escuro)
- Sistema de tags
- Marcação de notas como favoritas
- Gráfico de conexões entre notas
- Sincronização em nuvem

## Contribuindo

1. Faça um fork do projeto.
2. Crie uma branch para sua feature:
   ```
   git checkout -b feature/MinhaFeature
   ```
3. Commit suas mudanças:
   ```
   git commit -m 'Adiciona MinhaFeature'
   ```
4. Faça push para a branch:
   ```
   git push origin feature/MinhaFeature
   ```
5. Abra um Pull Request no GitHub.

## Suporte

- **Issues**: Use a seção de Issues do GitHub para reportar problemas.
- **Sugestões**: Crie uma issue com a tag `enhancement`.
- **Bugs**: Forneça detalhes e passos para reproduzir o problema.

## Agradecimentos

Inspirado no [Obsidian](https://obsidian.md), uma ferramenta poderosa para organização de conhecimento.