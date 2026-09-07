# AGENTS.md

## Package Manager & Runtime

This project uses **Bun as the primary JavaScript/TypeScript runtime and package manager**.

### Mandatory Rules

* ALWAYS use **Bun** for JavaScript/TypeScript package management and script execution.
* NEVER use `npm` unless explicitly requested by the user.
* NEVER use `npx` unless explicitly requested by the user.
* NEVER use `yarn` unless explicitly requested by the user.
* NEVER use `pnpm` unless explicitly requested by the user.
* Do not replace Bun commands with equivalent npm/yarn/pnpm commands.
* Before running a package manager command, check the project configuration and use Bun.

### Command Mapping

Use these commands:

| Do NOT use                 | ALWAYS prefer          |
| -------------------------- | ---------------------- |
| `npm install`              | `bun install`          |
| `npm i`                    | `bun install`          |
| `npm install <package>`    | `bun add <package>`    |
| `npm install -D <package>` | `bun add -d <package>` |
| `npm uninstall <package>`  | `bun remove <package>` |
| `npm run <script>`         | `bun run <script>`     |
| `npx <command>`            | `bunx <command>`       |
| `npm init`                 | `bun init`             |
| `npm test`                 | `bun test`             |
| `npm exec <command>`       | `bunx <command>`       |

### Running Project Scripts

Use:

```bash
bun run dev
bun run build
bun run start
bun run lint
bun run typecheck
```

If a script is defined in `package.json`, prefer:

```bash
bun run <script>
```

instead of:

```bash
npm run <script>
```

### Installing Dependencies

For production dependencies:

```bash
bun add <package>
```

For development dependencies:

```bash
bun add -d <package>
```

Remove dependencies with:

```bash
bun remove <package>
```

Install dependencies from the existing lockfile with:

```bash
bun install
```

### Executing CLI Tools

Use `bunx` instead of `npx`.

Example:

```bash
bunx prisma generate
bunx shadcn@latest init
bunx eslint .
```

Do NOT use:

```bash
npx prisma generate
npx shadcn@latest init
npx eslint .
```

### Windows

This project may be developed on Windows.

Prefer invoking Bun directly:

```cmd
bun install
bun run dev
bun run build
bunx <command>
```

Do NOT unnecessarily wrap Bun commands with:

```cmd
cmd /c bun ...
```

Only use `cmd /c bun ...` when the execution environment specifically requires `cmd /c` to correctly resolve or execute the command.

### Lockfile

The project uses Bun's lockfile:

```text
bun.lock
```

or, depending on the Bun version:

```text
bun.lockb
```

Do not generate or introduce another package-manager lockfile such as:

```text
package-lock.json
yarn.lock
pnpm-lock.yaml
```

If an unwanted package-manager lockfile is accidentally generated, remove it unless the user explicitly asks to keep it.

### Existing Project Configuration

Before installing, updating, or removing dependencies:

1. Inspect `package.json`.
2. Check the existing Bun lockfile.
3. Preserve the project's existing dependency versions unless the user requests an upgrade.
4. Use Bun commands.
5. Do not migrate the project to another package manager.

### Package Manager Enforcement

If `package.json` contains:

```json
{
  "packageManager": "bun@..."
}
```

treat Bun as mandatory.

If the project contains a Bun lockfile, assume Bun is the intended package manager unless the user explicitly says otherwise.

### Agent Behavior

When deciding how to perform a task:

1. Prefer Bun.
2. Prefer existing project scripts.
3. Inspect `package.json` before inventing commands.
4. Use `bun run <script>` for package scripts.
5. Use `bunx <command>` for temporary CLI execution.
6. Never silently switch package managers.
7. If a command fails because of Bun compatibility, investigate the actual error first.
8. Do not "fix" a Bun-related issue by switching to npm.
9. Only use another package manager when the user explicitly requests it or the project explicitly requires it.

### Examples

Correct:

```bash
bun install
bun add zod
bun add -d typescript
bun run dev
bun run build
bunx prisma generate
```

Incorrect:

```bash
npm install
npm install zod
npm install -D typescript
npm run dev
npx prisma generate
```

### Important

**Bun is the default and preferred runtime, package manager, script runner, and package executor for this project.**

If there is any ambiguity between Bun and another JavaScript package manager, choose **Bun**.
