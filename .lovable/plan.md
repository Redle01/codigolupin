
# Melhorar experiencia de selecao de datas no painel administrativo

## Resumo

Reescrever o componente `DateRangePicker` com atalhos expandidos, layout profissional com sidebar de presets dentro do popover, melhor contraste visual e responsividade mobile.

## Arquivo: `src/components/admin/DateRangePicker.tsx`

### 1. Expandir presets de periodo

Substituir os 4 presets atuais (7, 14, 30, 60 dias) por atalhos mais uteis:

- Hoje
- Ontem
- Ultimos 7 dias
- Ultimos 15 dias
- Ultimos 30 dias
- Este mes
- Mes passado

Cada preset calcula `startDate` e `endDate` automaticamente usando funcoes do `date-fns` (`startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `subMonths`, `subDays`).

### 2. Layout do popover com sidebar de presets

Reestruturar o conteudo do popover para ter:

- **Desktop**: layout horizontal com sidebar de presets a esquerda e calendario a direita, lado a lado
- **Mobile**: layout vertical com calendario em cima e presets embaixo em grid compacto

Isso elimina os botoes de preset externos (que ficavam escondidos no mobile) e centraliza tudo dentro do popover.

### 3. Destaque visual do periodo selecionado

- Aplicar classe ativa (`bg-primary text-primary-foreground`) no preset que corresponde ao periodo atualmente selecionado
- Manter o destaque visual do range no calendario (ja funciona nativamente com `mode="range"`)

### 4. Melhorar contraste e legibilidade

- Aumentar fonte do trigger para mostrar datas com mais clareza
- Usar `pointer-events-auto` no calendario (conforme diretriz shadcn)

### 5. Aplicacao imediata

- Presets aplicam filtro imediatamente e fecham o popover
- Selecao manual no calendario fecha o popover automaticamente ao selecionar ambas as datas (comportamento ja existente, mantido)

### 6. Remover botoes de preset externos

Os presets que ficavam fora do popover (`hidden sm:flex`) serao removidos. Tudo fica dentro do popover para consistencia desktop/mobile.

## Detalhes tecnicos

### Imports adicionais de `date-fns`

```
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, subDays, isSameDay } from "date-fns"
```

### Estrutura dos presets

```typescript
const presets = [
  { label: "Hoje", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Ontem", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "Ultimos 7 dias", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Ultimos 15 dias", getValue: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
  { label: "Ultimos 30 dias", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Este mes", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Mes passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
]
```

### Funcao de matching para highlight do preset ativo

Comparar `startDate` e `endDate` atuais com o resultado de cada `getValue()` usando `isSameDay` para determinar qual preset esta selecionado.

### Layout do PopoverContent

```text
+----------------------------------+
|  Desktop:                        |
|  +----------+------------------+ |
|  | Hoje     |   Calendario     | |
|  | Ontem    |   (range mode)   | |
|  | 7 dias   |                  | |
|  | 15 dias  |                  | |
|  | 30 dias  |                  | |
|  | Este mes |                  | |
|  | Mes pass.|                  | |
|  +----------+------------------+ |
+----------------------------------+

+------------------+
|  Mobile:         |
|  +-------------+ |
|  |  Calendario | |
|  +-------------+ |
|  | Hoje|Ontem  | |
|  | 7d | 15d    | |
|  | 30d|Este mes| |
|  | Mes passado | |
|  +-------------+ |
+------------------+
```

### Nenhuma alteracao em outros arquivos

O componente `Admin.tsx` ja consome `DateRangePicker` com a mesma interface (`startDate`, `endDate`, `onDateChange`). A interface do componente nao muda.
