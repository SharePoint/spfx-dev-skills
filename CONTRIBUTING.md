# Contributing to SPFx Dev Skills

Thanks for helping improve these skills! This guide covers how to propose changes and the conventions that keep the `spfx` skill high quality.

## Ways to contribute

- **Report issues** — bugs, wrong guidance, or gaps: <https://github.com/SharePoint/spfx-dev-skills/issues>
- **Suggest improvements** — new references, better toolchain/design guidance, clearer steps.
- **Submit pull requests** — fixes and additions to the skill content.

## Contribution flow: fork → branch → PR to `main`

This repository uses a simple fork-and-PR model. The default and target branch is **`main`**.

1. **Fork** `SharePoint/spfx-dev-skills` to your own GitHub account.
2. **Clone** your fork:
   ```
   git clone https://github.com/<your-username>/spfx-dev-skills.git
   cd spfx-dev-skills
   ```
3. **Create a branch** from `main`:
   ```
   git checkout -b feature/short-description
   ```
4. **Make your changes** following the conventions below.
5. **Commit** with a clear message:
   ```
   git commit -m "Improve upgrade reference with Node compatibility check"
   ```
6. **Push** to your fork:
   ```
   git push origin feature/short-description
   ```
7. **Open a pull request** from your branch against **`main`** of `SharePoint/spfx-dev-skills`. Describe what changed and why.

Keep PRs focused — one logical change per PR is easiest to review.

## Content conventions

The skill lives under `plugins/spfx/skills/spfx/`:

- **`SKILL.md`** is the router. It holds the intent list, global rules, and the toolchain decision rule. Keep it short — detailed steps belong in references.
- **`references/*.md`** are self-contained playbooks. Each should be executable by an agent without external context.

When editing references, please keep these in mind:

- **Be version-accurate.** SPFx uses **Heft** for v1.22+ and **gulp** for v1.21.1 and earlier. Don't mix them. Cite the correct commands for the relevant toolchain (see [toolchain.md](./plugins/spfx/skills/spfx/references/toolchain.md)).
- **Never invent versions, flags, or APIs.** If a flag or command isn't certain, instruct the agent to discover it (e.g. `--help`) rather than guessing.
- **Prefer non-interactive commands.** Explicit flags only — no reliance on arrow-key prompts.
- **Keep PnPjs the default** for SharePoint and Microsoft Graph data operations.
- **End with validation.** Guidance should drive toward a clean `npm run build` before a task is considered done.
- **Cross-link** related references instead of duplicating content.
- Use clear Markdown: short sections, tables for command mappings, fenced code blocks for commands.

## Validating your changes

There is no build step for the skill content itself. Before opening a PR:

- Re-read the affected reference end-to-end and confirm every command matches the toolchain it claims to target.
- Check that cross-links resolve to existing files.
- If you changed `SKILL.md`, confirm the front-matter `description` still reflects what the skill covers.

## Code of conduct

Be respectful and constructive in issues and pull requests. Assume good intent and keep discussion focused on the content.

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** that covers this project — see [LICENSE](./LICENSE).
