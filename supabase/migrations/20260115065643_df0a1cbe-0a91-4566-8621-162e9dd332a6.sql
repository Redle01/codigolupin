-- Block all updates on quiz_leads
CREATE POLICY "Block direct update on quiz_leads"
ON public.quiz_leads
FOR UPDATE
USING (false);

-- Block all deletes on quiz_leads
CREATE POLICY "Block direct delete on quiz_leads"
ON public.quiz_leads
FOR DELETE
USING (false);

-- Block all updates on quiz_funnel_events
CREATE POLICY "Block direct update on quiz_funnel_events"
ON public.quiz_funnel_events
FOR UPDATE
USING (false);

-- Block all deletes on quiz_funnel_events
CREATE POLICY "Block direct delete on quiz_funnel_events"
ON public.quiz_funnel_events
FOR DELETE
USING (false);