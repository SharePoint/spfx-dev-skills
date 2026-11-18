# SPFx Dev Skills evaluation results - November 18, 2026

- **Test date:** November 18, 2026
- **Skill version:** v1.1.2, compared with v1.0 and no skill
- **Target:** SharePoint Framework 1.24.1, including React 18 migration

These results summarize the [source article](#source). They measure one SPFx upgrade scenario, not general model performance or every capability of the skill.

## Evaluation setup

- **Task:** Upgrade an existing SPFx project to v1.24.1.
- **Reference:** A newly scaffolded SPFx v1.24.1 project, checking dependencies, configuration and React 18 API changes.
- **Agents:** GitHub Copilot Chat in Visual Studio Code and Claude Code CLI.
- **Operating system:** Windows for every run.
- **Configurations:** No skill, SPFx Dev Skills v1.0 and SPFx Dev Skills v1.1.2.
- **Repetitions:** Five runs per configuration for each of seven agent/model combinations: **7 x 3 x 5 = 105 runs**.

Copilot Fusion is a model router, not an individual model. Its results reflect the routing decisions made during these evaluations.

## Mean upgrade scores

Each value is the mean rubric score across five runs, **not a run pass rate**. The rubric awards partial credit for incomplete upgrades; 100% means all rubric checks were met. A project building successfully is not enough if required dependency or configuration changes are missing.

| Agent | Model or router | No skill | Skill v1.0 | Skill v1.1.2 |
| --- | --- | --- | --- | --- |
| Copilot Chat | Claude Sonnet 5.5 | 47% | 94% | **100%** |
| Copilot Chat | Claude Opus 5.5 | 94% | 94% | **100%** |
| Copilot Chat | GPT-6 Luna | 27% | 93% | **100%** |
| Copilot Chat | GPT-6.1 Terra | 59% | 93% | **98%** |
| Copilot Chat | Copilot Fusion (router) | 32% | 94% | **100%** |
| Claude Code | Claude Sonnet 5.5 | 41% | 94% | **100%** |
| Claude Code | Claude Opus 5.5 | 94% | 94% | **100%** |

## Mean estimated inference cost per run

Each value is the mean estimated inference cost per run reported in the article. These figures are not subscription prices or guarantees of future costs.

| Agent | Model or router | No skill | Skill v1.0 | Skill v1.1.2 |
| --- | --- | --- | --- | --- |
| Copilot Chat | Claude Sonnet 5.5 | $0.49 | $0.23 | **$0.40** |
| Copilot Chat | Claude Opus 5.5 | $1.24 | $0.67 | **$0.82** |
| Copilot Chat | GPT-6 Luna | $0.03 | $0.03 | **$0.03** |
| Copilot Chat | GPT-6.1 Terra | $0.33 | $0.07 | **$0.23** |
| Copilot Chat | Copilot Fusion (router) | $0.01 | $0.01 | **$0.02** |
| Claude Code | Claude Sonnet 5.5 | $0.07 | $0.11 | **$0.16** |
| Claude Code | Claude Opus 5.5 | $0.25 | $0.25 | **$0.32** |

## Key findings

- **Every combination improved over its no-skill baseline.** With v1.1.2, six combinations reached a 100% mean rubric score; GPT-6.1 Terra in Copilot Chat reached 98%.
- **The previous skill already helped substantially.** With v1.0, every combination scored 93% or 94%.
- **Matching scores did not require matching inference costs.** In Copilot Chat with v1.1.2, Copilot Fusion, GPT-6 Luna and Claude Opus 5.5 each scored 100%, at estimated mean costs of $0.02, $0.03 and $0.82 per run respectively.
- **Higher quality did not always mean lower cost.** Compared with v1.0, v1.1.2 increased estimated inference cost in six combinations; GPT-6 Luna's reported cost was unchanged.

## What the evaluations changed

Reviewing the agents' action traces revealed that some generated an upgrade report but read only part of it, leaving required changes unapplied. The updated [upgrade guidance](./plugins/spfx/skills/spfx/references/upgrade.md) explicitly requires reading the entire report through the end of its final `## Summary` section. Setup and upgrade instructions were also simplified during the evaluation iterations.

## Scope and limitations

- These measurements cover **one upgrade scenario on Windows**. They do not establish results for other SPFx tasks, operating systems or host integrations.
- Agents are non-deterministic. Each mean summarizes five runs; the article does not provide per-run distributions or establish statistical significance.
- A rubric score measures the evaluated upgrade requirements, not production readiness or tenant/host certification.
- Costs, model behavior and Fusion routing can change. Equal mean scores here do not imply equal capabilities on other tasks.

## Source

[Announcing SPFx Dev Skills for SPFx 1.24.1](https://devblogs.microsoft.com/microsoft365dev/?p=26499), Microsoft 365 Developer Blog, November 18, 2026.
