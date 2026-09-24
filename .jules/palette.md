## 2023-10-27 - BPM Tapper Tool Accessibility
**Learning:** Icon-only buttons or buttons that primarily rely on visual cues (like a giant "TAP" button with an icon) need clear, descriptive `aria-label`s to ensure screen reader users understand their function, especially when state (like active tabs) relies heavily on visual styling.
**Action:** Always verify that interactive elements, especially primary action buttons in tools, have explicit `aria-label` attributes if their visible text is short or iconic, and ensure tab controls use standard accessibility patterns (`role="tab"`, `aria-selected`, etc) or at least have descriptive labels.
## 2023-10-27 - BPM Tapper Tool Accessibility Tab Roles
**Learning:** When using standard `role="tablist"` and `role="tab"` to improve screen reader accessibility of custom tab controls, it is necessary to also add `aria-controls` to the tab itself, and ensure the content wrapper container has the `role="tabpanel"` attribute and the corresponding `id`.
**Action:** Always include the full suite of ARIA attributes (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`) when building custom tab navigations to ensure proper semantic structure.
## 2023-10-25 - Title on dynamic disabled buttons
**Learning:** Disabled buttons without explanations cause friction because users don't know why they can't proceed. Binding a dynamic `title` attribute to the condition that disables the button provides immediate, accessible context.
**Action:** Always provide a conditionally rendered `title` attribute to explain the specific reason a button is disabled.
## 2025-03-01 - [Keyboard Accessible Tooltips in Tailwind]
**Learning:** Custom CSS-based tooltips built with Tailwind `group-hover` are inherently inaccessible to keyboard users unless explicitly managed. Simply wrapping an SVG in a `div` is not enough.
**Action:** Always wrap tooltip triggers in a focusable container (`tabIndex={0}`, `role="button"`, and a descriptive `aria-label`). Apply the `group` class to this container, and add `group-focus:opacity-100` alongside `group-hover` on the actual tooltip element so it becomes visible on keyboard focus.
## 2026-09-20 - Color Inputs Need Explicit Labels
**Learning:** React `<label>` elements that visually precede `<input>` elements but lack an `htmlFor` attribute matching the input's `id` do not provide an accessible name for screen readers. This is particularly problematic for native `<input type="color">` elements which have no inherent text content.
**Action:** Always ensure inputs have an accessible name, either by strictly enforcing the `id`/`htmlFor` linkage with visual labels, or by providing a descriptive `aria-label` directly on the `<input>` when linkage is not possible or practical.
## 2025-03-02 - Keyboard Accessible Custom File Uploads
**Learning:** Custom file uploads that use `opacity-0` on a natively focusable `<input type="file">` are functional for keyboard users natively, but they lack a visible focus ring, creating a severe accessibility issue for sighted keyboard users. Replacing them with complex ARIA hacks on labels breaks native semantics.
**Action:** When using an `opacity-0` file input positioned over a stylized container, always apply `focus-within:ring-2 focus-within:ring-emerald-500` (or similar) to the parent wrapper container. This allows the native input to receive focus in the background while the parent container visibly indicates the focus state.
## 2025-03-02 - Custom Select Triggers Need ARIA Labels
**Learning:** Custom UI components that act as form controls, like a custom Select dropdown using a `<button>` as the trigger, often lack implicit context when used without a visible, programmatically linked `<label>`. This makes them opaque to screen readers.
**Action:** When building or updating custom form controls, always ensure the main interactive trigger accepts an `aria-label` prop and provides a sensible fallback (like using the component's `label` or `placeholder` props) to guarantee an accessible name is always present.
