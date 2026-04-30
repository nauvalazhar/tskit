---
title: Adding an Email Template
description: How to add a new transactional email template.
sidebar:
  order: 3
---

Email templates are React components that live in `src/emails/`. The file name becomes the template name you use when sending.

## 1. Create the template file

Create a new file in `emails/`. Export a `subject` function and a default component:

```tsx
// src/emails/welcome.tsx
import { Html, Head, Body, Container, Text } from '@react-email/components'

export const subject = ({ name }: { name: string }) =>
  `Welcome to TSKit, ${name}!`

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hey {name}, thanks for signing up.</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

## 2. Register it in the type map

Open `emails/index.ts` and add the new template to the type map and the `load` function:

```ts
// Add the type import at the top
import type WelcomeEmail from './welcome'

// Add to EmailTemplates
export type EmailTemplates = {
  // ... existing templates
  'welcome': PropsOf<typeof WelcomeEmail>,
}

// Add to the load switch
async function load(name: keyof EmailTemplates) {
  switch (name) {
    // ... existing cases
    case 'welcome':
      return import('./welcome')
  }
}
```

## 3. Send it

Use `mailer.send()` with the template name:

```ts
await mailer.send('welcome', 'user@example.com', {
  name: 'Jane',
})
```

TypeScript will enforce that the data object matches the component's props.

## 4. Preview it

Start the email dev server to see your template in the browser:

```bash
bun run email:dev
```

This opens a preview at `http://localhost:3001` where you can browse all templates.

## Template conventions

- File name is the template name: `welcome.tsx` becomes `'welcome'`
- The `subject` export can be a function (receives props) or a plain string
- The default export is the React Email component
- Props are inferred automatically through the type map
