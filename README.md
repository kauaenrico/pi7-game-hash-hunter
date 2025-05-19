# PI2025-game

# Imagens do Jogo Hash Hunter

Este diretório contém as imagens utilizadas no jogo Hash Hunter. Para adicionar suas próprias imagens, siga as instruções abaixo:

## Arquivos Necessários

Você precisa criar os seguintes arquivos PNG:

1. `player.png` (32x32 pixels)
   - Imagem do jogador
   - Recomendado: Um ícone de escudo ou personagem que represente segurança

2. `virus.png` (32x32 pixels)
   - Imagem do vírus
   - Recomendado: Um ícone de vírus ou ameaça cibernética

3. `hash.png` (24x24 pixels)
   - Imagem do hash
   - Recomendado: Um ícone de cadeado ou símbolo de hash (#)

4. `core.png` (32x32 pixels)
   - Imagem do endpoint/core
   - Recomendado: Um ícone de servidor ou núcleo de sistema

## Especificações Técnicas

- Formato: PNG com transparência
- Tamanhos:
  - player.png: 32x32 pixels
  - virus.png: 32x32 pixels
  - hash.png: 24x24 pixels
  - core.png: 32x32 pixels
- Profundidade de cor: 32 bits (RGBA)
- Otimização: Recomendado otimizar as imagens para web

## Fallback

Se as imagens não forem carregadas, o jogo usará formas geométricas como fallback:
- Jogador: Círculo azul
- Vírus: Círculo vermelho
- Hash: Quadrado amarelo
- Endpoint: Círculo verde

## Como Testar

1. Adicione suas imagens neste diretório
2. Certifique-se de que os nomes dos arquivos correspondem exatamente aos especificados
3. Verifique se as dimensões estão corretas
4. Inicie o jogo e verifique se as imagens são carregadas corretamente

## Dicas de Design

- Use cores que contrastem bem com o fundo do labirinto
- Mantenha o estilo visual consistente entre todas as imagens
- Considere adicionar um leve efeito de brilho ou sombra para melhor visibilidade
- Teste as imagens em diferentes tamanhos de tela para garantir boa visibilidade 