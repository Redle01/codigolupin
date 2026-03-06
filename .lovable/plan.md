

# Ajustes finais no useQuiz.ts

O arquivo já tem as mudanças 1 e 2 aplicadas (`currentStep: "questions"` e `goBack` sem landing). Faltam apenas duas alterações:

## 1. Adicionar evento Lead do Meta Pixel no `submitEmail`
Após `console.log("Email submitted successfully")` (linha 139), disparar `window.fbq("track", "Lead", ...)`.

## 2. Guardar contra estado "landing" no localStorage
Na restauração do estado (linhas 44-48), verificar se `parsed.currentStep === "landing"` e corrigir para `"questions"` antes de retornar.

Ambas são edições pequenas e cirúrgicas no mesmo arquivo.

