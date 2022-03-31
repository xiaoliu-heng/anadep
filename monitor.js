const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const { toG6Data } = require("./utils");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "template"));

function startServer(map, { file, port }) {
  app.get("/", (req, res) => {
    const { nodes, edges } = toG6Data(map, file);
    res.render("deps-g6", {
      data: JSON.stringify({ nodes, edges }),
      title: file,
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

  return app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`You can inspect the result in you browser. ${url}`);

    const cmd = `${process.platform === "win32" ? "explorer" : "open"} ${url}`;
    spawn(cmd, { shell: true });
  });
}

module.exports = {
  startServer,
};
