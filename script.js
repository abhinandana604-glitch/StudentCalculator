// ---------- Config ----------
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"];
const PASS_MARK = 40;
const DB_KEY = "student_grade_db_v1";

// ---------- Tiny "database" layer (browser localStorage) ----------
const db = {
  all() { try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; } catch (e) { return []; } },
  write(rows) { try { localStorage.setItem(DB_KEY, JSON.stringify(rows)); } catch (e) { /* storage blocked */ } },
  upsert(rec) { const rows = this.all().filter(r => r.roll !== rec.roll); rows.push(rec); this.write(rows); },
  remove(roll) { this.write(this.all().filter(r => r.roll !== roll)); },
  clear() { this.write([]); }
};

// ---------- Grade logic ----------
function gradeFor(pct) {
  if (pct >= 90) return ["O", 10];
  if (pct >= 80) return ["A+", 9];
  if (pct >= 70) return ["A", 8];
  if (pct >= 60) return ["B+", 7];
  if (pct >= 50) return ["B", 6];
  return ["C", 5];
}
function evaluate(marks) {
  const total = marks.reduce((a, b) => a + b, 0);
  const pct = total / (marks.length * 100) * 100;
  const failed = marks.some(m => m < PASS_MARK);
  const [g, gp] = failed ? ["F", 0] : gradeFor(pct);
  return { total, pct: Math.round(pct * 100) / 100, grade: g, gp, status: failed ? "Fail" : "Pass" };
}

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const subjectsBox = $("subjects");
SUBJECTS.forEach((s, i) => {
  const l = document.createElement("label");
  l.textContent = s;
  const inp = document.createElement("input");
  inp.type = "number"; inp.min = 0; inp.max = 100; inp.id = "m" + i; inp.placeholder = "0 - 100";
  l.appendChild(inp);
  subjectsBox.appendChild(l);
});

function showResult(r) {
  $("empty").hidden = true; $("marked").hidden = false;
  $("stamp").textContent = r.grade;
  $("stamp").className = "stamp " + (r.status === "Pass" ? "pass" : "");
  $("rName").textContent = r.name + " (" + r.roll + ")";
  $("rTotal").textContent = r.total + " / " + SUBJECTS.length * 100;
  $("rPct").textContent = r.pct + "%";
  $("rGp").textContent = r.gp;
  $("rStatus").textContent = r.status;
}

function td(text, cls) {
  const c = document.createElement("td");
  c.textContent = text;
  if (cls) c.className = cls;
  return c;
}

function renderRecords() {
  const q = $("search").value.trim().toLowerCase();
  const all = db.all();
  const rows = all.filter(r => r.name.toLowerCase().includes(q) || r.roll.toLowerCase().includes(q));
  const body = $("rows");
  body.textContent = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.append(td(r.roll), td(r.name), td(r.total), td(r.pct), td(r.grade, "g"),
              td(r.status, r.status === "Pass" ? "pass" : "fail"));
    const act = document.createElement("td");
    const b = document.createElement("button");
    b.textContent = "Delete";
    b.onclick = () => { db.remove(r.roll); renderRecords(); };
    act.appendChild(b); tr.appendChild(act);
    body.appendChild(tr);
  });
  $("noRows").hidden = rows.length > 0;
  $("noRows").textContent = all.length ? "No records match your search." : "No records yet. Saved students will appear here.";
  $("clearAll").hidden = all.length === 0;

  const stats = $("stats");
  stats.textContent = "";
  if (all.length) {
    const avg = all.reduce((a, r) => a + r.pct, 0) / all.length;
    const top = all.reduce((a, r) => (r.pct > a.pct ? r : a));
    const passed = all.filter(r => r.status === "Pass").length;
    [`Students: ${all.length}`, `Class average: ${avg.toFixed(2)}%`,
     `Topper: ${top.name} (${top.pct}%)`, `Passed: ${passed}/${all.length}`].forEach(t => {
      const s = document.createElement("span"); s.textContent = t; stats.appendChild(s);
    });
  }
}

// ---------- Events ----------
$("gradeForm").addEventListener("submit", e => {
  e.preventDefault();
  const err = $("error");
  document.querySelectorAll("input.bad").forEach(i => i.classList.remove("bad"));
  const name = $("name").value.trim(), roll = $("roll").value.trim();
  if (!name || !roll) {
    err.textContent = "Enter both the student name and roll number.";
    (!name ? $("name") : $("roll")).classList.add("bad");
    return;
  }
  const marks = [];
  for (let i = 0; i < SUBJECTS.length; i++) {
    const inp = $("m" + i), v = inp.value.trim();
    const n = Number(v);
    if (v === "" || isNaN(n) || n < 0 || n > 100) {
      err.textContent = "Marks for " + SUBJECTS[i] + " must be a number from 0 to 100.";
      inp.classList.add("bad"); inp.focus();
      return;
    }
    marks.push(n);
  }
  err.textContent = "";
  const rec = Object.assign({ name, roll, marks }, evaluate(marks));
  db.upsert(rec);
  showResult(rec);
  renderRecords();
});
$("resetBtn").addEventListener("click", () => { $("error").textContent = ""; });
$("search").addEventListener("input", renderRecords);
$("clearAll").addEventListener("click", () => {
  if (confirm("Delete all saved records?")) { db.clear(); renderRecords(); }
});
renderRecords();
