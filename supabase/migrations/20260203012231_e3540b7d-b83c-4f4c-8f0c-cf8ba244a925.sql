-- Habilitar realtime para as tabelas de leads e eventos
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_funnel_events;