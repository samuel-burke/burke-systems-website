---
name: burke-brand
description: Burke Systems brand rules (logo, colors, type, voice) for any UI, copy, or asset work on the burke.systems site.
---

# Burke Systems brand

The design canvas "Burke Systems Logo" is the source of truth. This is the summary for building the site.

## Logo

- The mark is a geometric B. Its two counters are joined by a thin channel that traces an S for Systems: "B on the surface. S in the white space."
- Use `src/components/brand/Mark.astro` (inline SVG, `currentColor`) or `Lockup.astro` (mark + BURKE over SYSTEMS). Never redraw, stretch, rotate, outline, add shadows or gradients, or fill in the S channel.
- Colors for the mark: Burke Blue, Night, or White only.
- Clear space is half the mark's width. Minimum 16px tall on screen.
- Lowercase `burke·systems` domain lockup exists too; on the website only, its dot may be a pulsing green "all systems up" light.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `burke-blue` / `primary` | #2B50E8 | Buttons, links, eyebrows. Hover #1C3BB8. Use sparingly. |
| `night` | #0F172A | Text, dark sections |
| `muted-foreground` (Slate) | #475569 | Body copy on light |
| `mist` | #DCE3F7 | Tints, placeholders |
| `paper` | #F4F6FA | Alternate section background |
| `cloud` | #C7D0E0 | Secondary text on Night |
| `periwinkle` | #8FA6F5 | Accent text on Night |
| `status-green` | #22C55E | Domain-lockup dot only |

Mostly Night, White and Paper. Blue stands out because it is rare.

## Type

- Montserrat 700/800 for headings and the wordmark (`font-heading`).
- Inter 400–600 for body and UI (`font-sans`). Body text 16px or larger with roomy line height.
- Eyebrows: 13px, semibold, `tracking-[0.18em]`, uppercase.

## Voice

Plain, direct, practical. Say: "We'll build the tool your team actually uses, then stick around to keep it working." Never: "We leverage cutting-edge synergies to deliver transformative digital solutions."
