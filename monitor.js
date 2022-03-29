const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const { toG6Data } = require("./utils");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "template"));

function startServer(map, entryPath) {
  app.get("/", (req, res) => {
    const { nodes, edges } = toG6Data(map, entryPath);
    res.render("deps-g6", {
      data: JSON.stringify({ nodes, edges }),
      title: entryPath,
      total: nodes.length,
      files: nodes.map((n) => n.id),
    });
  });

  app.get("/openInCode", (req, res) => {
    const { file } = req.query;
    const cmd = `code ${file}`;
    const ps = spawn(cmd, { shell: true });
    ps.on("close", (code) => {
      if (code === 0) {
        res.send("success");
      } else {
        res.send("error");
      }
    });
  });

  return app.listen(5555, () => {
    console.log("look at http://localhost:5555");
  });
}

module.exports = {
  startServer,
};
