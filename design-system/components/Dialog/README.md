# Dialog

A centered alert with a title, one line of body text and two text actions split by a hairline.

**Consumer provides:** `title`, `children` (body), `cancelLabel` + `onCancel`, `cancelTone` (`"danger"` paints the left action `danger`), `confirmLabel` + `onConfirm`. Render it over a scrim and trap focus while it's open. The consumer owns both of those.

- The panel is 350px wide, white, `radius-lg` (20), with 20px padding.
- Title is `title` (18/600). Body is `body` (14/400).
- Actions are full-height `ghost` buttons in a row under a 1px `line` divider. The left action is the dismissive or destructive one, and the right action carries the gradient.
- Name the actions with verbs ("Cancel booking" / "Keep booking"), never "Yes" / "No".
