# Changes

## 1.1.2 — 6 October 2026

- Fixed map leader lines that inherited SVG's default black fill after the click-area change in 1.1.1. Leader paths now declare no fill and a thin muted stroke directly, with matching styles for their new container.
- Used quiet rounded labels and outlined numbered markers; hover and keyboard focus highlight the corresponding connection. Tendon/muscle markers retain their warm accent.
- Hiding anatomical navigation now hides the full label, leader and marker group together. Label and marker click targets remain separate from decorative lines.

## 1.1.1 — 5 October 2026

- Reworked shared local diagrams across all 18 navigation categories: labels occupy separate bands from vessel/texture graphics, and long labels and scope notes wrap within their frames.
- Allowed long author and reference buttons to wrap on narrow screens; improved local-diagram label contrast.
- Corrected the misleading Review entry theme label on cross-topic studies, synchronized the checked two-month R33 experimental context without assigning it to all experiments, and separated actual R95/R96 sites from conclusion limits.
- Cleared stale citation-copy feedback between papers and guarded asynchronous feedback against a changed dialog context.
- Made map label hit areas independent of decorative leader lines, retained separate clickable marker areas and changed interactive-map containers to semantic groups.
- Protected author-name fields from browser translation. Automatic translation of scientific prose can still be inaccurate; this does not constitute a validated translated edition.

## 1.1.0 — 5 October 2026

- Added R95 (mandibular distraction and neural-crest-like cell state) and R96 (dental mesenchymal domains and periodontal differentiation).
- Registered the seven previously separate framework references as F01–F07. There are now 96 main records and seven additional framework sources, 103 independent references in total. Two preprints remain hidden by default.
- Added 16 model-linked claims across seven core papers, with original figure/section locations and explicit review scope. Most other records still await claim-by-claim anchoring.
- Corrected R13/R18 experimental-context labels, R18 donor ages and the scope of its Trpv2-silencing result; added the postnatal P5 tracing context for R02.
- Normalized publisher XML markup in bibliographic titles and corrected a corrupt Crossref title for R12 against PubMed.
- Corrected source-author metadata, including the publisher-order authors of R18 and formal framework bibliography. Crossref and publisher author lists for R18 differ; the publisher/PDF order is used.
- Added ID and DOI-link search, complete bibliographic authors in copied references and exports, transparent reading order, links to specific studies/regions/lenses, and record-specific correction links.
- Added a short focus statement and selection-scope dialog. Allowed reader-directed translation of explanatory text while preserving original titles.
- Published sanitized English structured data, an offline build script and regression checks. No personal notes, grant drafts or unpublished experiments are included.

## 1.0.0 — 5 October 2026

Initial English public edition, based on the Chinese working map: 94 main records, 18 navigation categories and five reading lenses.
