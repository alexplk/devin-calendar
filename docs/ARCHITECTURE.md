# UI Architecture

> **For agents:** Follow this spec when building **any** UI in this project (especially in `code/platform`, the sandbox for these ideas). It defines how the UI is layered, where responsibilities live, when to reach for a component vs. a global CSS class, and how styling consumes design tokens. This is a **living document** — Alex iterates on it, and chat sessions that try ideas in `code/platform` should keep it up to date.

## Architectural principle

The UI is organized so that **business code expresses intent, and implementation detail lives below it**. Higher layers state *what* is on the screen; lower layers own *how* it is built.

A page should read like:

```tsx
<AgentThread />
<ToolApproval />
<HumanReview />
```

rather than:

```tsx
<div className={styles.container}>
  <Grid>
    <Button />
    ...
  </Grid>
</div>
```

The further up the stack, the less UI machinery should be visible. Pages trend toward declarative, almost configuration-like assembly — a description of the capabilities present, not a recipe for constructing them.

## The layers

The only architectural boundary that matters is **does this know the business domain?** That gives three layers:

| Layer | Owns | Concern |
|-------|------|---------|
| **Components** | buttons, inputs, layouts, cards, tabs, CSS, accessibility, library wrappers — single elements *and* compositions | the *how* — implementation detail, **domain-blind** |
| **Capabilities** | business capabilities (`AgentThread`, `ToolApproval`, `UpdatesFeed`, …) | the *what* — domain concepts |
| **Pages** | orchestration | assembly only |

Each layer depends **downward only** and hides its internals from the layers above. A page never reaches into another page; a capability never reaches into another capability; a component never reaches up. Cross-feature coupling dies because the only legal direction is down into shared layers. Styling and implementation detail are confined to components. Capabilities are the vocabulary pages are written in.

### Why there's no separate "primitives" vs "compositions" layer

A component being a single semantic element (`Button`) or a composition of several (`Card`, `PageHeader`) is **not** an architectural distinction — both are domain-blind building blocks, both live in `components`, and a component growing from one into the other is normal evolution, not a layer change. Splitting them apart only forces you to re-file things as they grow and to cut single concepts (e.g. a button and its richer variant) across a boundary. So: one `components` layer. How a given component is organized *internally* — variant prop, subcomponent, separate file — is ordinary case-by-case coding, not an architectural rule.

## Design rules

- Composition over large, heavily-configurable components.
- Reusable **business capabilities** over repeated page implementations.
- Promote shared code into a component once it has appeared multiple times — not in anticipation.
- Keep styling and implementation detail isolated in the components layer.

The objective is **not** maximum reuse. It is reducing the UI work required to build new business functionality. Adding a screen should be mostly assembling existing capabilities rather than writing layouts, CSS, and interaction plumbing from scratch.

### The abstraction-level test

> If a page carries a lot of layout code, CSS classes, and low-level components, the abstraction level is probably **too low**.
>
> If a page reads mostly like a list of business concepts, the abstraction level is probably **about right**.

## Components vs. semantic HTML

Not everything should be a component — but the choice is binary: **a component, or plain semantic HTML.** Global CSS is *not* a third styling mechanism we reach for. We don't compose screens out of global classes.

- **Component** — when structure, behavior, state, or a contract should travel together behind one explicit interface. A component's strength is keeping **structure, behavior, and styling together**.
- **Plain semantic HTML** — when a native element already expresses the intent. `<section>`, `<button>`, `<a>`, `<ul>` carry meaning on their own and are styled by `base.css` automatically; wrapping them adds indirection without adding meaning.

The only global styling that exists is `base.css` (automatic element defaults) and `utils.module.css` (a bounded utility set). Neither is a way to *style a screen* — they are the floor under everything, not a layer you build in.

### Rule of thumb

> If styling requires the caller to remember a DOM structure, or the thing carries behavior or state, use a **component**.
>
> If a native element already expresses the intent, use **plain semantic HTML** — on its own, or with a utility modifier.

### Utilities modify an element; they don't define a thing

