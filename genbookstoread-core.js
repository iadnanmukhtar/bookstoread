const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const SUFFIX_TO_STATUS = {
  "In Progress": "in-progress",
  "To Do": "todo",
  Complete: "complete",
};
const MANAGED_SUFFIX_PATTERN = / \[(In Progress|To Do|Complete|Exclude)\]$/;

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function usage(commandExample = "genbookstoread.js /path/to/source-folder [output.md]") {
  console.error(
    [
      "Usage:",
      `  ${commandExample}`,
      "",
      "You can pass either:",
      "  - a book folder path",
      "  - an Obsidian note path whose frontmatter contains source: \"/path/to/books\"",
    ].join("\n")
  );
}

function parseFrontmatterSource(markdown) {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) return null;

  const sourceMatch = frontmatterMatch[1].match(/^source\s*:\s*(.*)$/m);
  if (!sourceMatch) return null;

  let source = sourceMatch[1].trim();
  if (!source) return "";

  if (
    (source.startsWith('"') && source.endsWith('"')) ||
    (source.startsWith("'") && source.endsWith("'"))
  ) {
    source = source.slice(1, -1);
  }

  return source.trim();
}

function resolveSourceInput(inputPath) {
  if (!fs.existsSync(inputPath)) {
    fail(`Error: '${inputPath}' does not exist`, 2);
  }

  const stats = fs.statSync(inputPath);
  if (stats.isDirectory()) {
    return inputPath;
  }

  if (stats.isFile()) {
    const note = fs.readFileSync(inputPath, "utf8");
    const source = parseFrontmatterSource(note);

    if (source === null) {
      fail(
        `Error: '${inputPath}' is a file. If this is an Obsidian note, add a frontmatter line like source: "/path/to/your/book/folder"`,
        2
      );
    }

    if (source === "") {
      fail(`Error: '${inputPath}' has an empty frontmatter source value`, 2);
    }

    return path.isAbsolute(source)
      ? source
      : path.resolve(path.dirname(inputPath), source);
  }

  fail(`Error: '${inputPath}' is not a folder`, 2);
}

function parseNameMeta(entryName, kind) {
  const ext = kind === "file" ? path.extname(entryName) : "";
  let cleanName = path.basename(entryName, ext);
  let status = null;
  let exclude = false;

  while (true) {
    const match = cleanName.match(MANAGED_SUFFIX_PATTERN);
    if (!match) break;

    const suffix = match[1];
    cleanName = cleanName.slice(0, -match[0].length);

    if (suffix === "Exclude") {
      exclude = true;
    } else if (!status) {
      status = SUFFIX_TO_STATUS[suffix] || null;
    }
  }

  return { cleanName, status, exclude };
}

async function* walk(dir, inheritedExclude = false) {
  const dirMeta = parseNameMeta(path.basename(dir), "directory");
  const dirExcluded = inheritedExclude || dirMeta.exclude;

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => collator.compare(a.name, b.name));

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const kind = entry.isDirectory() ? "directory" : "file";
    const meta = parseNameMeta(entry.name, kind);
    const exclude = dirExcluded || meta.exclude;

    if (entry.isDirectory()) {
      yield* walk(full, exclude);
      continue;
    }

    if (entry.isFile()) {
      yield {
        file: full,
        status: meta.status,
        exclude,
        displayName: meta.cleanName,
      };
    }
  }
}

function getCheckbox(status) {
  if (status === "complete") return "- [x]";
  if (status === "in-progress") return "- [/]";
  if (status === "todo") return "- [>]";
  return "- [ ]";
}

function renderBookLine(file, status, displayName) {
  const uri = pathToFileURL(file).href;
  return `${getCheckbox(status)} [${displayName.replace(/`/g, "")}](${uri})\n`;
}

function renderSection(title, entries) {
  if (entries.length === 0) return "";

  let output = `## ${title}\n\n`;
  for (const { file, status, displayName } of entries) {
    output += renderBookLine(file, status, displayName);
  }
  output += "\n";
  return output;
}

async function generateReadingList(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    fail(`Error: '${root}' is not a folder`, 2);
  }

  const byFolder = new Map();
  const inProgressFiles = [];
  const todoFiles = [];
  const completeFiles = [];
  const excludedFiles = [];

  for await (const entry of walk(root)) {
    const rel = path.relative(root, entry.file);
    const folderRel = path.dirname(rel) === "." ? "" : path.dirname(rel);

    if (entry.exclude) {
      excludedFiles.push(entry);
    } else {
      if (!byFolder.has(folderRel)) byFolder.set(folderRel, []);
      byFolder.get(folderRel).push(entry);
    }

    if (entry.exclude) continue;

    if (entry.status === "in-progress") {
      inProgressFiles.push(entry);
    } else if (entry.status === "todo") {
      todoFiles.push(entry);
    } else if (entry.status === "complete") {
      completeFiles.push(entry);
    }
  }

  const folders = Array.from(byFolder.keys()).sort((a, b) => collator.compare(a, b));
  const rootTitle = parseNameMeta(path.basename(root), "directory").cleanName.replace(/`/g, "");

  let output = `---\ntype: "Books to Read"\nsource: ${JSON.stringify(root)}\n---\n\n`;
  output += renderSection("In Progress", inProgressFiles);
  output += renderSection("To Do", todoFiles);
  output += `# ${rootTitle}\n\n`;

  if (byFolder.has("")) {
    for (const { file, status, displayName } of byFolder.get("")) {
      output += renderBookLine(file, status, displayName);
    }
    output += "\n";
  }

  for (const folderRel of folders) {
    if (folderRel === "") continue;

    const depth = folderRel.split(path.sep).length;
    const level = Math.min(depth + 1, 6);
    const heading = parseNameMeta(path.basename(folderRel), "directory").cleanName.replace(/`/g, "");
    output += `${"#".repeat(level)} ${heading}\n\n`;

    const files = byFolder.get(folderRel).slice().sort((a, b) =>
      collator.compare(path.basename(a.file), path.basename(b.file))
    );

    for (const { file, status, displayName } of files) {
      output += renderBookLine(file, status, displayName);
    }
    output += "\n";
  }

  output += renderSection("Complete", completeFiles);
  output += renderSection("Exclude", excludedFiles);

  return output;
}

async function main(args = process.argv.slice(2), commandExample = "genbookstoread.js /path/to/source-folder [output.md]") {
  if (args.length < 1 || args.length > 2) {
    usage(commandExample);
    process.exit(1);
  }

  const source = resolveSourceInput(path.resolve(args[0]));
  const markdown = await generateReadingList(source);

  if (args[1]) {
    const outputFile = path.resolve(args[1]);
    fs.writeFileSync(outputFile, markdown, "utf8");
    return;
  }

  process.stdout.write(markdown);
}

module.exports = {
  fail,
  generateReadingList,
  main,
};
