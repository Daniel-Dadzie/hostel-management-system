# Design System & UI Consistency

This project uses a design system for consistent colors, spacing, typography, and reusable UI components. All new UI work should use these shared resources for a professional and unified look.

## Location
- Design system constants: `src/ui/designSystem.js`
- Reusable components: `src/ui/`

## Usage
- **Colors, spacing, font, etc.:** Import from `designSystem.js` in your components.
- **Button, Card, Text:** Use the provided components in `src/ui/` for all new UI work.

## Example
```jsx
import { Button, Card, Text } from '../ui';

<Card>
  <Text as="h2" size="xl" weight="bold">Welcome</Text>
  <Button variant="primary">Click me</Button>
</Card>
```

## Guidelines
- Do not hardcode colors, spacing, or font styles in components—use the design system.
- Prefer using the shared Button, Card, and Text components over custom HTML elements.
- Extend the design system and UI folder for new patterns (e.g., Modal, Input, etc.).
- Update this documentation as the design system evolves.

---

For questions or to propose changes, update this file or discuss with the team.
