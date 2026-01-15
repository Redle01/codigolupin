-- Tabela para leads/emails capturados
CREATE TABLE public.quiz_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  result_type TEXT,
  answers JSONB,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para eventos do funil (tracking)
CREATE TABLE public.quiz_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  page_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_funnel_events_page ON public.quiz_funnel_events(page_key);
CREATE INDEX idx_funnel_events_visitor ON public.quiz_funnel_events(visitor_id);
CREATE INDEX idx_quiz_leads_email ON public.quiz_leads(email);

-- Habilitar RLS
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_funnel_events ENABLE ROW LEVEL SECURITY;

-- Políticas para INSERT anônimo (visitantes não autenticados podem inserir)
CREATE POLICY "Allow anonymous insert on quiz_leads"
ON public.quiz_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on quiz_funnel_events"
ON public.quiz_funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Bloquear SELECT direto (dados só acessíveis via Edge Function)
CREATE POLICY "Block direct select on quiz_leads"
ON public.quiz_leads
FOR SELECT
USING (false);

CREATE POLICY "Block direct select on quiz_funnel_events"
ON public.quiz_funnel_events
FOR SELECT
USING (false);