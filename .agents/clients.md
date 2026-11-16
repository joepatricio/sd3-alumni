# Client Sources: USJ-R Engineering Alumni (2024+)

- **Objective**: Identify public sources of recent graduates (2024+) to curate a candidate roster for human-led early tester recruitment and feedback.
- **Scope**: USJ-R School of Engineering & Architecture (SEA), 2024 graduates and above.
- **Note**: Strictly public data used. Names identified are from public congratulatory, graduation, and organizational posts.

---

## 1. Operational Scope & Agent Boundaries

> [!IMPORTANT]
> **Hard Limit on Agent Autonomy**:
> - **Agent Scope**: Purely passive research, documentation, structured data collation, and workflow automation.
> - **Zero Contact**: Agents **never** perform cold outreach, direct messaging, emailing, or scraping of private/restricted channels.
> - **Human Responsibility**: Outreach, communication, obtaining explicit consent, and conducting user feedback sessions are handled exclusively by human operators.

---

## 2. Public Source Groups

| Source Group | Identification Method & Role | Research Purpose |
| --- | --- | --- |
| **USJ-R SEA Board Passer Posts** | Official public congratulatory graphics | Primary public proof for 2024+ alumni across engineering disciplines, batch identification |
| **FORWARD Commencement Posts** | Batch confirmation, program identification via stole color (Orange = Engineering) | Verification of graduation year and candidate pool validation |
| **Individual Graduate Posts** | Public celebratory / graduation posts | Target pool for human review and manual outreach |

---

## 3. Privacy & Compliance Clause

- **Public Sourcing Only**: All sources must be publicly accessible posts.
- **No Inferred Consent**: Do NOT use these posts as consent to publish in the directory or live platform.
- **Strict Contact Boundaries**: Do not harvest or scrape phone numbers, private emails, or private group chat (GC) info.
- **Visual Cue**: Orange stole = Engineering identifier in USJ-R commencement posts.
- **Human-in-the-Loop Consent**: Full participant entry into directory/testing systems requires explicit opt-in obtained directly by human operators.

---

## 4. Suggested Sources to Check

### General & Institutional Pages
- [USJ-R School of Engineering (Official)](https://www.facebook.com/usjr.ec/) – For departmental recognition, board passer posts (EE, ECE, ME, IE, CE, CpE), and academic honors.
- [FORWARD Publications USJ-R](https://www.facebook.com/forwardpublications) – For commencement coverage, valedictorian / cum laude features, and graduation photo galleries.
- [Professional Regulation Commission (PRC) Official Board Results](https://www.prc.gov.ph/) – For official board passer masterlists.

### Departmental & Student Chapters
- [USJ-R Engineering Musical Society (EMS)](https://www.facebook.com/USJREMS/) – Photo albums / member features.
- [Philippine Society of Mechanical Engineers - USJ-R Student Unit (PSME)](https://www.facebook.com/psimusjr/) – ME alumni and board passer recognition.
- [Philippine Institute of Civil Engineers - USJ-R Student Chapter (PICE)](https://www.facebook.com/piceusjrchptr/) – Civil Engineering graduates and board passers.
- [Institute of Integrated Electrical Engineers - USJ-R (IIEE)](https://www.facebook.com/iiee.org/) – Electrical Engineering graduates and passer lists.
- [Institute of Electronics Engineers of the Philippines - USJ-R (IECEP)](https://www.facebook.com/usjr.iecep/) – Electronics Engineering alumni.
- [Computer Engineering Society - USJ-R (CoMES)](https://www.facebook.com/usjrcomes/) – Computer Engineering graduates.
- [Industrial Engineering Joint Organization of United Talented Students (IE JOINTS)](https://www.facebook.com/usjrIEJOINTS/) – Industrial Engineering alumni.

---

## 5. Research Output Format (`directory.csv`)

Curated candidates and outreach statuses are tracked in [`directory.csv`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/docs/95/directory.csv) following the schema:

```csv
Name,Batch,Program,Contact Point,Date Contacted,Status
```

### Field Definitions:
- **`Name`**: Full name identified from public sources (congratulatory/graduation posts, passer lists).
- **`Batch`**: Graduation year or board exam cycle (e.g., `2024`, `Nov 2024 CE`, or `N/A` if unconfirmed).
- **`Program`**: Degree program (e.g., `BSCE`, `BSCpE`, `BSEE`, `BSECE`, `BSIE`, `BSME`).
- **`Contact Point`**: Public profile link or reference URL used by the human operator for manual contact (or `N/A`).
- **`Date Contacted`**: Date when the human operator conducted outreach (`MM/DD/YYYY` or `N/A`).
- **`Status`**: Current engagement status maintained by the human operator (e.g., `Pending`, `Contacted`, `Testing`, `Declined`, `N/A`).