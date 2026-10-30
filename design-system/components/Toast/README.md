# Toast

A short status message that appears near the top of the screen after an action: Success, Failed, Pending, a neutral confirmation, or Failed with a Report action.

**Consumer provides:** `tone` (`success` · `failed` · `pending` · `neutral`), `children` (the message), `icon` (`check-circle-fill`, `close-circle-fill`, `clock-fill`), `closeIcon` (`close`) with `onClose`, or `actionLabel` with `onAction`.

- Toned toasts: white fill, a 1px border in the tone colour, and a 4px bar on the left in the same colour, then the icon, then the message in `headline` (16/600 `ink`).
- Success uses `accent-violet`, not green. Failed uses `danger`, Pending uses `pending`.
- Neutral confirmation ("Report has been sent") has no icon or close button. It uses `overlay-ink-50` fill with a centered white label.
- Failed with action puts the `danger` text button ("Report") at the right in place of the close icon.
- Failed toasts get `role="alert"`. All the others get `role="status"`.
- Keep messages to one sentence. Say what happened, not "Error".
