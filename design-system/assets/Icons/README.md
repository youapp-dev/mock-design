# Icons

YouApp's own UI icon set, exported from the Figma System App. Glyphs sit on a 24px square. Most are single-ink `ink` (#19181B). The exceptions are `user-star` and `calendar-star` (`brand-indigo` #38168E) and `badge-verified` and `badge-host-verified` (Primary gradient).

- Pairs: `<name>` is the outline version and `<name>-fill` is the solid one. Use outline at rest and fill for the selected or active state (bottom nav, toggles).
- Recolour a single-ink icon with `YouApp.Icon` (a CSS mask in `currentColor`). An `<img>` always shows ink.
- Arrows (`arrow-left`, `arrow-right`) go in buttons. Chevrons go in rows and selects. Carets go in compact disclosure.
- Status icons: `check-circle-fill` (success), `close-circle-fill` (failed), `clock-fill` (pending), `info-circle` (info), `alert-circle` (warning).
- `badge-verified` is for verified identity and `badge-host-verified` is for verified hosts. Show them right after the person's name at 16–20px.
- The 41 small glyphs (`menu`, `share`, `pencil` … `calendar-settings`) had no names in the export, so these names describe the drawings. Rename them to match the Figma layer names when you have those.
- The source's Locals (two people) icon is not in this set.
