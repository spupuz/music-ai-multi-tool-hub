# Music AI Hub Style Guide - Mobile Responsiveness First

This guide defines the mandatory rules for UI development to ensure a flawless experience on small viewports (375px+).

---

## 1. Containers & Widths
- **Full Containment**: All main containers and input fields must use `w-full`.
- **No Fixed Widths**: Avoid `w-[300px]` or `min-w-[200px]` without responsive overrides (`sm:min-w-...`).
- **Overflow Prevention**: Cards and layout wrappers must always include `max-w-full`.
- **Absolute Elements**: Ensure decorative absolute elements (`blur-3xl`, etc.) don't push the internal container out.

## 2. Typography Hierarchy
- **Tool Headers (H1)**:
    - **Mobile (375px)**: `text-lg` (18px) or `text-xl` (20px) depending on length.
    - **Tablet (sm/md)**: `text-4xl` to `text-5xl`.
    - **Desktop (lg)**: `text-6xl` to `text-7xl`.
- **Subtitles**:
    - Mobile: `text-[8px]` or `text-[9px]` with `tracking-[0.2em]`.
    - Desktop: `text-[10px]` or `text-xs`.
- **Dynamic Text**: Always apply `truncate` or `break-all` to filenames, IDs, and URLs to prevent line-breaking from forcing container expansion.

## 3. Stacking Policy
Any interactive functional group (Inputs, Buttons, Selects) that is in a row on desktop **MUST** stack vertically on mobile:
- **Rule**: Use `flex-col sm:flex-row`.
- **Exceptions**: Only tiny icon buttons (max 2) are allowed in a row on mobile.

## 4. Padding & Margins
- **Minimalist Mobile**: Use `p-2` or `p-3` for `glass-card` elements on mobile.
- **Header Spacing**: Use `pt-0` or `pt-2` on mobile; reserve larger padding for `md:pt-16` on desktop.
- **Inter-element Gaps**: Use `gap-2` or `gap-3` on mobile; scale to `gap-6+` on larger screens.

## 5. UI Elements
- **Tables**: Every `<table>` must be wrapped in `<div className="overflow-x-auto w-full">`.
- **Buttons**: In vertical stacks on mobile, buttons should be `w-full` for better tap targets and layout containment.
- **Inputs**: Use `w-full` for all form inputs.

## 6. Glassmorphism standard
- **Border**: `border border-white/10`.
- **Blur**: `backdrop-blur-md` (12px - 16px).
- **Radius**: `rounded-2xl` or `rounded-3xl` for main cards.
