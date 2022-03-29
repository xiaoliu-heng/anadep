const fs = require("fs");
const path = require("path");

const { exts } = require("./constants");

module.exports = {
  getRealPath(entryPath) {
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
  },

  toG6Data(map, title) {
    const nodes = [
      ...new Set([...map.keys(), ...[...map.values()].flat()]),
    ].map((id) => ({ id, label: path.relative(".", id) }));

    const edges = [];
    map.forEach((targets, source) => {
      targets.forEach((target) => edges.push({ source, target }));
    });

    return { nodes, edges };
  },
};
