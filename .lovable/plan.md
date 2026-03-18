

## Plan: Add `fbq('track', 'PageView')` to Meta Pixel in index.html

Add the `PageView` tracking call immediately after the pixel initialization line in the Meta Pixel script block.

### Change

**`index.html`** — Insert `fbq('track', 'PageView');` right after `fbq('init', '1585747689119987');` inside the Meta Pixel script.

