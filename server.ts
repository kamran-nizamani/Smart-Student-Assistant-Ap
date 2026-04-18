import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");

// Initialize dummy DB
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    notes: [],
    tasks: [],
    results: [],
    quizzes: [],
    notifications: [],
    grades: []
  }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth: Session is just a mock for simplicity, using a basic header 'x-user-id'
  app.post("/api/auth/register", (req, res) => {
    const { email, password, displayName, role } = req.body;
    const db = readDB();
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = {
      uid: "u_" + Math.random().toString(36).substr(2, 9),
      email,
      password, // In a real app, hash this!
      displayName,
      role,
      subjects: [],
      dailyGoalMinutes: 120,
      createdAt: Date.now()
    };
    db.users.push(newUser);
    writeDB(db);
    res.json(newUser);
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  });

  app.get("/api/users", (req, res) => {
    res.json(readDB().users);
  });

  app.delete("/api/user/:uid", (req, res) => {
    const db = readDB();
    db.users = db.users.filter((u: any) => u.uid !== req.params.uid);
    writeDB(db);
    res.json({ success: true });
  });

  app.get("/api/user/:uid", (req, res) => {
    const db = readDB();
    const user = db.users.find((u: any) => u.uid === req.params.uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.patch("/api/user/:uid", (req, res) => {
    const db = readDB();
    const index = db.users.findIndex((u: any) => u.uid === req.params.uid);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    db.users[index] = { ...db.users[index], ...req.body };
    writeDB(db);
    res.json(db.users[index]);
  });

  // Notes
  app.get("/api/notes", (req, res) => {
    const uid = req.headers["x-user-id"];
    const db = readDB();
    res.json(db.notes.filter((n: any) => n.userId === uid));
  });

  app.post("/api/notes", (req, res) => {
    const db = readDB();
    const newNote = { ...req.body, id: "n_" + Math.random().toString(36).substr(2, 9) };
    db.notes.push(newNote);
    writeDB(db);
    res.json(newNote);
  });

  app.patch("/api/notes/:id", (req, res) => {
    const db = readDB();
    const index = db.notes.findIndex((n: any) => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Note not found" });
    db.notes[index] = { ...db.notes[index], ...req.body };
    writeDB(db);
    res.json(db.notes[index]);
  });

  app.delete("/api/notes/:id", (req, res) => {
    const db = readDB();
    db.notes = db.notes.filter((n: any) => n.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // Tasks
  app.get("/api/tasks", (req, res) => {
    const uid = req.headers["x-user-id"];
    const db = readDB();
    res.json(db.tasks.filter((t: any) => t.userId === uid));
  });

  app.post("/api/tasks", (req, res) => {
    const db = readDB();
    const newTask = { ...req.body, id: "t_" + Math.random().toString(36).substr(2, 9) };
    db.tasks.push(newTask);
    writeDB(db);
    res.json(newTask);
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const db = readDB();
    const index = db.tasks.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Task not found" });
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    writeDB(db);
    res.json(db.tasks[index]);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const db = readDB();
    db.tasks = db.tasks.filter((t: any) => t.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // Quizzes & Results
  app.get("/api/quizzes", (req, res) => {
    res.json(readDB().quizzes);
  });

  app.post("/api/quizzes", (req, res) => {
    const db = readDB();
    const newQuiz = { ...req.body, id: "q_" + Math.random().toString(36).substr(2, 9) };
    db.quizzes.push(newQuiz);
    writeDB(db);
    res.json(newQuiz);
  });

  app.delete("/api/quizzes/:id", (req, res) => {
    const db = readDB();
    db.quizzes = db.quizzes.filter((q: any) => q.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  app.get("/api/results", (req, res) => {
    const uid = req.headers["x-user-id"];
    const db = readDB();
    const user = db.users.find((u: any) => u.uid === uid);
    
    if (user?.role === "teacher" || user?.role === "admin") {
      // Teachers and admins can see all results (or we could filter by teacher's quizzes)
      return res.json(db.results);
    }
    
    res.json(db.results.filter((r: any) => r.studentId === uid));
  });

  app.post("/api/results", (req, res) => {
    const db = readDB();
    const newResult = { ...req.body, id: "r_" + Math.random().toString(36).substr(2, 9) };
    db.results.push(newResult);
    writeDB(db);
    res.json(newResult);
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    const uid = req.headers["x-user-id"];
    const db = readDB();
    res.json(db.notifications?.filter((n: any) => n.userId === uid) || []);
  });

  app.post("/api/notifications", (req, res) => {
    const db = readDB();
    const newNotif = { 
      ...req.body, 
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      read: false
    };
    db.notifications = db.notifications || [];
    db.notifications.push(newNotif);
    writeDB(db);
    res.json(newNotif);
  });

  app.patch("/api/notifications/:id", (req, res) => {
    const db = readDB();
    const index = db.notifications.findIndex((n: any) => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Notification not found" });
    db.notifications[index] = { ...db.notifications[index], ...req.body };
    writeDB(db);
    res.json(db.notifications[index]);
  });

  // Grades (GPA Tracker)
  app.get("/api/grades", (req, res) => {
    const uid = req.headers["x-user-id"];
    const db = readDB();
    res.json(db.grades?.filter((g: any) => g.userId === uid) || []);
  });

  app.post("/api/grades", (req, res) => {
    const db = readDB();
    const newGrade = { ...req.body, id: "g_" + Math.random().toString(36).substr(2, 9) };
    db.grades = db.grades || [];
    db.grades.push(newGrade);
    writeDB(db);
    res.json(newGrade);
  });

  app.delete("/api/grades/:id", (req, res) => {
    const db = readDB();
    db.grades = db.grades.filter((g: any) => g.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // Global Search
  app.get("/api/search", (req, res) => {
    const q = (req.query.q as string || "").toLowerCase();
    const uid = req.headers["x-user-id"];
    const db = readDB();
    
    if (!q) return res.json([]);

    const results: any[] = [];

    // Search Notes
    db.notes.filter((n: any) => n.userId === uid).forEach((n: any) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({ type: 'note', id: n.id, title: n.title, sub: n.subject });
      }
    });

    // Search Tasks
    db.tasks.filter((t: any) => t.userId === uid).forEach((t: any) => {
      if (t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)) {
        results.push({ type: 'task', id: t.id, title: t.title, sub: t.category });
      }
    });

    // Search Quizzes
    db.quizzes.forEach((quiz: any) => {
      if (quiz.title.toLowerCase().includes(q) || quiz.subject.toLowerCase().includes(q)) {
        results.push({ type: 'quiz', id: quiz.id, title: quiz.title, sub: quiz.subject });
      }
    });

    res.json(results);
  });

  // --- Vite & Production Setup ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
