# CAMPUSIQ Admin ERP Portal — Governance & Academic Administration
### Modern University Executive ERP System for Deans, Registrars & Examination Controllers

CAMPUSIQ Admin ERP is an enterprise-grade university administration portal designed for seamless deployment on **GitHub Pages**, **Netlify**, or any cloud/on-premise server.

---

## 🏛️ Live Deployment in Public Mode on GitHub Pages

When uploaded to GitHub and deployed in public mode with GitHub Pages, this repository serves the **Admin Portal directly on your main public URL** (`index.html`).

### Step-by-Step GitHub Pages Deployment:
1. **Create Repository**: Go to [github.com/new](https://github.com/new), name your repository (e.g. `campusiq-admin-portal`), and set visibility to **Public**.
2. **Upload Files**: Extract this ZIP and drag-and-drop all files into GitHub via **"uploading an existing file"**.
3. **Commit**: Click **Commit changes**.
4. **Enable GitHub Pages**:
   - Go to **Settings** → **Pages** (in the left sidebar).
   - Under *Build and deployment*, set **Source** to `Deploy from a branch`.
   - Set **Branch** to `main` (or `master`) and directory to `/(root)`.
   - Click **Save**.
5. **Live URL**: Within 60 seconds, your Admin Portal is live 24/7 worldwide at:
   `https://<your-username>.github.io/campusiq-admin-portal/`

---

## 🔐 Dean Authentication Credentials

To access the administrative dashboard:
- **Administrator Login Name**: `campusiq`
- **Security Password**: `2026`
- **Authorized Officer**: Dr. Rajeshwar Sen (Dean of Academic Affairs & Controller of Examinations)

*(Note: The login screen enforces strict security with zero auto-login bypass, interactive show/hide password toggle, blank-on-open fields, and explicit mistake reporting).*

---

## 👨‍💼 Key ERP Governance Features

1. **1,000 Enrolled Student Registry (All 4 Engineering Cohorts)**:
   - **First Year (FE)**: 250 Verified Students (Semesters 1 & 2)
   - **Second Year (SE)**: 250 Verified Students (Semesters 3 & 4)
   - **Third Year (TE)**: 250 Verified Students (Semesters 5 & 6)
   - **Fourth Year (BE)**: 250 Verified Students (Semesters 7 & 8)
   - Interactive Cohort Filter Pills: `All Cohorts (1,000)`, `First Year (FE)`, `Second Year (SE)`, `Third Year (TE)`, `Fourth Year (BE)`.
   - Multi-criteria real-time search across student ID, name, email, and branch.
   - CGPA threshold filters (Distinction $\ge$ 7.5 vs Remediation < 7.5).
   - Statutory 75% attendance compliance filters.
   - Tuition fee status filters (Dues Pending vs Cleared).
   - In-place student 360 profile drawer and 1-click CSV ledger export.

2. **Faculty Directory Roster**:
   - Directory of 11 departmental professors across Computer Science, AI & Data Science, IT, Mechanical, Civil, Electrical, and MBA Tech.
   - Includes faculty IDs, cabins, office hours, and high-contrast email contacts.

3. **Notice & Circular Dispatch Center**:
   - Institutional circulars and urgent examination notices.
   - Personal direct notice dispatch to specific roll numbers.

4. **12-Hour SLA Grievance Desk**:
   - Live queue of student tickets with 12-hour SLA response guarantees.

5. **NEXORA AI Copilot**:
   - Right-side slide-over assistant with campus knowledge base.

6. **Balanced High-Contrast Dual Theme**:
   - Crystal-clear Light Mode (`#0F172A`) and pure Obsidian Dark Mode (`#081225`).

---

## 💻 Local Execution

Run locally with Python:
```bash
python server.py
# or
py -3 server.py
```
Open your browser at [http://localhost:8000](http://localhost:8000).

---

## 📄 License & Intellectual Property
&copy; 2026 CAMPUSIQ Collegiate Systems. All institutional records, UI designs, and database schemas protected.
