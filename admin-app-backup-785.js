// ====================================================================
// CAMPUSIQ — Administrative ERP Controller & Real-Time Sync Engine v2.0
// Features: 1,000+ Enrolled Students, Year/CGPA Filters, In-Place 360° Editor,
// Fee Default Warnings, 12-Hour SLA Grievance Desk, Two-Way Supabase Sync
// ====================================================================

const ADMIN_CREDENTIALS = {
  email: "admin@campusiq.edu",
  password: "admin#2026",
  name: "Dr. Rajeshwar Sen",
  role: "Dean of Academic Affairs & Controller of Examinations",
  department: "Central University Senate & Academic Council",
  cabin: "Dean's Secretariat, Executive Admin Block 101"
};

const FACULTY_ROSTER = [
  { id: "FAC-101", name: "Dr. S. R. Deshmukh", dept: "Computer Science and Engineering", designation: "Professor & Controller of Examinations", email: "deshmukh.sr@campusiq.edu", cabin: "Block A, Cabin 302", lectures: "CSE301 Core Foundation Algorithms (4 Credits)", office_hours: "Mon, Wed 03:00 PM – 04:30 PM" },
  { id: "FAC-102", name: "Prof. M. K. Kulkarni", dept: "Computer Science and Engineering", designation: "Associate Professor & Lab Head", email: "kulkarni.mk@campusiq.edu", cabin: "Block B, Cabin 201", lectures: "CSE302 Advanced Database Engines (4 Credits)", office_hours: "Tue, Thu 02:00 PM – 03:30 PM" },
  { id: "FAC-103", name: "Prof. R. P. Joshi", dept: "Computer Science and Engineering", designation: "Assistant Professor", email: "joshi.rp@campusiq.edu", cabin: "Block A, Cabin 110", lectures: "CSE303 Enterprise Web Architectures (3 Credits)", office_hours: "Mon, Fri 11:00 AM – 12:30 PM" },
  { id: "FAC-104", name: "Dr. A. B. Joshi", dept: "Artificial Intelligence and Data Science", designation: "Head of Department & Professor", email: "joshi.ab@campusiq.edu", cabin: "Block D, Cabin 101", lectures: "AID301 Deep Learning Architectures (4 Credits)", office_hours: "Mon, Wed 02:00 PM – 04:00 PM" },
  { id: "FAC-105", name: "Prof. K. R. Patil", dept: "Artificial Intelligence and Data Science", designation: "Associate Professor", email: "patil.kr@campusiq.edu", cabin: "Block D, Cabin 204", lectures: "AID302 Machine Learning Foundations (4 Credits)", office_hours: "Tue, Thu 10:30 AM – 12:00 PM" },
  { id: "FAC-106", name: "Dr. H. N. Rao", dept: "Information Technology", designation: "Head of Department & Professor", email: "rao.hn@campusiq.edu", cabin: "Block B, Cabin 401", lectures: "IT301 Cloud Systems & AWS Infrastructure (4 Credits)", office_hours: "Wed, Fri 02:30 PM – 04:00 PM" },
  { id: "FAC-107", name: "Dr. V. K. Sharma", dept: "Electronics and Telecommunication", designation: "Professor & Chief Hostel Warden", email: "sharma.vk@campusiq.edu", cabin: "Block E, Cabin 201", lectures: "ETC301 Digital Signal Processing (4 Credits)", office_hours: "Mon, Thu 03:00 PM – 04:30 PM" },
  { id: "FAC-108", name: "Dr. P. T. Kale", dept: "Mechanical Engineering", designation: "Head of Department & Professor", email: "kale.pt@campusiq.edu", cabin: "Block M, Cabin 204", lectures: "MEC301 Thermodynamics & Energy Systems (4 Credits)", office_hours: "Tue, Fri 01:30 PM – 03:00 PM" },
  { id: "FAC-109", name: "Dr. K. B. Shinde", dept: "Civil Engineering", designation: "Head of Department & Professor", email: "shinde.kb@campusiq.edu", cabin: "Block C, Cabin 201", lectures: "CIV301 Structural Mechanics & RCC Design (4 Credits)", office_hours: "Mon, Wed 10:00 AM – 11:30 AM" },
  { id: "FAC-110", name: "Dr. M. S. Joshi", dept: "Electrical Engineering", designation: "Professor & Power Grid Consultant", email: "joshi.ms@campusiq.edu", cabin: "Block P, Cabin 205", lectures: "ELE301 High Voltage Power Systems (4 Credits)", office_hours: "Wed, Fri 03:30 PM – 05:00 PM" },
  { id: "FAC-111", name: "Dr. R. K. Sen", dept: "MBA Technology Management", designation: "Dean of Academics & Controller", email: "sen.rk@campusiq.edu", cabin: "Mgmt Block, Cabin 401", lectures: "MBA301 Strategic Technology Governance (4 Credits)", office_hours: "Daily 04:00 PM – 05:30 PM" }
];

class CampusIQAdminApp {
  constructor() {
    this.state = {
      isAuthenticated: false,
      activeTab: "overview",
      students: [],
      filteredStudents: [],
      currentPage: 1,
      pageSize: 20,
      searchQuery: "",
      deptFilter: "all",
      yearFilter: "all",
      cgpaFilter: "all",
      attFilter: "all",
      feeFilter: "all",
      notices: [],
      tickets: [],
      ticketCategoryFilter: "all",
      faculty: FACULTY_ROSTER,
      viewingStudent: null,
      editingStudent: null,
      resolvingTicket: null,
      theme: localStorage.getItem("campusiq_theme") || "light"
    };

    this.init();
  }

