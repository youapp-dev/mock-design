# ReviewCard

A review written for a host or buyer: avatar, name and handle, a rating chip, a specialty line, the review text and its date.

**Consumer provides:** `name`, `handle`, `avatar` (image URL; falls back to a `line` disc), `rating` (number, shown to one decimal), `starIcon` (`star-fill`), `tag`, `date`, `children` (review text).

- The card is white with a 1px `line` border, `radius-md` and 16px padding.
- Name is `label` (14/600). Handle and date are `caption` in `ink-secondary`. Review text is `caption` in `ink`.
- The specialty line (`tag`) is `caption` in `brand-indigo`.
- The rating chip has a `line` border, `radius-md`, and a star in `brand-indigo`.
- Dates are written out in full: "23 August 2026".
