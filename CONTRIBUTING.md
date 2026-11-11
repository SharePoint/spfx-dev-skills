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

- **Be version-accurate.** Target SPFx **1.24.1**, React **18.3.1** and recommended Node **26 LTS** unless another supported target is requested. Reuse [setup.md](./plugins/spfx/skills/spfx/references/setup.md) for environment checks; preserve older/SharePoint Server targets and supported existing Node pins. Heft is required for supported 1.24 builds; existing 1.22/1.23 projects may retain gulp. Inspect the actual configuration (see the [toolchain decision](./plugins/spfx/skills/spfx/SKILL.md#toolchain-decision-rule)).
- **Never invent versions, flags, or APIs.** If a flag or command isn't certain, instruct the agent to discover it (e.g. `--help`) rather than guessing.
- **Prefer non-interactive commands.** Explicit flags only — no reliance on arrow-key prompts.
- **Prefer PnPjs** for ordinary SharePoint/Graph work; preserve the documented brokered-client exception for [Copilot UX components](./plugins/spfx/skills/spfx/references/copilot.md).
- **Require Fluent UI v9 wherever possible.** The Copilot React template includes v9; use it for new/changed UI even when a web-part scaffold starts with v8. Verify peers and document necessary fallbacks; do not force incompatible dependencies. In iframe hosts, validate both Fluent and Griffel document ownership.
- **End with validation.** Guidance should drive toward a clean `npm run build` before a task is considered done.
- **Cross-link** related references instead of duplicating content; keep the router short and detailed guidance on demand.
- Use clear Markdown: short sections, tables for command mappings, fenced code blocks for commands.

## Validating your changes

There is no build step for the skill content itself. Before opening a PR:

- Confirm commands/options against the exact target generator/tool, cite sources and record the verification date. Published CLI coverage can lag SPFx GA.
- Check release-coupled runtime, rig, plugin and lint packages and lockfile resolutions, not just generator metadata. SPFx 1.24.0 scaffolds can retain `1.24.0-rc.0` references; the 1.24.1 baseline must not.
- Check that cross-links resolve to existing files.
- If you changed `SKILL.md`, confirm the front-matter `description` still reflects what the skill covers.
- For behavioral examples, record exact versions, commands/results and actual host checks; identify blocked validation rather than claiming success.
- If visual claims change, update [infographic.html](./assets/infographic.html) and regenerate its 1280x720 [PNG](./assets/infographic.png) together; inspect the rendered result for clipping.

## Code of conduct

Be respectful and constructive in issues and pull requests. Assume good intent and keep discussion focused on the content.

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** that covers this project — see [LICENSE](./LICENSE).
