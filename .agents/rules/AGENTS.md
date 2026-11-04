# Project Agent Instructions

## General Rules

- **Do not modify any documents in the .agents directory.** Require the operator to make manual changes to the documentation provided in the .agents directory. You may propose changes to the docuentation providd in the .agents directory but you are not allowed to write to the documentation directly.
- Follow existing project conventions and architecture.
- Do not introduce unnecessary dependencies.
- Preserve backward compatibility unless explicitly authorized.

## Specialized Instructions

Consult the following documents when performing relevant tasks:

| Task | Reference |
|---|---|
| Python development and execution | `.agents/python.md` |
| REST API development and integration | `.agents/api.md` |
| Frontend development | `.agents/design.md` |

- Consult only the references relevant to the current task.
- If a task spans multiple areas, consult all applicable references.
- Specialized instructions supplement these general rules.
- If instructions conflict, stop and report the conflict rather than arbitrarily choosing one.