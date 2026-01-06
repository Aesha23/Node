const express = require("express");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
  const { name, email, age } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
      [name, email, age]
    );
    res.status(201).json({
      message: "User created successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  const { name, email, age } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE users SET name=?, email=?, age=? WHERE id=?",
      [name, email, age, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT}`);
});
