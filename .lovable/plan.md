

## Plan: Increase font sizes for mobile legibility

Four files, font-size classes only.

### 1. `src/components/quiz/QuizQuestion.tsx`
- Question heading: `text-xl md:text-3xl` → `text-2xl md:text-3xl`
- Option button text: `text-sm md:text-base` → `text-base md:text-base`
- Option letter circle: `text-sm md:text-sm` → `text-sm md:text-sm` (keep)
- Back button: `text-sm md:text-sm` → keep
- Time estimate: `text-xs md:text-xs` → keep

### 2. `src/components/quiz/EmailCapture.tsx`
- Title h2: `text-2xl md:text-3xl` → keep (already meets min)
- Description p: `text-base md:text-base` → keep (already meets min)
- Input placeholder: `text-sm md:text-base` → `text-base md:text-base`
- Error text: `text-xs md:text-sm` → `text-sm md:text-sm`
- CTA button: `text-base md:text-lg` → keep (already meets min)
- Privacy note: `text-xs md:text-xs` → keep

### 3. `src/components/quiz/QuizResult.tsx`
- Main title h1: `text-2xl md:text-4xl lg:text-5xl` → `text-3xl md:text-4xl lg:text-5xl`
- Percentage subtitle: `text-sm md:text-sm` → `text-base md:text-base`
- Section headings (Resultado, Potencial, Próximo Passo): `text-lg md:text-xl` → keep
- Section body text: `text-sm md:text-base` → `text-base md:text-base`
- Pricing label: `text-sm md:text-base` → `text-base md:text-base`
- Pricing installments: `text-xs md:text-sm` → `text-sm md:text-sm`
- Bonus list items: `text-sm md:text-base` → `text-base md:text-base`
- CTA button: `text-xs sm:text-sm md:text-lg` → `text-sm sm:text-base md:text-lg`
- Privacy note: `text-xs md:text-xs` → keep

### 4. `src/components/quiz/QuizLoading.tsx`
- Loading step text: `text-xl` → keep (already meets min)

No other changes needed in QuizLoading — it already uses `text-xl`.

