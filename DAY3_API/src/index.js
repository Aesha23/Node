const express = require("express");
const sequelize = require("./config/db");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use("/users", userRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () =>
      console.log("Server running on http://localhost:3000")
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
