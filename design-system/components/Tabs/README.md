# Tabs

Top tabs with a gradient underline, plus `SegmentedControl`, the pill switch that sits in a lavender track.

**Consumer provides:** `items` (`[{ value, label, icon? }]`), `value` / `defaultValue`, `onChange`. `SegmentedControl` also takes `ariaLabel`.

- Tabs: labels are `headline`. The active label takes the gradient, with a 4px gradient bar along its bottom edge. Inactive labels are `ink`.
- SegmentedControl: the track is `surface-lavender` with 4px padding, and items are pills. The active item has a gradient fill with a white label and icon. Inactive items are `ink`. Use it for two or three mutually exclusive modes (Buyer / Host).
- Use Tabs to switch between content lists. Use SegmentedControl to switch modes inside one view.
