

# Substituir avatar-4 por nova imagem WebP

## Alteracao

| Arquivo | Acao |
|---------|------|
| `public/images/avatar-4.jpg` | Substituir pelo arquivo `download_1_1.webp` e renomear para `avatar-4.webp` |
| `src/components/quiz/QuizLanding.tsx` | Atualizar referencia de `avatar-4.jpg` para `avatar-4.webp` |

## Detalhes

1. Copiar `user-uploads://download_1_1.webp` para `public/images/avatar-4.webp`
2. Na linha 79 do QuizLanding, trocar `src="/images/avatar-4.jpg"` por `src="/images/avatar-4.webp"`
3. Todas as classes CSS permanecem identicas (`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background object-cover object-top`)

