
# Plano: Fonte Archivo Exclusiva - Remoção de system-ui, sans-serif

## Resumo Executivo

Este plano remove completamente `system-ui, sans-serif` do stack de fontes, deixando exclusivamente **Archivo** como fonte principal em todo o funil. A mudança é simples e afeta apenas 2 arquivos.

---

## Análise do Estado Atual

### Ocorrências Identificadas

| Arquivo | Linha | Valor Atual |
|---------|-------|-------------|
| `index.html` | 17 | `font-family: 'Archivo', system-ui, sans-serif;` |
| `src/index.css` | 107 | `font-family: 'Archivo', system-ui, sans-serif;` |

**Total: 2 ocorrências a modificar**

---

## Arquivos a Modificar

### 1. `index.html` (Critical CSS - linha 17)

```html
<!-- Antes -->
font-family: 'Archivo', system-ui, sans-serif;

<!-- Depois -->
font-family: 'Archivo';
```

### 2. `src/index.css` (linha 107)

```css
/* Antes */
font-family: 'Archivo', system-ui, sans-serif;

/* Depois */
font-family: 'Archivo';
```

---

## Impacto da Mudança

### Elementos Afetados (Todos usam Archivo):

| Categoria | Comportamento |
|-----------|---------------|
| Headings | Herdam do body → Archivo |
| Textos | Herdam do body → Archivo |
| Botões | Herdam do body → Archivo |
| Perguntas do quiz | Herdam do body → Archivo |
| Labels | Herdam do body → Archivo |
| Mensagens auxiliares | Herdam do body → Archivo |
| Inputs | Herdam do body → Archivo |

**Nota:** A classe `.font-serif-display` continua usando `'Playfair Display', Georgia, serif` para títulos estilizados - isso é intencional e não será alterado.

---

## Fallback Seguro

Sem `system-ui, sans-serif`:
- Se Archivo não carregar, o navegador usará sua fonte padrão
- A fonte está carregada via Google Fonts com **preload não-bloqueante**
- O Google Fonts fornece múltiplos pesos (400, 500, 600, 700) que servem como fallback interno da família

### Carregamento da Fonte (já configurado):
```html
<link 
  rel="preload" 
  as="style" 
  href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700..."
/>
```

---

## Garantias

- Zero alteração em layout
- Zero alteração em espaçamentos
- Zero alteração em responsividade  
- Zero alteração em hierarquia visual
- Zero alteração em performance (mesma fonte, apenas stack menor)
- Zero alteração em tracking/integrações
- Consistência tipográfica desktop/mobile mantida

---

## Resultado Esperado

Após a alteração:
- **Arquivo fonte exclusiva**: Archivo
- **Sem fallbacks genéricos**: Removido system-ui, sans-serif
- **Hierarquia preservada**: Archivo (corpo) + Playfair Display (títulos decorativos)
- **Todos os elementos** renderizando com Archivo (exceto `.font-serif-display`)
