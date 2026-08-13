## 2024-05-18 - Added focus ring to all buttons
**Learning:** Found that custom buttons across the application lacked visual keyboard focus indicators, making the site difficult for keyboard users to navigate.
**Action:** Added `focus-visible` ring styling centrally to `Button.tsx` so all current and future buttons automatically get accessible focus states.
