#! /usr/bin/env node
const fs = require("fs");
const yargs = require("yargs");

const { parse } = require("./utils");
const { startServer } = require("./monitor");

const main = (args) => {
  const { file, port, output } = args;
  if (!fs.existsSync(file)) return;
  const map = new Map();
  parse(file, map);

  if (output) {
    if (output === "json") {
      fs.writeFileSync("output.json", JSON.stringify(Object.fromEntries(map)));
    } else if (output === "stdout") {
      const allFiles = [
        ...new Set([...map.keys(), ...[...map.values()].flat()]),
      ];
      console.log(allFiles.join("\n"));
    }
  } else {
    startServer(map, { file, port });
  }
};

yargs(process.argv.slice(2))
  .scriptName("anadep")
  .command(
    "$0 <file> [option]",
    "analyze file",
    (yargs) =>
      yargs.positional("file", {
        describe: "path to target file",
        type: "string",
      }),
    (argv) => main(argv)
  )
  .option("port", {
    alias: "p",
    describe: "server port",
    default: 5555,
  })
  .option("output", {
    alias: "o",
    describe: "output format",
    choices: ["json", "stdout"],
  })
  .help()
  .alias("help", "h")
  .parse();
