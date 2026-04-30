---
title: Design System
description: Selia UI components used in TSKit.
sidebar:
  order: 6
---

TSKit uses [Selia UI](https://selia.earth) for its component library. Components live in `src/components/selia/`.

## Managing components

Use the Selia CLI to add or update components:

```bash
bun run ui
```

This opens an interactive prompt where you can select components to install or update. Components are copied into your project, so you own the code and can customize them.

## Styling

TSKit uses Tailwind CSS v4 with an OKLCH color system. Colors and design tokens are defined in `src/styles.css`. Components use CVA (Class Variance Authority) for variant-based styling, which keeps class names predictable and composable.

## Available components

The design system ships with a set of components in `src/components/selia/` covering common patterns like buttons, inputs, dialogs, dropdowns, tabs, and more.

Since the components are part of your project (not an external dependency), you can modify them directly to fit your needs.

For the full list of components, usage examples, and API reference, see the [Selia UI documentation](https://selia.earth).
