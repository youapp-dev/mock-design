# YouApp Product Development Baseline

This guide turns ideas from leadership, clients, and stakeholders into product and design decisions that iOS and Android teams can implement. Every feature should answer four questions. What problem does it solve? What has been agreed? What will developers build? How will QA verify it?

## Roles and decision-making

| Role | Skills | Responsibilities |
| --- | --- | --- |
| Senior Product Manager | Discovery, evidence analysis, prioritization, stakeholder alignment, business rules | Evaluates opportunities, defines scope and success measures, and documents decisions. |
| Senior UI/UX Designer | User flows, interaction design, design systems, accessibility, prototyping, usability testing | Designs flows, states, and recovery paths and defines behavior across platforms. |
| Engineering reviewer | iOS and Android feasibility, APIs, data, estimates | Checks dependencies and platform constraints before handoff. |
| QA reviewer | Test scenarios, interaction testing, regression testing | Verifies acceptance criteria and records results by environment. |

One person can fill both the PM and Designer roles. Assign one decision owner per feature. When stakeholders disagree, the PM documents the options, evidence, trade-offs, and recommendation. The decision owner makes the call. Record the decision, date, and rationale in the spec.

## From idea to release

| Stage | Work | Outcome before moving on |
| --- | --- | --- |
| Intake | Record the source, original request, people affected, problem, and why it matters now. Treat the proposed solution as a hypothesis. | A short brief and an identified decision owner. |
| Validation and prioritization | Review user feedback, data, observations, or business needs. Assess impact, confidence in the evidence, effort, and risk. When evidence is limited, choose the lowest-cost way to test the main assumption. | A decision to proceed, validate further, defer, or close the request, with a rationale. |
| Definition | Agree on the goal, success measures, MVP scope, exclusions, rules, and permissions. Review API and data dependencies and iOS and Android differences with Engineering. | Agreed scope. Open questions have owners and documented impact. |
| Design and prototyping | Use YouApp components. Design the main flow and relevant states, including loading, empty, offline, error, retry, and permission denied. Define Back, cancel, and resume behavior. | Testable flows and states. Platform differences and prototype simulations are documented. |
| Prototype QA | Test from the normal entry point. Run the acceptance criteria, affected actions, recovery paths, and relevant regression checks. Record the platform or browser, build or revision, steps, and results. | **Pass**, **Fail**, or **Untested** results with evidence and any outstanding issues. |
| Handoff and build verification | Hand over the spec, designs, prototype, acceptance criteria, and dependencies. After implementation, repeat the scenarios on iOS and Android builds. | **Ready for Dev** and **Ready for Release** are determined using the criteria below. |

### Ready for Dev

- The scope and core decisions are approved. Implementation blockers are resolved.
- The spec, flows, states, business rules, permissions, and acceptance criteria are available from one page.
- Engineering has reviewed iOS and Android behavior, dependencies, and data and API contracts.
- Testable prototype flows have been verified. Simulated behavior and scenarios that require native builds are documented.

### Ready for Release

- Acceptance criteria and relevant regressions have been checked on iOS and Android builds, with results recorded for each platform.
- Release blockers are resolved. Record any other accepted issues with their decision owner and impact.

## Supporting skills

| Skill | When to use it | How YouApp uses it |
| --- | --- | --- |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Review the visuals once the UX direction is agreed. | Apply hierarchy, consistency, and polish principles that fit YouApp's mobile UI and design system. |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Compare interaction patterns and review designs before QA. | Review states, usability, and accessibility. Evaluate recommendations against the user's context and existing components. |
| [Graphify](https://github.com/Graphify-Labs/graphify) | Trace the impact of changes across routes, documentation, and prototype files. | Start with a code-only map. Verify important relationships directly in the source. |
| [Architecture Review](../SKILLS.md) | Review feature ownership and contracts before an architectural change. | Verify the current behavior, identify the smallest boundary to improve, and validate changes through the prototype entry point. |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Summarize updates, triage, or short decision notes. | Keep the context, rules, and expected results necessary for specs, QA evidence, and handoff. |

Use skills where they fit the stage. Their findings inform the review. The decision owner approves changes to scope or rules, and QA verifies the resulting behavior.

### Set up skills for a fresh checkout

Follow the [skill installation guide](../SKILLS.md) for pinned versions, installation steps, and verification from the repository root.

## Shared context for the team and agents

- [AGENTS.md](../AGENTS.md) is the starting point for working in this repository.
- Use the [feature template](features/_template.md) for new specs. Link an existing PRD if it still applies. Record decision changes in the same spec.
- The approved spec defines behavior and scope. The design and prototype show how it looks and works. The [design system](../design-system/README.md) defines components and tokens.
- The [Claude artifact baseline](../ARTIFACT_BASELINE.md) records the historical benchmark and prototype route ownership. If the spec, design, and prototype differ, the decision owner confirms which behavior applies before handoff.

## First pilot

Use **Group Chat / YouApp Products**. Start by mapping member and admin flows, permissions, text, media, voice messages, voice and video calls, and call history. Confirm scope with the decision owner. Mark simulated prototype features and add native verification to the iOS and Android QA checklist.

The first regression scenario covers voice messages. Open the group from the chat list, scroll to a voice message in the middle of the history, then play, pause, and resume it. The chat stays on the message being viewed. Record the result for each environment. Use the pilot findings to simplify the baseline before applying it to the next feature.
