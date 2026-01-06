const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

const readData = () => {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data || "[]");
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const getBody = (req) =>
  new Promise((resolve) => {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const myUrl = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  const pathParts = myUrl.pathname.split("/").filter(Boolean);

  // GET all
  if (method === "GET" && myUrl.pathname === "/items") {
    return sendJSON(res, 200, readData());
  }

  // GET by id
  if (method === "GET" && pathParts[0] === "items" && pathParts[1]) {
    const employees = readData();
    const employee = employees.find((e) => e.id === Number(pathParts[1]));

    if (!employee) {
      return sendJSON(res, 404, { message: "Employee not found" });
    }

    return sendJSON(res, 200, employee);
  }

  // CREATE
  if (method === "POST" && myUrl.pathname === "/items") {
    const body = await getBody(req);

    if (Object.keys(body).length === 0) {
      return sendJSON(res, 400, { message: "Request body required" });
    }

    const employees = readData();
    const newEmployee = { id: Date.now(), ...body };

    employees.push(newEmployee);
    writeData(employees);

    return sendJSON(res, 201, newEmployee);
  }

  // UPDATE
  if (method === "PUT" && pathParts[0] === "items" && pathParts[1]) {
    const body = await getBody(req);
    const employees = readData();
    const index = employees.findIndex((e) => e.id === Number(pathParts[1]));

    if (index === -1) {
      return sendJSON(res, 404, { message: "Employee not found" });
    }

    employees[index] = { ...employees[index], ...body };
    writeData(employees);

    return sendJSON(res, 200, employees[index]);
  }

  // DELETE
  if (method === "DELETE" && pathParts[0] === "items" && pathParts[1]) {
    const employees = readData();
    const filtered = employees.filter((e) => e.id !== Number(pathParts[1]));

    if (filtered.length === employees.length) {
      return sendJSON(res, 404, { message: "Employee not found" });
    }

    writeData(filtered);
    return sendJSON(res, 200, { message: "Employee deleted" });
  }

  sendJSON(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
