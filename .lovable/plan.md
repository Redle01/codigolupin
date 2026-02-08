
# Prova Social com Avatares Sobrepostos

## Resumo

Substituir o icone `Users` por 4 fotos de perfil masculinas em formato de avatar circular sobrepostos, seguindo o layout da imagem de referencia (avatares sobrepostos + texto ao lado). O texto atual sera mantido integralmente.

---

## Arquivos

| Arquivo | Acao |
|---------|------|
| `public/images/avatar-1.webp` | Copiar foto `download_2.webp` |
| `public/images/avatar-2.webp` | Copiar foto `download_3.webp` |
| `public/images/avatar-3.webp` | Copiar foto `download_1.webp` |
| `public/images/avatar-4.webp` | Copiar foto `download_1.jpg` |
| `src/components/quiz/QuizLanding.tsx` | Substituir bloco social proof (linhas 70-84) |

---

## Detalhes Tecnicos

### 1. Copiar imagens para `public/images/`

As 4 fotos serao copiadas como `avatar-1.webp` a `avatar-4.webp`. Formato webp mantido para performance (3 ja sao webp, 1 jpg sera copiado como esta).

### 2. Novo bloco de prova social (QuizLanding.tsx)

Substituir o bloco atual (icone Users + texto) por:

```tsx
{/* Social proof */}
<m.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.7, duration: 0.5 }}
  className="flex items-center justify-center gap-3 mt-5 md:mt-6"
>
  {/* Avatares sobrepostos */}
  <div className="flex -space-x-3">
    <img src="/images/avatar-1.webp" alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background object-cover object-top" loading="lazy" />
    <img src="/images/avatar-2.webp" alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background object-cover object-top" loading="lazy" />
    <img src="/images/avatar-3.webp" alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background object-cover object-top" loading="lazy" />
    <img src="/images/avatar-4.jpg" alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background object-cover object-top" loading="lazy" />
  </div>
  {/* Texto (mantido identico) */}
  <span className="text-xs md:text-sm text-muted-foreground">
    <span className="text-primary font-semibold">
      {totalParticipants.toLocaleString("pt-BR")}
    </span>{" "}
    homens ja descobriram seu bloqueio
  </span>
</m.div>
```

Caracteristicas:
- **`-space-x-3`**: sobreposicao entre avatares (mesmo padrao da referencia)
- **`border-2 border-background`**: borda escura separando visualmente os circulos
- **`object-cover object-top`**: recorte centralizado no rosto
- **`loading="lazy"`**: carregamento adiado (abaixo do fold em mobile)
- **`alt=""`**: decorativo, sem texto alternativo necessario
- Import do icone `Users` sera removido

### 3. O que NAO muda

- Texto da prova social (mantido identico)
- Animacao framer-motion (mesma config de delay/duration)
- Posicionamento relativo ao mini texto
- Nenhum outro componente afetado
