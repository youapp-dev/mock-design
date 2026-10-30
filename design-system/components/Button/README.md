# Button

The pill-shaped action button, in Big (56px) and Small (36px) sizes, with the Primary gradient as the main call to action.

**Consumer provides:** `children` (the label), optional `iconStart` / `iconEnd` (an icon asset URL, e.g. `arrow-left`, `arrow-right`), `variant`, `size`, `onClick`, `disabled`, `loading`, `block`.

| Variant | Use | Look |
| --- | --- | --- |
| `primary` | The one main action on a screen or sheet ("Fill in Phone Number", "Submit") | Primary gradient fill, white label |
| `secondary` | The alternative next to a primary | White fill, 1px gradient border, gradient label; pressed fills `surface-lavender` |
| `tertiary` | Neutral actions, social login | White fill, `line` border, `ink` label; pressed `gray-100` |
| `ghost` | Low-emphasis or inline actions, dialog actions | No fill, gradient label; pressed `gray-100` |
| `destructive` / `destructive-ghost` | Delete, cancel booking, report | `danger` label, `danger-border` outline (or none); pressed `danger-surface` |

- One `primary` per view. Put the secondary to its left or above it.
- Loading replaces the leading icon with a spinner, disables the button and sets `aria-busy`. Keep the label.
- Disabled keeps the variant shape: Primary turns to the `primary-disabled-*` gradient, Tertiary to `line` fill with `line-strong` border and `ink-tertiary` label.
- Full-width buttons in bottom sheets use `block` and `radius-sm` (the source's "Fill in Phone Number" sheet button is 12px, not a pill).
- Social login is a Tertiary button with the brand's full-colour logo from the Social group as an `<img>`, not a mask icon.
- The source also has a **Glass** variant (translucent gray over imagery). It is not built here yet.
