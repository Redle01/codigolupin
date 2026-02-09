
# Alterar cor do botao da pagina de captura de email

## Resumo

Trocar o gradiente do botao "DESCOBRIR MEU PERFIL AGORA" na pagina de captura de email (`EmailCapture.tsx`) de dourado/vermelho para verde, igualando aos CTAs das paginas de resultado.

## Arquivo: `src/components/quiz/EmailCapture.tsx`

### Linha 113 - Classe do botao

Trocar:
```
bg-gradient-gold text-primary-foreground ... shadow-gold-lg hover:shadow-gold
```

Por:
```
bg-gradient-green text-primary-foreground ... shadow-green-lg hover:shadow-green
```

As classes `.bg-gradient-green`, `.shadow-green-lg` e `.shadow-green` ja existem no `src/index.css`.

Nenhuma outra alteracao necessaria.
