# Claude Code Development Notes

## Project Overview

This is a Next.js website migration project following modern React/TypeScript best practices. The codebase emphasizes maintainability and simplicity over premature optimization.

## Development Philosophy

### Keep It Simple

- **Avoid over-engineering** - Don't create separate files/abstractions for single-use items
- **Prefer collocation** - Keep related code together rather than spreading across multiple files
- **Question abstractions** - Only extract when there's genuine reuse across multiple files

### Code Quality Standards

- **ESLint + Prettier** for consistent formatting
- **TypeScript** for type safety with inference over explicit types
- **Husky pre-commit hooks** to catch issues early
- **Meaningful naming** over cryptic class names (replace WebFlow-generated names)

### Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── lib/           # Utility functions and configurations
└── types/         # TypeScript type definitions (only when shared)
```

## Tech Stack Decisions

### Next.js 16 + TypeScript

- **App Router** for modern React patterns
- **TypeScript** with strict config for reliability
- **Inter font** for design system consistency

### Styling Approach

- **Tailwind CSS v4** for utility-first development
- **Custom CSS** for complex component-specific styling (WebFlow conversions)
- **CSS Variables** for design tokens and theme values

### Dependency Management

- **package-lock.json** is critical - always commit
- **Node version pinning** via .nvmrc for team consistency
- **Minimal dependencies** - prefer built-in solutions when possible

## Lessons Learned

### WebFlow Migration Patterns

1. **Extract shared elements first** (navigation, background, layout)
2. **Keep complex CSS intact** - don't try to recreate WebFlow's intricate styles
3. **Replace simple utilities** with Tailwind equivalents where beneficial
4. **Preserve exact colors** - use CSS variables rather than approximate Tailwind colors

### React/Next.js Best Practices

1. **Component composition over inheritance**
2. **Props destructuring** for cleaner interfaces
3. **Semantic HTML** with proper alt text for accessibility
4. **File-based routing** for predictable URL structure

### Development Workflow

1. **Lint early, lint often** - fix issues immediately
2. **Type safety** catches bugs before runtime
3. **Small, focused commits** with clear messages
4. **Test changes** locally before committing

## Common Patterns

### Component Structure

```typescript
// Simple, focused components
interface Props {
  // Minimal, specific props
}

export default function Component({ prop }: Props) {
  // Local constants at top
  const localData = [...]

  return (
    // JSX with semantic HTML
  )
}
```

### Styling Approach

```typescript
// Combine Tailwind with custom classes judiciously
<div className="nav custom-webflow-class px-4 py-2">
```

### Type Safety

```typescript
// Prefer inference over explicit typing
const items = [...] // TypeScript infers the type
// Only add explicit types when sharing across files
```

## Future Considerations

### Scalability

- **Monitor bundle size** as features are added
- **Consider code splitting** for large pages only when needed
- **Performance optimization** should be measurement-driven, not premature

### Maintainability

- **Documentation** should focus on "why" not "what"
- **Consistent patterns** across similar components
- **Regular dependency updates** to avoid security issues

### Team Development

- **Onboarding docs** should emphasize the simplicity philosophy
- **Code reviews** should question complexity, not just correctness
- **Shared understanding** of when to extract vs. keep inline

---

_Remember: The best code is often the simplest code that solves the problem effectively._