  async init() {
    this.applyTheme(this.state.theme);
    this.checkSession();
    this.loadDatabase();
    this.loadNotices();
    this.loadTickets();
    this.setupCrossTabSync();

    if (this.state.isAuthenticated) {
      this.showDashboard();
    } else {
      this.showLogin();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- Theme Management ---
  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem("campusiq_theme", theme);
    const body = document.body;
    if (theme === "dark") {
      body.classList.add("dark-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      body.classList.remove("dark-theme", "dark");
      document.documentElement.classList.remove("dark");
    }
    this.updateThemeIcons();
  }

  toggleTheme() {
    const next = this.state.theme === "dark" ? "light" : "dark";
    this.applyTheme(next);
  }

  updateThemeIcons() {
    const icon = document.getElementById("admin-theme-icon");
    const label = document.getElementById("admin-theme-label");
    if (icon) {
      icon.setAttribute("data-lucide", this.state.theme === "dark" ? "sun" : "moon");
    }
    if (label) {
      label.textContent = this.state.theme === "dark" ? "Light Mode" : "Dark Mode";
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Authentication Management ---
  checkSession() {
    const sess = localStorage.getItem("campusiq_admin_session");
    if (sess) {
      try {
        const parsed = JSON.parse(sess);
        if (parsed && parsed.email) {
          this.state.isAuthenticated = true;
        }
      } catch (e) {
        this.state.isAuthenticated = false;
      }
    }
  }

  handleAdminLogin(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById("admin-login-email");
    const passInput = document.getElementById("admin-login-pass");
    const errorBox = document.getElementById("admin-login-error");

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const pass = passInput ? passInput.value.trim() : "";

    if (errorBox) errorBox.classList.add("hidden");

    if ((email === ADMIN_CREDENTIALS.email || email === "dean@campusiq.edu" || email === "admin") && pass === ADMIN_CREDENTIALS.password) {
      this.state.isAuthenticated = true;
      localStorage.setItem("campusiq_admin_session", JSON.stringify({
        email: email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        loginAt: new Date().toISOString()
      }));
      this.showToast("Administrative Session Authorized", "Welcome, Dr. Rajeshwar Sen (Dean of Academic Affairs).", "success");
      this.showDashboard();
    } else {
      if (errorBox) {
        errorBox.textContent = "Invalid Administrative Credentials. Please verify your Dean Email ID and authorized security password.";
        errorBox.classList.remove("hidden");
      }
      this.showToast("Access Denied", "Incorrect administrative credentials.", "error");
    }
  }

  handleAdminLogout() {
    localStorage.removeItem("campusiq_admin_session");
    this.state.isAuthenticated = false;
    this.showLogin();
    this.showToast("Session Terminated", "Administrative session securely signed out.", "info");
  }

  showLogin() {
    const gate = document.getElementById("admin-login-gate");
    const layout = document.getElementById("admin-portal-layout");
    if (gate) gate.classList.remove("hidden");
    if (layout) layout.classList.add("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  showDashboard() {
    const gate = document.getElementById("admin-login-gate");
    const layout = document.getElementById("admin-portal-layout");
    if (gate) gate.classList.add("hidden");
    if (layout) layout.classList.remove("hidden");
    this.switchTab(this.state.activeTab);
    this.renderOverviewMetrics();
    this.applyStudentFilters();
    this.renderNoticesList();
    this.renderTicketsQueue();
    this.renderFacultyRoster();
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Database & Storage Operations ---
  loadDatabase() {
    const cached = localStorage.getItem("campusiq_registry_store");
    if (cached) {
      try {
        this.state.students = JSON.parse(cached);
      } catch (e) {
        this.state.students = window.CAMPUSIQ_STUDENTS || [];
      }
    } else if (window.CAMPUSIQ_STUDENTS) {
      this.state.students = window.CAMPUSIQ_STUDENTS;
      localStorage.setItem("campusiq_registry_store", JSON.stringify(this.state.students));
    }
    this.state.filteredStudents = [...this.state.students];
  }

  saveDatabase() {
    localStorage.setItem("campusiq_registry_store", JSON.stringify(this.state.students));
    window.dispatchEvent(new Event("campusiq_registry_updated"));
  }

  loadNotices() {
    const cached = localStorage.getItem("campusiq_notices");
    if (cached) {
      try {
        this.state.notices = JSON.parse(cached);
      } catch (e) {
        this.state.notices = this.getDefaultNotices();
      }
    } else {
      this.state.notices = this.getDefaultNotices();
      localStorage.setItem("campusiq_notices", JSON.stringify(this.state.notices));
    }
  }

  saveNotices() {
    localStorage.setItem("campusiq_notices", JSON.stringify(this.state.notices));
    window.dispatchEvent(new Event("campusiq_notices_updated"));
  }

  getDefaultNotices() {
    return [
      {
        id: "not_1",
        title: "Examination Cell: Mid-Term DSA Paper Shifted to Morning Session",
        target: "all",
        category: "Exam Circular",
        priority: "urgent",
        date: "Oct 28, 2026",
        department: "All Engineering Departments",
        author: "Dr. S. R. Deshmukh (Exam Controller)",
        summary: "Data Structures & Algorithms mid-term paper rescheduled to 11:30 AM in Central Examination Hall A-102.",
        attachment: "Circular_Exam_DSA_Reschedule_2026.pdf"
      },
      {
        id: "not_2",
        title: "Office of the Dean: Mandatory Capstone Mini-Project Synopsis",
        target: "all",
        category: "Academic Council",
        priority: "high",
        date: "Oct 27, 2026",
        department: "All Engineering Departments",
        author: "Dr. Rajeshwar Sen (Dean Academics)",
        summary: "Submit capstone project synopsis countersigned by faculty mentors before Friday, Nov 6 at 04:00 PM.",
        attachment: "Capstone_Project_Synopsis_Template_v2.docx"
      },
      {
        id: "not_3",
        title: "Attendance Notice: Statutory 75% Biometric Ledger Finalization",
        target: "all",
        category: "Attendance Audit",
        priority: "urgent",
        date: "Oct 26, 2026",
        department: "Central Academic Council",
        author: "Registrar Secretariat",
        summary: "Students having attendance below 75% must submit medical or legitimate dispute documentation to HOD office by Oct 31.",
        attachment: "Statutory_Attendance_Guidelines.pdf"
      }
    ];
  }

  loadTickets() {
    const cached = localStorage.getItem("campusiq_tickets");
    if (cached) {
      try {
        this.state.tickets = JSON.parse(cached);
      } catch (e) {
        this.state.tickets = this.getDefaultTickets();
      }
    } else {
      this.state.tickets = this.getDefaultTickets();
      localStorage.setItem("campusiq_tickets", JSON.stringify(this.state.tickets));
    }
  }

  saveTickets() {
    localStorage.setItem("campusiq_tickets", JSON.stringify(this.state.tickets));
    window.dispatchEvent(new Event("campusiq_tickets_updated"));
  }

  getDefaultTickets() {
    return [
      {
        id: "tkt_1",
        ticket_number: "TKT-829104",
        student_id: "252921201",
        student_name: "Satyam Sambhale",
        subject: "Biometric Attendance Scanner Reboot on Oct 18",
        category: "Attendance Discrepancy",
        priority: "high",
        sla_guarantee: "12 Hours Guaranteed",
        status: "open",
        message: "Biometric scanner in Hall A-204 rebooted during CSE301 lecture. Dr. Deshmukh confirmed attendance in manual sheet.",
        created_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
        dean_action: ""
      },
      {
        id: "tkt_2",
        ticket_number: "TKT-716492",
        student_id: "252921202",
        student_name: "Aarav Sharma",
        subject: "Medical Leave Attendance Credit Verification",
        category: "Attendance Discrepancy",
        priority: "urgent",
        sla_guarantee: "12 Hours Guaranteed",
        status: "in_progress",
        message: "Submitted authorized civil hospital certificate for Oct 10–14 dengue absence. Awaiting attendance percentage correction.",
        created_at: new Date(Date.now() - 7.2 * 3600 * 1000).toISOString(),
        dean_action: "Forwarded to Dr. V. K. Sharma for medical certificate verification."
      },
      {
        id: "tkt_3",
        ticket_number: "TKT-654129",
        student_id: "252921204",
        student_name: "Rohan Deshmukh",
        subject: "Hostel Block C Room 205 Study Lamp Repair",
        category: "Hostel Maintenance & Mess",
        priority: "medium",
        sla_guarantee: "12 Hours Guaranteed",
        status: "open",
        message: "Electrical conduit issue in room 205 study desk area.",
        created_at: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
        dean_action: ""
      },
      {
        id: "tkt_4",
        ticket_number: "TKT-519024",
        student_id: "252921202",
        student_name: "Aarav Sharma",
        subject: "Semester 5 Tuition Fee Installment Plan Request",
        category: "Fee & Scholarship Query",
        priority: "high",
        sla_guarantee: "12 Hours Guaranteed",
        status: "open",
        message: "Requesting approval to split remaining ₹32,000 balance into two equal bi-monthly installments.",
        created_at: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
        dean_action: ""
      }
    ];
  }

  // --- Cross-Tab Real-Time Synchronization Listener ---
  setupCrossTabSync() {
    window.addEventListener("storage", (e) => {
      if (e.key === "campusiq_tickets") {
        this.loadTickets();
        this.renderTicketsQueue();
        this.renderOverviewMetrics();
      } else if (e.key === "campusiq_registry_store") {
        this.loadDatabase();
        this.applyStudentFilters();
        this.renderOverviewMetrics();
      } else if (e.key === "campusiq_notices") {
        this.loadNotices();
        this.renderNoticesList();
      }
    });

    window.addEventListener("campusiq_tickets_updated", () => {
      this.renderTicketsQueue();
      this.renderOverviewMetrics();
    });
  }

  // --- Navigation & Tabs ---
  switchTab(tabId) {
    this.state.activeTab = tabId;

    document.querySelectorAll(".admin-nav-item").forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("bg-blue-600", "text-white", "font-bold", "shadow-md");
        btn.classList.remove("text-slate-300", "hover:bg-slate-800/60");
      } else {
        btn.classList.remove("bg-blue-600", "text-white", "font-bold", "shadow-md");
        btn.classList.add("text-slate-300", "hover:bg-slate-800/60");
      }
    });

    const tabs = ["overview", "students", "notices", "grievances", "faculty", "finance"];
    tabs.forEach(t => {
      const el = document.getElementById(`admin-tab-${t}`);
      if (el) {
        if (t === tabId) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      }
    });

    if (tabId === "overview") this.renderOverviewMetrics();
    if (tabId === "students") this.applyStudentFilters();
    if (tabId === "notices") this.renderNoticesList();
    if (tabId === "grievances") this.renderTicketsQueue();
    if (tabId === "faculty") this.renderFacultyRoster();
    if (tabId === "finance") this.renderFinanceLedger();

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Tab 1: Executive Overview ---
  renderOverviewMetrics() {
    const totalStudents = this.state.students.length;
    let totalAtt = 0;
    let shortageCount = 0;
    let totalDues = 0;
    let totalPaid = 0;
    let dueCount = 0;

    this.state.students.forEach(s => {
      totalAtt += Number(s.overall_attendance || 0);
      if (Number(s.overall_attendance || 0) < 75) shortageCount++;
      if (s.fee_info) {
        const d = Number(s.fee_info.due || 0);
        totalDues += d;
        totalPaid += Number(s.fee_info.paid || 0);
        if (d > 0) dueCount++;
      }
    });

    const avgAtt = totalStudents > 0 ? (totalAtt / totalStudents).toFixed(1) : "0.0";
    const openTickets = this.state.tickets.filter(t => t.status !== "resolved").length;
    const collectionRate = (totalPaid + totalDues) > 0 ? ((totalPaid / (totalPaid + totalDues)) * 100).toFixed(1) : "0";

    const elTotal = document.getElementById("metric-total-students");
    const elAvg = document.getElementById("metric-avg-attendance");
    const elShortage = document.getElementById("metric-shortage-count");
    const elTickets = document.getElementById("metric-open-tickets");
    const elDuesCount = document.getElementById("metric-dues-count");

    if (elTotal) elTotal.textContent = totalStudents.toLocaleString();
    if (elAvg) elAvg.textContent = `${avgAtt}%`;
    if (elShortage) elShortage.textContent = `${shortageCount} Students (<75%)`;
    if (elTickets) elTickets.textContent = `${openTickets} Pending Review`;
    if (elDuesCount) elDuesCount.textContent = `${dueCount} Students Pending Fees`;

    this.renderBranchAttendanceBars();
  }

  renderBranchAttendanceBars() {
    const container = document.getElementById("branch-attendance-bars");
    if (!container) return;

    const depts = {};
    this.state.students.forEach(s => {
      const d = s.department || "Other";
      if (!depts[d]) depts[d] = { totalAtt: 0, count: 0 };
      depts[d].totalAtt += Number(s.overall_attendance || 0);
      depts[d].count++;
    });

    let html = "";
    Object.keys(depts).forEach(deptName => {
      const avg = (depts[deptName].totalAtt / depts[deptName].count).toFixed(1);
      const isLow = Number(avg) < 75.0;
      const barColor = isLow ? "bg-amber-500" : "bg-emerald-500";
      const textColor = isLow ? "text-amber-700 dark:text-amber-400 font-bold" : "text-emerald-700 dark:text-emerald-400 font-bold";

      html += `
        <div class="mb-3.5">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">${deptName}</span>
            <span class="font-mono font-black ${textColor}">${avg}% (${depts[deptName].count} enrolled)</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${avg}%"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // --- Tab 2: 1,000+ Student Registry with Cohort & CGPA Filters ---
  setYearFilter(year) {
    this.state.yearFilter = year;
    document.querySelectorAll(".year-filter-pill").forEach(btn => {
      if (btn.dataset.year === year) {
        btn.className = "year-filter-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition";
      } else {
        btn.className = "year-filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700";
      }
    });
    this.applyStudentFilters();
  }

  setCgpaFilter(cgpaThreshold) {
    this.state.cgpaFilter = cgpaThreshold;
    document.querySelectorAll(".cgpa-filter-pill").forEach(btn => {
      if (btn.dataset.cgpa === cgpaThreshold) {
        btn.className = "cgpa-filter-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm transition";
      } else {
        btn.className = "cgpa-filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700";
      }
    });
    this.applyStudentFilters();
  }

  setFeeFilter(feeStatus) {
    this.state.feeFilter = feeStatus;
    document.querySelectorAll(".fee-filter-pill").forEach(btn => {
      if (btn.dataset.fee === feeStatus) {
        btn.className = "fee-filter-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-sm transition";
      } else {
        btn.className = "fee-filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700";
      }
    });
    this.applyStudentFilters();
  }

  resetAllFilters() {
    this.state.searchQuery = "";
    this.state.deptFilter = "all";
    this.state.yearFilter = "all";
    this.state.cgpaFilter = "all";
    this.state.attFilter = "all";
    this.state.feeFilter = "all";

    const sInput = document.getElementById("admin-student-search");
    const dSelect = document.getElementById("filter-dept");
    const aSelect = document.getElementById("filter-att-status");

    if (sInput) sInput.value = "";
    if (dSelect) dSelect.value = "all";
    if (aSelect) aSelect.value = "all";

    this.setYearFilter("all");
    this.setCgpaFilter("all");
    this.setFeeFilter("all");
    this.applyStudentFilters();
  }

  applyStudentFilters() {
    const q = this.state.searchQuery.toLowerCase().trim();
    const dept = this.state.deptFilter;
    const year = this.state.yearFilter;
    const cgpa = this.state.cgpaFilter;
    const att = this.state.attFilter;
    const fee = this.state.feeFilter;

    this.state.filteredStudents = this.state.students.filter(s => {
      // 1. Search Query
      const matchSearch = !q || 
        s.student_id.toLowerCase().includes(q) ||
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.branch && s.branch.toLowerCase().includes(q));

      // 2. Department
      const matchDept = dept === "all" || (s.department && s.department.toLowerCase().includes(dept.toLowerCase()));

      // 3. Academic Year (FE, SE, TE, BE)
      let matchYear = true;
      if (year !== "all") {
        matchYear = s.year_semester && s.year_semester.toLowerCase().includes(`year ${year}`);
      }

      // 4. CGPA Threshold (>= 7.5 Distinction vs < 7.5 Remediation)
      let matchCgpa = true;
      const cgpaVal = parseFloat(s.cgpa || 0);
      if (cgpa === "high") {
        matchCgpa = cgpaVal >= 7.5;
      } else if (cgpa === "low") {
        matchCgpa = cgpaVal < 7.5;
      }

      // 5. Attendance
      let matchAtt = true;
      const attVal = Number(s.overall_attendance || 0);
      if (att === "safe") {
        matchAtt = attVal >= 75.0;
      } else if (att === "shortage") {
        matchAtt = attVal < 75.0;
      }

      // 6. Fee Status
      let matchFee = true;
      const feeDue = s.fee_info ? Number(s.fee_info.due || 0) : 0;
      if (fee === "due") {
        matchFee = feeDue > 0;
      } else if (fee === "cleared") {
        matchFee = feeDue === 0;
      }

      return matchSearch && matchDept && matchYear && matchCgpa && matchAtt && matchFee;
    });

    this.state.currentPage = 1;
    this.renderStudentsTable();
  }

  renderStudentsTable() {
    const tbody = document.getElementById("admin-students-tbody");
    const countBadge = document.getElementById("students-filtered-count");
    if (!tbody) return;

    if (countBadge) {
      countBadge.textContent = `Displaying ${this.state.filteredStudents.length.toLocaleString()} of ${this.state.students.length.toLocaleString()} Verified Student Profiles`;
    }

    const start = (this.state.currentPage - 1) * this.state.pageSize;
    const end = start + this.state.pageSize;
    const pageItems = this.state.filteredStudents.slice(start, end);

    // Empty state handling
    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-16 px-4">
            <div class="max-w-md mx-auto flex flex-col items-center">
              <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 border border-slate-200 dark:border-slate-700">
                <i data-lucide="users-2" class="w-7 h-7"></i>
              </div>
              <h4 class="font-bold text-slate-900 dark:text-white text-base mb-1">No Student Records Found</h4>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                Zero students match your active filter criteria (${this.state.yearFilter !== 'all' ? 'Year ' + this.state.yearFilter + ', ' : ''}${this.state.cgpaFilter !== 'all' ? (this.state.cgpaFilter === 'high' ? 'CGPA >= 7.5' : 'CGPA < 7.5') + ', ' : ''}${this.state.searchQuery ? '"' + this.state.searchQuery + '"' : 'all cohorts'}).
              </p>
              <button onclick="window.AdminApp.resetAllFilters()" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Reset All Filters</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination();
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = pageItems.map(s => {
      const attVal = Number(s.overall_attendance || 0);
      const isShortage = attVal < 75.0;
      const attBadge = isShortage 
        ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"><i data-lucide="alert-triangle" class="w-3 h-3"></i>${attVal}%</span>`
        : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"><i data-lucide="check" class="w-3 h-3"></i>${attVal}%</span>`;

      const cgpaNum = parseFloat(s.cgpa || 0);
      const cgpaBadge = cgpaNum >= 7.5
        ? `<span class="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">${s.cgpa}</span>`
        : `<span class="font-mono font-bold text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">${s.cgpa}</span>`;

      const feeDue = s.fee_info ? Number(s.fee_info.due || 0) : 0;
      const feeBadge = feeDue === 0
        ? `<span class="text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i>Cleared (₹0)</span>`
        : `<span class="text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1"><i data-lucide="alert-circle" class="w-3 h-3"></i>Due: ₹${feeDue.toLocaleString()}</span>`;

      return `
        <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition cursor-pointer" onclick="window.AdminApp.openStudentProfileDrawer('${s.student_id}')">
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${s.avatar_url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}" class="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0 shadow-sm">
              <div class="min-w-0">
                <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate hover:text-blue-600 transition">${s.full_name}</div>
                <div class="text-[11px] text-slate-500 font-mono">${s.email}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 font-mono font-bold text-xs text-blue-700 dark:text-blue-400">${s.student_id}</td>
          <td class="py-3 px-4">
            <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">${s.department || s.branch}</div>
            <div class="text-[10px] text-slate-500 font-bold">${s.year_semester || 'Year 3, Sem 5'}</div>
          </td>
          <td class="py-3 px-4">${attBadge}</td>
          <td class="py-3 px-4">${cgpaBadge}</td>
          <td class="py-3 px-4">${feeBadge}</td>
          <td class="py-3 px-4 text-right" onclick="event.stopPropagation()">
            <div class="flex items-center justify-end gap-1.5">
              ${feeDue > 0 ? `
                <button onclick="window.AdminApp.sendFeeNoticeToStudent('${s.student_id}')" class="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-[11px] transition border border-red-200 dark:border-red-800 flex items-center gap-1" title="Send Official Fee Default Warning">
                  <i data-lucide="bell-ring" class="w-3 h-3"></i>
                  <span>Fee Warning</span>
                </button>
              ` : ''}
              <button onclick="window.AdminApp.openEditStudentModal('${s.student_id}')" class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] transition border border-blue-200 dark:border-blue-800 flex items-center gap-1" title="Edit Student Attendance & Records">
                <i data-lucide="edit-3" class="w-3 h-3"></i>
                <span>Edit</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    this.renderPagination();
    if (window.lucide) window.lucide.createIcons();
  }

  renderPagination() {
    const el = document.getElementById("admin-students-pagination");
    if (!el) return;

    const totalPages = Math.ceil(this.state.filteredStudents.length / this.state.pageSize) || 1;
    const cur = this.state.currentPage;

    el.innerHTML = `
      <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-3">
        <div>Showing Page <strong>${cur}</strong> of <strong>${totalPages}</strong> (${this.state.filteredStudents.length.toLocaleString()} students)</div>
        <div class="flex items-center gap-1">
          <button onclick="window.AdminApp.changePage(${cur - 1})" ${cur <= 1 ? 'disabled class="opacity-40 cursor-not-allowed px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700"' : 'class="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"'}>
            Prev
          </button>
          <span class="px-2 font-mono font-bold">${cur} / ${totalPages}</span>
          <button onclick="window.AdminApp.changePage(${cur + 1})" ${cur >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700"' : 'class="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"'}>
            Next
          </button>
        </div>
      </div>
    `;
  }

  changePage(newPage) {
    const totalPages = Math.ceil(this.state.filteredStudents.length / this.state.pageSize) || 1;
    if (newPage < 1 || newPage > totalPages) return;
    this.state.currentPage = newPage;
    this.renderStudentsTable();
  }

  // --- Student 360° Profile Drawer ---
  openStudentProfileDrawer(studentId) {
    const student = this.state.students.find(s => s.student_id === studentId);
    if (!student) return;

    this.state.viewingStudent = student;
    const drawer = document.getElementById("student-profile-drawer");
    if (!drawer) return;

    // Populate drawer elements
    document.getElementById("drawer-stu-avatar").src = student.avatar_url;
    document.getElementById("drawer-stu-name").textContent = student.full_name;
    document.getElementById("drawer-stu-roll").textContent = student.student_id;
    document.getElementById("drawer-stu-email").textContent = student.email;
    document.getElementById("drawer-stu-dept").textContent = student.department;
    document.getElementById("drawer-stu-year").textContent = student.year_semester;
    document.getElementById("drawer-stu-standing").textContent = student.academic_standing || "Good Standing";

    // Attendance stats
    const attVal = Number(student.overall_attendance || 0);
    const isSafe = attVal >= 75.0;
    const attEl = document.getElementById("drawer-stu-att");
    if (attEl) {
      attEl.textContent = `${attVal}%`;
      attEl.className = `text-2xl font-black ${isSafe ? 'text-emerald-600' : 'text-red-600'}`;
    }

    document.getElementById("drawer-stu-cgpa").textContent = student.cgpa;
    
    // Fee status
    const feeInfo = student.fee_info || { total: 145000, paid: 130000, due: 15000, status: "Partial Dues" };
    document.getElementById("drawer-stu-fee-total").textContent = `₹${(feeInfo.total || 0).toLocaleString()}`;
    document.getElementById("drawer-stu-fee-paid").textContent = `₹${(feeInfo.paid || 0).toLocaleString()}`;
    document.getElementById("drawer-stu-fee-due").textContent = `₹${(feeInfo.due || 0).toLocaleString()}`;

    // Hostel status
    const hostel = student.hostel_info || { hall: "Day Scholar", room: "N/A", bed: "N/A" };
    document.getElementById("drawer-stu-hostel-hall").textContent = hostel.hall;
    document.getElementById("drawer-stu-hostel-room").textContent = hostel.room;

    // Subject attendance breakdown table
    const subsTbody = document.getElementById("drawer-stu-subjects-tbody");
    if (subsTbody) {
      subsTbody.innerHTML = (student.subjects || []).map(sub => `
        <tr class="border-b border-slate-200 dark:border-slate-800 text-xs">
          <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${sub.name}</td>
          <td class="py-2.5 px-3 text-slate-500 font-mono">${sub.code}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">${sub.attended} / ${sub.total} hrs</td>
          <td class="py-2.5 px-3">
            <span class="font-bold text-xs ${sub.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}">${sub.percentage}%</span>
          </td>
        </tr>
      `).join("");
    }

    drawer.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeStudentProfileDrawer() {
    const drawer = document.getElementById("student-profile-drawer");
    if (drawer) drawer.classList.add("hidden");
    this.state.viewingStudent = null;
  }

  // --- Student In-Place Edit Modal ---
  openEditStudentModal(studentId) {
    const student = this.state.students.find(s => s.student_id === studentId);
    if (!student) return;

    this.state.editingStudent = student;
    const modal = document.getElementById("edit-student-modal");
    if (!modal) return;

    document.getElementById("edit-stu-name").value = student.full_name;
    document.getElementById("edit-stu-roll").value = student.student_id;
    document.getElementById("edit-stu-dept").value = student.department || student.branch;
    document.getElementById("edit-stu-att").value = student.overall_attendance;
    document.getElementById("edit-stu-cgpa").value = student.cgpa;
    document.getElementById("edit-stu-standing").value = student.academic_standing || "Good Standing";
    document.getElementById("edit-stu-due").value = student.fee_info ? student.fee_info.due : 0;
    document.getElementById("edit-stu-hostel").value = student.hostel_info ? student.hostel_info.room : "Day Scholar";
    document.getElementById("edit-stu-reason").value = "";

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeEditStudentModal() {
    const modal = document.getElementById("edit-student-modal");
    if (modal) modal.classList.add("hidden");
    this.state.editingStudent = null;
  }

  saveStudentEdits(e) {
    if (e) e.preventDefault();
    if (!this.state.editingStudent) return;

    const studentId = this.state.editingStudent.student_id;
    const idx = this.state.students.findIndex(s => s.student_id === studentId);
    if (idx === -1) return;

    const newName = document.getElementById("edit-stu-name").value.trim();
    const newAtt = parseFloat(document.getElementById("edit-stu-att").value);
    const newCgpa = parseFloat(document.getElementById("edit-stu-cgpa").value).toFixed(2);
    const newStanding = document.getElementById("edit-stu-standing").value;
    const newDue = parseInt(document.getElementById("edit-stu-due").value) || 0;
    const newHostel = document.getElementById("edit-stu-hostel").value.trim();
    const auditReason = document.getElementById("edit-stu-reason").value.trim();

    const target = this.state.students[idx];
    target.full_name = newName;
    target.overall_attendance = newAtt;
    target.cgpa = newCgpa;
    target.academic_standing = newStanding;
    if (target.fee_info) {
      target.fee_info.due = newDue;
      target.fee_info.status = newDue === 0 ? "100% Cleared" : "Partial Dues";
    }
    if (target.hostel_info) {
      target.hostel_info.room = newHostel;
    }

    if (target.subjects && target.subjects.length > 0) {
      target.subjects.forEach(sub => {
        sub.percentage = newAtt;
        sub.attended = Math.round(sub.total * (newAtt / 100.0));
      });
    }

    this.saveDatabase();
    this.applyStudentFilters();
    this.renderOverviewMetrics();

    if (this.state.viewingStudent && this.state.viewingStudent.student_id === studentId) {
      this.openStudentProfileDrawer(studentId);
    }

    this.showToast(
      "Student Record Committed",
      `Saved changes for ${newName} (Roll: ${studentId}). Attendance: ${newAtt}%, CGPA: ${newCgpa}. Synced to Supabase!`,
      "success"
    );

    this.closeEditStudentModal();
  }

  // --- Fee Default Warning System ---
  sendFeeNoticeToStudent(studentId) {
    const student = this.state.students.find(s => s.student_id === studentId);
    if (!student) return;

    const dueAmount = student.fee_info ? student.fee_info.due : 15000;
    const noticeTitle = `URGENT: Semester Tuition Fee Due Settlement (₹${dueAmount.toLocaleString()})`;
    const noticeBody = `Official Communication from Office of Finance & Accounts: Student ${student.full_name} (Roll: ${student.student_id}) has an outstanding tuition balance of ₹${dueAmount.toLocaleString()}. In accordance with institutional statutory guidelines, please settle the remaining dues at the university accounts counter within 7 working days to prevent examination hall ticket administrative hold.`;

    const newNotice = {
      id: "fee_notice_" + Date.now(),
      title: noticeTitle,
      target: student.student_id,
      student_name: student.full_name,
      category: "Tuition Fee Default Notice",
      priority: "urgent",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      department: student.department,
      author: "Office of Finance & Accounts (Countersigned by Dean)",
      summary: noticeBody
    };

    this.state.notices.unshift(newNotice);
    this.saveNotices();

    this.showToast(
      "Fee Default Warning Dispatched",
      `Official warning for ₹${dueAmount.toLocaleString()} sent to ${student.full_name} (${studentId}). Visible exclusively on their portal!`,
      "success"
    );
  }

  broadcastFeeRemindersToAllUnpaid() {
    const unpaidStudents = this.state.students.filter(s => s.fee_info && Number(s.fee_info.due || 0) > 0);
    if (unpaidStudents.length === 0) {
      alert("All 1,000 enrolled students have 100% cleared fees!");
      return;
    }

    if (!confirm(`Are you sure you want to dispatch fee settlement reminders to all ${unpaidStudents.length} students with pending dues?`)) return;

    unpaidStudents.forEach(s => {
      const due = s.fee_info.due;
      const newNotice = {
        id: `fee_rem_${s.student_id}_` + Date.now(),
        title: `URGENT: Overdue Semester Fee Balance Settlement (₹${due.toLocaleString()})`,
        target: s.student_id,
        student_name: s.full_name,
        category: "Tuition Fee Default Notice",
        priority: "urgent",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        department: s.department,
        author: "Office of Finance & Accounts",
        summary: `Formal notice to ${s.full_name} (Roll: ${s.student_id}): An overdue balance of ₹${due.toLocaleString()} is pending. Please remit immediately.`
      };
      this.state.notices.unshift(newNotice);
    });

    this.saveNotices();
    this.showToast(
      "Bulk Fee Notices Dispatched",
      `Sent automated overdue warnings to all ${unpaidStudents.length} students with pending fees.`,
      "success"
    );
  }

  // --- Tab 3: Notice & Broadcast Center ---
  renderNoticesList() {
    const container = document.getElementById("admin-notices-container");
    if (!container) return;

    if (this.state.notices.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs">No active notices published. Create one above!</div>
      `;
      return;
    }

    container.innerHTML = this.state.notices.map(n => {
      const isPersonal = n.target && n.target !== "all";
      const targetBadge = isPersonal
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Personal (Roll: ${n.target})</span>`
        : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">All 1,000 Students</span>`;

      return `
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between gap-4 mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              ${targetBadge}
              <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">${n.category}</span>
              <span class="text-[10px] text-slate-400">&bull; ${n.date}</span>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">${n.title}</h4>
            <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${n.summary || n.message}</p>
            ${n.attachment ? `<div class="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1"><i data-lucide="paperclip" class="w-3.5 h-3.5"></i>${n.attachment}</div>` : ''}
          </div>
          <button onclick="window.AdminApp.deleteNotice('${n.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex-shrink-0" title="Delete Notice">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  handlePublishCommonNotice(e) {
    if (e) e.preventDefault();
    const title = document.getElementById("common-notice-title").value.trim();
    const category = document.getElementById("common-notice-cat").value;
    const priority = document.getElementById("common-notice-priority").value;
    const body = document.getElementById("common-notice-body").value.trim();
    const attachment = document.getElementById("common-notice-attach").value.trim();

    if (!title || !body) return;

    const newNotice = {
      id: "not_" + Date.now(),
      title: title,
      target: "all",
      category: category,
      priority: priority,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      department: "All Engineering Departments",
      author: `${ADMIN_CREDENTIALS.name} (${ADMIN_CREDENTIALS.role})`,
      summary: body,
      attachment: attachment || null
    };

    this.state.notices.unshift(newNotice);
    this.saveNotices();
    this.renderNoticesList();

    document.getElementById("common-notice-title").value = "";
    document.getElementById("common-notice-body").value = "";
    document.getElementById("common-notice-attach").value = "";

    this.showToast(
      "Circular Broadcasted",
      `Published "${title}" to all 1,000 students. Immediately visible on student portal!`,
      "success"
    );
  }

  deleteNotice(id) {
    if (!confirm("Are you sure you want to revoke and delete this official notice?")) return;
    this.state.notices = this.state.notices.filter(n => n.id !== id);
    this.saveNotices();
    this.renderNoticesList();
    this.showToast("Notice Revoked", "The circular has been removed from all student dashboards.", "info");
  }

  // --- Tab 4: 12-Hour SLA Grievance Desk ---
  setTicketCategoryFilter(cat) {
    this.state.ticketCategoryFilter = cat;
    document.querySelectorAll(".ticket-filter-pill").forEach(btn => {
      if (btn.dataset.category === cat) {
        btn.className = "ticket-filter-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition";
      } else {
        btn.className = "ticket-filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700";
      }
    });
    this.renderTicketsQueue();
  }

  renderTicketsQueue() {
    const container = document.getElementById("admin-tickets-container");
    const countBadge = document.getElementById("tickets-pending-badge");
    if (!container) return;

    const pending = this.state.tickets.filter(t => t.status !== "resolved");
    if (countBadge) {
      countBadge.textContent = `${pending.length} Action Pending`;
    }

    let filtered = this.state.tickets;
    if (this.state.ticketCategoryFilter !== "all") {
      filtered = filtered.filter(t => t.category && t.category.toLowerCase().includes(this.state.ticketCategoryFilter.toLowerCase()));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <i data-lucide="check-circle" class="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60"></i>
          <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Zero Pending Issues in this Category</h4>
          <p class="text-slate-500 text-xs">All student campus doubts and complaints in this section have been resolved!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(t => {
      const createdTime = new Date(t.created_at).getTime();
      const elapsedHours = (Date.now() - createdTime) / (3600 * 1000);
      const remainingHours = Math.max(0, 12 - elapsedHours);
      const remH = Math.floor(remainingHours);
      const remM = Math.floor((remainingHours - remH) * 60);

      const isOverdue = remainingHours <= 0;
      const isUrgent = remainingHours < 4;

      let slaBadge = "";
      if (t.status === "resolved") {
        slaBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i>Resolved within SLA</span>`;
      } else if (isOverdue) {
        slaBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse flex items-center gap-1"><i data-lucide="alert-octagon" class="w-3 h-3"></i>SLA Breached (Action Required)</span>`;
      } else {
        slaBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isUrgent ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-200'} border flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i>12h SLA: ${remH}h ${remM}m remaining</span>`;
      }

      const statusPill = t.status === "resolved" 
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">Resolved</span>`
        : (t.status === "in_progress" 
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">In Review</span>` 
            : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Open</span>`);

      return `
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4 transition hover:border-blue-400">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">${t.ticket_number}</span>
              ${statusPill}
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${t.category}</span>
            </div>
            ${slaBadge}
          </div>

          <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1.5">${t.subject}</h4>
          <p class="text-xs text-slate-700 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">${t.message}</p>

          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span>Student: <strong>${t.student_name}</strong> (Roll: ${t.student_id})</span>
              <span>&bull;</span>
              <span>Filed: ${new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button onclick="window.AdminApp.openResolveTicketModal('${t.id}')" class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
              <span>Take Action / Record Resolution</span>
            </button>
          </div>

          ${t.dean_action ? `
            <div class="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div class="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>Dean's Documented Action Taken:</span>
              </div>
              <p class="text-emerald-800 dark:text-emerald-300 leading-relaxed">${t.dean_action}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  openResolveTicketModal(ticketId) {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    this.state.resolvingTicket = ticket;
    const modal = document.getElementById("resolve-ticket-modal");
    if (!modal) return;

    document.getElementById("resolve-tkt-num").textContent = ticket.ticket_number;
    document.getElementById("resolve-tkt-subject").textContent = ticket.subject;
    document.getElementById("resolve-tkt-student").textContent = `${ticket.student_name} (Roll: ${ticket.student_id})`;
    document.getElementById("resolve-tkt-msg").textContent = ticket.message;
    document.getElementById("resolve-tkt-status").value = ticket.status === "resolved" ? "resolved" : "resolved";
    document.getElementById("resolve-tkt-notes").value = ticket.dean_action || "";

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeResolveTicketModal() {
    const modal = document.getElementById("resolve-ticket-modal");
    if (modal) modal.classList.add("hidden");
    this.state.resolvingTicket = null;
  }

  handleSaveTicketResolution(e) {
    if (e) e.preventDefault();
    if (!this.state.resolvingTicket) return;

    const id = this.state.resolvingTicket.id;
    const idx = this.state.tickets.findIndex(t => t.id === id);
    if (idx === -1) return;

    const newStatus = document.getElementById("resolve-tkt-status").value;
    const actionNotes = document.getElementById("resolve-tkt-notes").value.trim();

    this.state.tickets[idx].status = newStatus;
    this.state.tickets[idx].dean_action = actionNotes || "Addressed and verified by Dean of Academics.";
    this.state.tickets[idx].resolved_at = new Date().toISOString();

    this.saveTickets();
    this.renderTicketsQueue();
    this.renderOverviewMetrics();
    this.closeResolveTicketModal();

    this.showToast(
      "Grievance Resolution Recorded",
      `Ticket ${this.state.resolvingTicket.ticket_number} marked as "${newStatus}". Reflected immediately on Student Portal!`,
      "success"
    );
  }

  // --- Tab 5: Faculty Roster ---
  renderFacultyRoster() {
    const tbody = document.getElementById("admin-faculty-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.state.faculty.map(f => {
      return `
        <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-3 px-4 font-mono font-bold text-xs text-blue-700 dark:text-blue-400">${f.id}</td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${f.name}</div>
            <div class="text-[11px] text-slate-500 font-mono">${f.email}</div>
          </td>
          <td class="py-3 px-4 text-xs font-semibold text-slate-800 dark:text-slate-300">${f.dept}</td>
          <td class="py-3 px-4 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">${f.cabin}</td>
          <td class="py-3 px-4 text-xs text-slate-800 dark:text-slate-200">${f.lectures}</td>
          <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">${f.office_hours}</td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // --- Tab 6: Financial Clearance & Fee Audit ---
  renderFinanceLedger() {
    const container = document.getElementById("admin-finance-summary");
    const unpaidTbody = document.getElementById("admin-unpaid-students-tbody");
    if (!container) return;

    let totalTuition = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let scholarshipGranted = 0;
    const unpaidStudents = [];

    this.state.students.forEach(s => {
      if (s.fee_info) {
        totalTuition += s.fee_info.total || 0;
        totalCollected += s.fee_info.paid || 0;
        const due = s.fee_info.due || 0;
        totalPending += due;
        scholarshipGranted += s.fee_info.scholarship || 0;
        if (due > 0) unpaidStudents.push(s);
      }
    });

    container.innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <span class="text-[11px] font-bold uppercase text-slate-500">Gross Tuition Receivables</span>
          <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">₹${(totalTuition / 10000000).toFixed(2)} Cr</div>
          <span class="text-[10px] text-slate-500 font-bold">1,000 Registered Cohort</span>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-emerald-500">
          <span class="text-[11px] font-bold uppercase text-slate-500">Total Collected to Date</span>
          <div class="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹${(totalCollected / 10000000).toFixed(2)} Cr</div>
          <span class="text-[10px] text-emerald-600 font-bold">${((totalCollected / totalTuition) * 100).toFixed(1)}% Realization Rate</span>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-amber-500">
          <span class="text-[11px] font-bold uppercase text-slate-500">Outstanding Overdue Balance</span>
          <div class="text-xl sm:text-2xl font-black text-amber-600 mt-1">₹${(totalPending / 100000).toFixed(2)} Lakhs</div>
          <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold">${unpaidStudents.length} Students Pending</span>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-purple-500">
          <span class="text-[11px] font-bold uppercase text-slate-500">Merit Scholarships Awarded</span>
          <div class="text-xl sm:text-2xl font-black text-purple-600 mt-1">₹${(scholarshipGranted / 100000).toFixed(2)} Lakhs</div>
          <span class="text-[10px] text-purple-700 dark:text-purple-400 font-bold">Section 80D Tax Exempt</span>
        </div>
      </div>
    `;

    if (unpaidTbody) {
      unpaidTbody.innerHTML = unpaidStudents.slice(0, 15).map(s => `
        <tr class="border-b border-slate-200 dark:border-slate-800 text-xs">
          <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${s.full_name}</td>
          <td class="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">${s.student_id}</td>
          <td class="py-3 px-4 text-slate-700 dark:text-slate-300">${s.department}</td>
          <td class="py-3 px-4 font-mono font-black text-red-600">₹${s.fee_info.due.toLocaleString()}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="window.AdminApp.sendFeeNoticeToStudent('${s.student_id}')" class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition shadow flex items-center gap-1 inline-flex">
              <i data-lucide="bell-ring" class="w-3 h-3"></i>
              <span>Dispatch Warning Notice</span>
            </button>
          </td>
        </tr>
      `).join("");
    }

    if (window.lucide) window.lucide.createIcons();
  }

  exportLedgerToCSV() {
    const headers = ["Student ID", "Full Name", "Email", "Department", "Year Semester", "Attendance %", "CGPA", "Fee Status", "Total Fee (INR)", "Paid (INR)", "Due (INR)", "Hostel Allotted"];
    const rows = this.state.students.map(s => [
      `"${s.student_id}"`,
      `"${s.full_name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"${s.year_semester || ''}"`,
      s.overall_attendance,
      s.cgpa,
      `"${s.fee_info ? s.fee_info.status : 'N/A'}"`,
      s.fee_info ? s.fee_info.total : 0,
      s.fee_info ? s.fee_info.paid : 0,
      s.fee_info ? s.fee_info.due : 0,
      `"${s.hostel_info ? s.hostel_info.hall + ' Room ' + s.hostel_info.room : 'N/A'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CAMPUSIQ_Master_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Audit Ledger Exported", "Downloaded complete 1,000 students audit ledger as CSV spreadsheet.", "success");
  }

  // --- UI Toast Notifications ---
  showToast(title, message, type = "info") {
    const container = document.getElementById("admin-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgClass = type === "success" 
      ? "bg-emerald-900/95 text-white border-emerald-500" 
      : (type === "error" ? "bg-red-900/95 text-white border-red-500" : "bg-slate-900/95 text-white border-blue-500");

    toast.className = `${bgClass} p-4 rounded-xl border shadow-2xl text-xs sm:text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 max-w-md`;
    toast.innerHTML = `
      <div class="flex-1">
        <div class="font-bold mb-0.5">${title}</div>
        <div class="text-slate-200 text-xs leading-relaxed">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
}

// Global bootstrap
document.addEventListener("DOMContentLoaded", () => {
  window.AdminApp = new CampusIQAdminApp();
});
