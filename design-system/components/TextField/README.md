# TextField

A single-line input or select row with an optional title, required marker, helper text and right-aligned meta text.

**Consumer provides:** `label`, `labelPosition` (`"above"`, the default, or `"inside"`), `required`, `placeholder` / `value` / `onChange`, `select` (makes it read-only so a picker can open), `trailingIcon` (`chevron-down` for selects, `chevron-right` for navigation rows), `trailingText`, `subtitle`, `helper`, `helperTone` (`info` · `success` · `error` · `pending`), `helperIcon`, `meta`, `disabled`.

- Box: 1px `line` border, `radius-sm`, 16px side padding, 48px minimum height. Focus turns the border `brand-primary-start`, error turns it `danger`.
- Title above the box is `headline` (16/600). A label inside the box is `label` (14/600) with the value under it.
- The required `*` is `danger`.
- Helper text is `caption` (12px) with a 16px icon. Use `info-circle` in `accent-violet` for info, `check-circle-fill` in `success`, `close-circle-fill` in `danger` and `clock-fill` in `pending`. `meta` (a counter or a subtitle) sits right-aligned in `ink-secondary`.
- Disabled fills the box with `line`, uses a `line-strong` border, and shows text in `ink-tertiary`.
- Placeholder colour `ink-tertiary` is 3.0:1 on white. Never use placeholder text as the only label.
