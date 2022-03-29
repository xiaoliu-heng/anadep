#! /usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");

const { getRealPath, toG6Data: toG6 } = require("./utils");
const { exts } = require("./constants");
const { startServer } = require("./monitor");

const map = new Map();

const main = (entryPath) => {
  if (!fs.existsSync(entryPath)) return;
  parser(getRealPath(entryPath));
  startServer(map, entryPath);
};

const parser = (filePath) => {
  if (filePath === null) return;
  if (map.has(filePath)) return;

  const ext = path.extname(filePath);
  if (!exts.includes(ext)) return;
  const fileContent = fs.readFileSync(filePath).toString();
  const ast = parse(fileContent, {
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
  imports.forEach((imported) => parser(imported));
};

main(process.argv[2]);
