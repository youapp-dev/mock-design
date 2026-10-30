# BottomNav

The app's main tab bar: Discover, the raised Scan action, and Locals.

**Consumer provides:** `items` (`[{ value, label, icon, activeIcon?, center? }]`), `value` / `defaultValue`, `onChange`, `ariaLabel`.

- The bar is white with a 1px `line` top border. Labels are 14px weight 500.
- Inactive items are `ink-tertiary`. The active item is `brand-indigo`, with a 40px `accent-lavender-tint` halo behind the icon.
- The centre item (`center: true`) is a 64×60 tile, radius 16, with the gradient fill and a white icon. It sits 32px above the bar. Its label follows the same active and inactive colours.
- Use the outline icons (`discover`, `scan-fill` for the centre). The source's Locals icon (two people) isn't in the exported icon set yet, so this preview uses `user` in its place.
