## 2024-05-24 - [Keyboard Accessible File Uploads]
**Learning:** Hidden file input tags (`display: none`) break the accessibility tree, making it impossible for keyboard or screen-reader users to focus on the upload trigger. Custom `<label>` file-triggers are not inherently focusable.
**Action:** Custom file upload buttons should add `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers listening for `Enter` and `Space` to dispatch clicks to the hidden input reference. Also include focus rings (e.g. `focus:ring-2`) to show focus state.
