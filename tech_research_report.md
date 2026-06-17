# Technology Research & Best Practices Report (2025)

*This report is based on the technologies and versions currently implemented in this project (`next@16.2.9`, `react@19.2.7`, `typescript@6.0.3`, `tailwindcss@4.0.0`). It leverages the project's internal documentation located in `node_modules/next/dist/docs/`.*

## 1. New Developments

### Next.js 16.2.9
- **Middleware to Proxy Rename**: The `middleware` file convention is now deprecated and has been renamed to `proxy`. The project uses `src/proxy.ts` instead of `middleware.ts`. The exported function must now be named `proxy`. (Ref: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`)
- **Asynchronous Dynamic APIs**: APIs like `cookies()`, `headers()`, `params`, and `searchParams` are now asynchronous.
- **Enhanced Caching Strategies**:
    - **`use cache`**: Enables fine-grained caching for functions or components.
    - **`cacheTag` and `revalidateTag`**: Improved cache invalidation. `revalidateTag` now requires a profile argument (e.g., `'max'`, `'hours'`, or `{ expire: 0 }`).
    - **`updateTag`**: Recommended for immediate cache expiration in Server Actions to support "read-your-own-writes" scenarios.
- **AI-Agent Support**: Next.js 16.2+ includes terminal-first optimizations, such as forwarding browser errors to the terminal and providing a dev server lock file (`.next/dev/lock`) to prevent process collisions.

### React 19.2.7
- **React Compiler**: Automatically handles memoization, making `useMemo` and `useCallback` unnecessary for most development.
- **`use` Hook**: Allows reading resources like Promises and Context directly in the render function, including within loops and conditions for Context.
- **Server Actions**: Native support for asynchronous mutations with automatic state management through `useActionState` and `useFormStatus`.
- **Simplified Refs**: `ref` can be passed as a prop, reducing the need for `forwardRef`.

### Tailwind CSS v4.0.0
- **Oxide Engine**: A new, high-performance engine written for speed.
- **CSS-First Configuration**: The `tailwind.config.js` is replaced by a CSS-native configuration using `@theme` and cascade layers.
- **Automatic Content Detection**: No need to manually specify content paths; the engine detects them automatically.

### TypeScript 6.0.3
- **Temporal API Support**: Built-in types for the modern TC39 `Temporal` date/time API.
- **Performance**: Bridges the gap to v7's upcoming Go-based compiler, which promises up to 10x faster builds.

### Framer Motion 12.4.0 (Motion)
- **Brand Transition**: The library is now simply "Motion". React components should be imported from `motion/react`.

---

## 2. Recent Best Practices

- **Adopt `proxy.ts`**: Use the new naming convention for edge-level logic to ensure compatibility with Next.js 16.
- **Async Dynamic Access**: Always `await` calls to `cookies()`, `headers()`, and other dynamic APIs.
- **Granular Caching**: Use the `use cache` directive to optimize data fetching at the component level rather than revalidating entire routes.
- **Direct Ref Passing**: Pass `ref` as a prop in React 19 to simplify component code.
- **Temporal over Date**: Use the `Temporal` API for all new date/time logic to ensure better reliability and type safety.

---

## 3. Tools for Productivity

- **Next.js Bundled Docs**: Access version-specific documentation directly in `node_modules/next/dist/docs/`.
- **AI Coding Agents**: Use agents (like Jules) that are aware of the `AGENTS.md` instructions to prioritize local docs over potentially outdated training data.
- **React Compiler**: Leverage automated memoization to focus on feature logic rather than performance boilerplate.

---

## 4. Skills to Develop

- **Mastering Next.js 16 App Router**: Deep dive into async dynamic APIs and the new `proxy.ts` patterns.
- **React 19 Action Paradigms**: Transitioning from `useEffect`-based data mutations to Action-based patterns.
- **Modern CSS Workflow**: Learning the Tailwind v4 CSS-first configuration and @theme layers.
- **Temporal API Proficiency**: Understanding how to use the new date/time types for robust application logic.
