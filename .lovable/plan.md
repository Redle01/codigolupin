

## Plan: Remove `trackMetaPageView` from Quiz.tsx

Three surgical edits in `src/components/quiz/Quiz.tsx`:

1. Remove `trackPageView: trackMetaPageView` from the `useMetaPixel()` destructure (keep `setExternalId` and `initWithUser`).
2. Delete the `trackMetaPageView();` call inside the page view tracking `useEffect`.
3. Remove `trackMetaPageView` from that `useEffect`'s dependency array.

This stops the quiz component from firing redundant `fbq('track', 'PageView')` calls on each step change, since the global PageView is now handled in `index.html`.

