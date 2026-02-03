-- Adicionar coluna offer_flow para identificar o fluxo de oferta
ALTER TABLE public.quiz_leads 
ADD COLUMN IF NOT EXISTS offer_flow integer DEFAULT NULL;

-- Criar indice para consultas por fluxo
CREATE INDEX IF NOT EXISTS idx_quiz_leads_offer_flow 
ON public.quiz_leads(offer_flow);

-- Comentario para documentacao
COMMENT ON COLUMN public.quiz_leads.offer_flow IS 
'1 = Oferta 1 (respostas A/B na Q7), 2 = Oferta 2 (respostas C/D na Q7)';