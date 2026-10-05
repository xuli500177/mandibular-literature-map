# Suggesting a correction

Use **Report a record issue** in a paper card, or open a GitHub issue. Include the record ID, map version, field or claim, proposed correction, and an original source with a figure, result section or bibliographic record where possible.

For missing literature, explain the anatomical site, species/stage, question and evidence that it adds. Coverage is selective; fewer entries do not indicate fewer studies in the field.

The public source of record is `data/atlas.json`; `src/shell.html` contains the interface. Build with `python scripts/build.py` and check with `node scripts/validate.cjs`. Generated `index.html` remains a standalone offline artifact. Change a claim and its model together; regional arrows link to claim IDs through `unitIds`. Never infer ancestry from expression or infer an unmeasured negative outcome from an abstract.

Keep personal notes, unpublished data, project-specific hypotheses and private files out of contributions. Publish original summaries and source links, not publisher figures or full article text. Corrections are reviewed before release.
