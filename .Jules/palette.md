## 2024-05-24 - [Keyboard Accessible File Uploads]
**Learning:** Hidden file input tags (`display: none`) break the accessibility tree, making it impossible for keyboard or screen-reader users to focus on the upload trigger. Custom `<label>` file-triggers are not inherently focusable.
**Action:** Custom file upload buttons should add `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers listening for `Enter` and `Space` to dispatch clicks to the hidden input reference. Also include focus rings (e.g. `focus:ring-2`) to show focus state.
## 2024-06-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Many icon-only buttons (`RefreshIcon`, `SparklesIcon`, `DeleteIcon`) used for tool actions lacked `aria-label` attributes, impacting screen reader accessibility.
**Action:** Ensure all icon-only buttons include descriptive `aria-label`s.
## 2026-08-26 - [Add ARIA labels to icon-only buttons]
**Learning:** Icon-only buttons lacking `aria-label` attributes are inaccessible to screen reader users, who rely on explicit textual descriptions to understand the button's action.
**Action:** Always include a descriptive `aria-label` on buttons where the visual label is strictly icon-based, particularly within list items where context (e.g. playlist name) can be dynamically interpolated to provide a rich description.
## 2026-08-26 - [Keyboard Accessible Drag-and-Drop Zones]
**Learning:** Similar to hidden `<input>`s, `<div>`-based drag-and-drop file upload zones are inaccessible by keyboard if they rely solely on `onClick` or `onDrop` handlers.
**Action:** Always add `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers (for Enter/Space) to custom drag-and-drop zones, ensuring keyboard users can focus and activate them just like mouse users.
## 2024-09-02 - [Explanatory titles for disabled buttons]
**Learning:** Disabled buttons without an explanation for their disabled state can leave users confused about how to enable them or what is preventing the action.
**Action:** When a button is conditionally disabled, provide a `title` attribute explaining the reason, such as "Please enter a name for the new playlist" when saving is disabled due to an empty input.
