# YouApp Design System

Tokens, components and brand assets for YouApp, built from the **YouApp System App** Figma file (Brand Guidelines v3.0, 2026).

## What's here

| Path | What |
| --- | --- |
| `tokens.json` | Source of truth: colours, type scale, spacing, radius, sizes, each with a usage note |
| `tokens.css` | The same tokens as CSS custom properties (`--brand-indigo`, `--space-4`…) and one class per text style (`.headline`, `.caption`…) |
| `components/bundle.js` | React components on `window.YouApp`: Button, TextField, Toast, Tabs, SegmentedControl, BottomNav, ReviewCard, Dialog, Icon |
| `components/bundle.css` | Component styles; reads only the tokens |
| `components/index.d.ts` | Props for every component |
| `components/<Name>/README.md` | Usage guidelines per component |
| `components/<Name>/preview.html` | Live preview; open it in a browser |
| `assets/Logos` | 12 logo lockups and app icons (SVG) |
| `assets/Icons` | 114 UI icons, 24px (SVG) |
| `assets/Social` | 9 social login logos |
| `assets/Flags` | 260 round flags (numbered in Figma order) |

## Use it

```html
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="design-system/components/bundle.js"></script>
<script>
  const { Button } = window.YouApp;
  ReactDOM.createRoot(document.getElementById("root"))
    .render(React.createElement(Button, { variant: "primary" }, "Become a Host"));
</script>
```

Icons are single-ink SVGs. To recolour one, use `YouApp.Icon` with the file path as `src` (it paints in `currentColor`).

---

YouApp is a mobile-first social marketplace: people discover local hosts, book experiences and pay inside the app. The UI is calm and white, with one brand gradient, from lavender to indigo, saved for the actions and states that matter. Build every screen on these tokens, components and assets.

## Content fundamentals

- **Voice:** friendly, direct and short. Talk to the user as "you" and refer to YouApp as "we" ("We'd love your feedback", "We've sent a 6-digit OTP to your email").
- **Casing:** Title Case for screen titles, dialog titles and button labels ("Fill in Phone Number", "Request Extension", "Show Receipt"). Sentence case for body text, helper text and toasts ("Report has been sent").
- **Buttons are verbs** that name the outcome: "Submit", "Send Message", "Resend Again". Don't use "OK" or "Yes / No".
- **Tell people what to do next.** Blocking states explain the missing step and the button fixes it: "You haven't filled your phone number. Please make sure to input your phone number before you apply as a host." → **Fill in Phone Number**.
- **Errors say what happened and how to recover:** "Incorrect OTP Code. Please try again!" Point people to a fix ("try checking your spam/junk folder").
- **Dates and times** are written out in full: "23 August 2026", "Monday, 02/12/2025 - 06.00 PM - 09.00 PM", "12 Jun 2025 18.00-21.00" in timelines.
- No emoji in UI copy. Use the icon set instead.

## Visual foundations

### Colour

- Surfaces are `brand-white`. `gray-100` is for pressed fills and selected rows. `line` is the 1px border and divider for inputs, cards, tracks and dividers.
- Text is `ink` (titles, values, labels) or `ink-secondary` (handles, dates, subtitles). `ink-tertiary` is only for placeholders, inactive nav and disabled text, because it is 3.0:1 on white. Bottom sheets use `ink-sheet`.
- **The Primary gradient** goes left to right, from `brand-primary-start` (#986DB5) to `brand-primary-end` / `brand-indigo` (#38168E). Use it for Primary buttons, Secondary button borders and labels, the active tab label and underline, the active segment, progress and slider fills, the Scan tile and the app icon. Don't use it as a page background or in illustrations.
- `brand-indigo` alone marks active nav labels, specialty links and accent icons. `accent-violet` marks info text, online presence and success toasts. `surface-lavender` is the track behind segments and the pressed Secondary fill.
- Status colours: Success uses `accent-violet` in toasts and `success` green in helper text, Failed uses `danger`, Pending uses `pending`. Always pair a status colour with its icon. `pending` (2.4:1) and `success` (3.4:1) are too light to carry text alone.
- `decor-lavender` is only for the oversized category words (Dance, Stay, Eat, Pay, Play, Roam…).

### Type

- Inter throughout, weights 400 / 500 / 600 / 700. Use `display` for decorative category words, `title-lg` for large titles and OTP digits, `title` for dialog and top-bar titles, and `headline` for big button labels, field titles and tabs. Use `body-lg` for input values, `label` for small buttons and names, `body` for dialog and sheet text, `caption` for helper text, review text and dates, and `micro` for notification timestamps.
- Line heights of 20px (14px text) and 16px (12px text) were measured from the source. The others follow Inter's default spacing.

### Shape, space and elevation

- All buttons, chips, segments and progress bars are full pills (`radius-pill`). Inputs and toasts use `radius-sm` (12), cards `radius-md` (16), dialogs `radius-lg` (20), and bottom sheets `radius-sheet` (26) on their top corners.
- Spacing runs in 4px steps: `space-1` to `space-6`. The screen side gutter is `space-4` (16px).
- Heights: Big buttons `control-lg` (56), Small `control-sm` (36), inputs and toasts `control-md` (48).
- No drop shadows. Layers are separated by 1px `line` borders and the dialog scrim. Keep it that way.

### States

- **Pressed:** the Primary gradient darkens to `primary-pressed-*`, Secondary fills `surface-lavender`, Tertiary and Ghost fill `gray-100`, Destructive fills `danger-surface`.
- **Disabled:** Primary turns to `primary-disabled-*`. Neutral controls fill `line` with a `line-strong` border and `ink-tertiary` text.
- **Loading:** a spinner replaces the leading icon, the label stays, and the control is disabled.
- **Focus:** a solid 2px `brand-indigo` ring, offset 2px (12.5:1 on white). The source doesn't define a focus style, so this one was added here.
- **Selected:** the gradient (tabs, segments) or `brand-indigo` with an `accent-lavender-tint` halo (bottom nav).

### Imagery

Photography is warm and natural: people sharing food, music, travel and city life, with lavender touches. It shows up in the slider-captcha cards and profiles. Avatars are circles, and cards and puzzle images use `radius-md`.

## Iconography

- Use only the system's **Icons** group. It's YouApp's own 24px set, outline plus `-fill` pairs, drawn in `ink`. Recolour with `YouApp.Icon` (a CSS mask in `currentColor`), never with filters.
- Use outline icons at rest and `-fill` icons for the active state. Arrows go inside buttons, chevrons in rows and selects.
- The verified badges (`badge-verified`, `badge-host-verified`) carry the gradient and follow a person's name.
- Social login and share use the full-colour **Social** logos as `<img>`. Country pickers use the round **Flags**, always with the country name next to them.
- The logo is never an icon. Use the **Logos** group, as its README describes.

## Components

Use `window.YouApp`. Each component has guidelines in its own README: **Button**, **TextField**, **Toast**, **Tabs** (with SegmentedControl), **BottomNav**, **ReviewCard** and **Dialog**, plus the **Icon** helper.

The source also defines these, which aren't built here yet. Follow the source when you need one: radio list (country picker), slider captcha, progress bar, push-notification preview, top bars (title, profile with presence, onboarding progress with Skip), OTP input, rating sheet, bottom sheets (feedback form, birth-date picker, share sheet), schedule timeline, and the Glass button.