The one caveat to the binary: a utility *can* attach to semantic HTML (or to a component's own element) to adjust it. That's expected, and it's the single place global CSS shows up at a call site — but a utility reads as an **adjective**, not as styling-by-class:

```tsx
<p className={u.caption}>v0.4.0</p>            // semantic element + modifier
<a className={u.mutedLink} href="…">docs</a>
```

The test: a utility *adjusts* the element it sits on; it never *is* the element. The moment you want a class that says *what something is* rather than tweaking how one element looks, that's a component. (What qualifies as a utility is detailed under "Where global styles live.")

## Avoid implicit structure in CSS

A class can quietly carry a structural contract. When a style only works if the DOM is arranged a particular way, that arrangement becomes a hidden requirement — encoded in selectors instead of expressed in the API. The caller has to know and reproduce a shape that nothing in the code makes visible:

```html
<a class="iconLink">
  <span class="icon"></span>
  Text
</a>
```

Here the relationship between the link, the icon span, and the text is load-bearing, but invisible at the call site. When a style implies structure like this, prefer a component that owns the structure and exposes a clear interface:

```tsx
<IconLink icon={<Icon />}>
  Text
</IconLink>
```

The component holds the structure and styling internally, so the contract is explicit and the call site stays simple. The guideline: **reserve utilities for styling that travels with a single element; once styling depends on a particular DOM shape, that shape belongs inside a component.**

## Consistency

Consistency does **not** require everything to be a component. It comes from a shared system:

- design tokens,
- CSS variables,
- the utility set (`utils.module.css`),
- shared component styles.

Components and utilities consume the **same** design tokens, so plain semantic HTML, a utility-modified element, and a full component all render consistently. The deciding factor between component and semantic HTML is whether there's structure or behavior that should be made explicit — not which one looks more consistent.

## Where global styles live

Global styling is split into two files under `src/styles/`, by mechanism:

- **`base.css`** — reset and base styling for raw semantic elements (`body`, `a`, `h1–h4`, box-sizing). Loaded once at the root, never imported as a module. There's nothing to "discover" here — it targets elements, not opt-in classes.
- **`utils.module.css`** — the registry of single-element utility classes (typographic modifiers like `caption`/`mutedLink`, tone/emphasis, token-backed sizing/spacing, a11y/visibility). It's a **CSS Module**, imported as an object so the set is enumerable and typo-safe at the call site:

```tsx
import u from "@/styles/utils.module.css";
<span className={u.caption} />
```

This resolves the discoverability problem with magic-string class names: the import object *is* the list, and `u.captoin` fails instead of silently doing nothing. Keys are typed in `utils.module.css.d.ts` (hand-maintained while small; switch to generated declarations such as `typed-css-modules` once it grows).

### What belongs in `utils.module.css`

A class earns a place here only if it enhances **one element** with no nesting, sibling, or hidden-DOM contract. Two kinds of thing qualify, and only these:

**1. Modifiers — an adjective applied to any element.** A purely visual or typographic tweak that travels with whatever element already expresses the intent. It reads as *element + adjective*, and doesn't care which element:

```tsx
<p  className={u.caption}>…</p>     // de-emphasised small text
<a  className={u.mutedLink}>…</a>   // low-emphasis link
<span className={u.truncate}>…</span> // single-line ellipsis
<h2 className={u.srOnly}>…</h2>     // visually hidden, kept for screen readers
```

`caption` works the same on a `<div>`, `<span>`, or `<figcaption>` — that interchangeability is the signal it's a utility, not a component.

**2. Token shorthands — a named application of a design token.** Tailwind-style helpers so call sites stop hand-writing `style={{ padding: "var(--company-primitive-size-6)" }}`. The utility *is* the token, given a name and a single definition to change:

```css
/* utils.module.css */
.padBlock  { padding-block: var(--company-primitive-size-6); }
.gapTight  { gap: var(--company-primitive-size-3); }
.wReadable { max-width: 68ch; }
```
```tsx
<section className={u.padBlock}>…</section>
```

Name them by intent, not by value (`caption`, not `gray500Sm`), and use camelCase keys so they read cleanly off the import.

**What does _not_ belong here:**

- Anything with internal structure — icon + text, dot + label → a component (`IconLink`, `Tag`).
- Anything with behavior, state, or a11y wiring beyond a static class → a component (`Tabs`).
- Layout that's really a primitive — vertical flow with a gap is `Stack`, not a `.stack` utility. Token shorthands are for incidental one-element tweaks, not for replacing layout components.
- A style used in only one component → that component's own `.module.css`. Utils is for tweaks that recur across *unrelated* components; promote into utils on the second use, not in anticipation of it.

## Design tokens

Company-provided tokens live in `code/platform/src/global-design.css`, imported at the root. Tokens use the `--company-` prefix (the vendor `--ubs-nemo-` prefix is dropped): `--company-primitive-*` for raw values, `--company-semantic-*` for semantic mappings. Every component and global class consumes these — raw values are never hardcoded.

No Tailwind or other utility-first framework. Styling is plain CSS over the token layer.

## Open questions

_Unresolved tensions to work through as ideas are tried in `code/platform`._

1. **Is the inconsistency a problem?** We have more than one way to "create a component" — semantic element + global class, and a real component. Are these *competing* mechanisms, or complementary ones picked by context? If they're complementary, the rule for choosing between them needs to be sharp enough that the mix doesn't read as inconsistency. Still needed: concrete worked examples of "this is a global style" vs. "this is a component," side by side, so the boundary is legible.
2. **Organizing components within the layer.** Components exist at different scopes — shared across all screens, vs. a composition that's part of one bigger page or component. One idea: a consistently named `components` folder at every level, where *where* it sits expresses its visibility scope (the higher it lives, the broader its reach). The cost is deeply nested `components` inside `components` inside `components`. Alternatives to weigh: a flat shared library with explicit "local vs. shared" promotion, colocation by feature, or scope encoded in naming rather than nesting depth. Open: which keeps visibility legible without the nesting tax?

---

_Living doc. Update as ideas are tried in `code/platform`._
