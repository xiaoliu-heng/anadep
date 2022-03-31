const fs = require("fs");
const path = require("path");
const { parse: babelParse } = require("@babel/parser");

const { exts } = require("./constants");

function getRealPath(entryPath) {
  if (!fs.existsSync(entryPath)) {
    for (const ext of exts) {
      if (fs.existsSync(`${entryPath}${ext}`)) return `${entryPath}${ext}`;
    }
  } else {
    const info = fs.lstatSync(entryPath);
    if (info.isDirectory()) {
      const paths = ["index.js", "index.jsx"].map((name) =>
        path.resolve(entryPath, name)
      );
      for (const path of paths) {
        if (fs.existsSync(path)) return path;
      }
    } else if (info.isFile()) {
      return path.resolve(entryPath);
    }
  }

  return null;
}

function toG6Data(map, title) {
  const nodes = [...new Set([...map.keys(), ...[...map.values()].flat()])].map(
    (id) => ({ id, label: path.relative(".", id) })
  );

  const edges = [];
  map.forEach((targets, source) => {
    targets.forEach((target) => edges.push({ source, target }));
  });

  return { nodes, edges };
}

function parse(filePath, map) {
  if (filePath === null) return;
  if (map.has(filePath)) return;

  filePath = getRealPath(filePath);
  const ext = path.extname(filePath);
  if (!exts.includes(ext)) return;
  const fileContent = fs.readFileSync(filePath).toString();
  const ast = babelParse(fileContent, {
    sourceType: "module",
    plugins: ["jsx", "typescript", "decorators-legacy"],
  });

  let nodes;
  if (ast.type === "File") {
    nodes = ast.program.body;
  } else if (ast.type === "Program") {
    nodes = ast.body;
  }

  const imports = [];
  nodes.forEach((node) => {
    if (node.type === "ImportDeclaration") {
      if ([".", "@/"].some((prefix) => node.source.value.startsWith(prefix))) {
        imports.push(
          getRealPath(path.resolve(path.dirname(filePath), node.source.value))
        );
      }
    }
  });
  map.set(filePath, imports);
  imports.forEach((imported) => parse(imported, map));
}

module.exports = {
  getRealPath,
  toG6Data,
  parse,
};
