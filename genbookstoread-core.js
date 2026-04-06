const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const SUFFIX_TO_STATUS = {
  "In Progress": "in-progress",
  "To Do": "todo",
  Complete: "complete",
  "Not Complete": "partially-complete",
};
const MANAGED_SUFFIX_PATTERN = / \[(In Progress|To Do|Complete|Not Complete|Exclude)\]$/;

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function usage(commandExamples = ["genbookstoread.js --source /path/to/source-folder"]) {
  console.error(
    [
      "Usage:",
      ...commandExamples.map((example) => `  ${example}`),
      "",
      "Source selection:",
      "  - pass --source <folder>, or",
      "  - pass --out <existing-note.md> where the file already has frontmatter source: \"/path/to/folder\"",
      "",
      "Optional:",
      "  --out <file>         Markdown output file. Leave this out to write to stdout.",
      "  --help               Show this help message.",
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

function resolveSourceFolder(inputPath) {
  if (!fs.existsSync(inputPath)) {
    fail(`Error: '${inputPath}' does not exist`, 2);
  }

  const stats = fs.statSync(inputPath);
  if (stats.isDirectory()) {
    return inputPath;
  }

  fail(`Error: '${inputPath}' is not a folder`, 2);
}

function resolveSourceFromExistingOutput(outputPath) {
  if (!outputPath || !fs.existsSync(outputPath)) return null;

  const stats = fs.statSync(outputPath);
  if (!stats.isFile()) return null;

  const markdown = fs.readFileSync(outputPath, "utf8");
  const source = parseFrontmatterSource(markdown);
  if (source === null || source === "") return null;

  return path.isAbsolute(source)
    ? source
    : path.resolve(path.dirname(outputPath), source);
}

function parseCliArgs(args) {
  const options = {
    out: null,
    source: null,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "--source" || arg === "-s") {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        fail("Error: --source requires a folder path", 1);
      }
      options.source = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--source=")) {
      options.source = arg.slice("--source=".length);
      continue;
    }

    if (arg === "--out" || arg === "-o") {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        fail("Error: --out requires a file path", 1);
      }
      options.out = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--out=")) {
      options.out = arg.slice("--out=".length);
      continue;
    }

    fail(`Error: Unknown argument '${arg}'`, 1);
  }

  return options;
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
    if (entry.name.startsWith(".")) continue;

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
  if (status === "partially-complete") return "- [-]";
  return "- [ ]";
}

function renderBookLine(file, status, displayName) {
  const uri = pathToFileURL(file).href;
  return `${getCheckbox(status)} [${displayName.replace(/`/g, "")}](${uri})\n`;
}

function renderEntries(entries) {
  let output = "";
  for (const { file, status, displayName } of entries) {
    output += renderBookLine(file, status, displayName);
  }
  return output;
}

function renderSection(title, entries, level = 2) {
  if (entries.length === 0) return "";

  let output = `${"#".repeat(level)} ${title}\n\n`;
  output += renderEntries(entries);
  output += "\n";
  return output;
}

function padNumber(value, length = 2) {
  return String(value).padStart(length, "0");
}

function formatLocalTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());
  const milliseconds = padNumber(date.getMilliseconds(), 3);

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = padNumber(Math.floor(absoluteOffsetMinutes / 60));
  const offsetRemainderMinutes = padNumber(absoluteOffsetMinutes % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

async function generateReadingList(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    fail(`Error: '${root}' is not a folder`, 2);
  }

  const byFolder = new Map();
  const inProgressFiles = [];
  const todoFiles = [];
  const completeFiles = [];
  const partiallyCompleteFiles = [];
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
    } else if (entry.status === "partially-complete") {
      partiallyCompleteFiles.push(entry);
    }
  }

  const folders = Array.from(byFolder.keys()).sort((a, b) => collator.compare(a, b));
  const rootTitle = parseNameMeta(path.basename(root), "directory").cleanName.replace(/`/g, "");
  const lastUpdated = formatLocalTimestamp();

  let output = `---\ntype: "Books to Read"\nsource: ${JSON.stringify(root)}\nlastupdated: ${JSON.stringify(lastUpdated)}\n---\n\n`;
  output += renderSection("Currently Reading", inProgressFiles);
  output += renderSection("Reading Next", todoFiles);
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

  if (completeFiles.length > 0 || partiallyCompleteFiles.length > 0) {
    output += "## Read\n\n";

    if (completeFiles.length > 0) {
      output += renderEntries(completeFiles);
      output += "\n";
    }

    output += renderSection("Did Not Finish", partiallyCompleteFiles, 3);
  }

  output += renderSection("Exclude", excludedFiles);

  return output;
}

async function main(
  args = process.argv.slice(2),
  commandExamples = [
    "genbookstoread.js --source /path/to/source-folder",
    "genbookstoread.js --source /path/to/source-folder --out output.md",
    "genbookstoread.js --out existing-note.md",
  ]
) {
  const options = parseCliArgs(args);

  if (options.help) {
    usage(commandExamples);
    process.exit(0);
  }

  const outputFile = options.out ? path.resolve(options.out) : null;
  const sourcePath = options.source
    ? path.resolve(options.source)
    : resolveSourceFromExistingOutput(outputFile);

  if (!sourcePath) {
    usage(commandExamples);
    console.error("");
    console.error("Error: pass --source, or point --out at an existing file with frontmatter source: \"/path/to/folder\"");
    process.exit(1);
  }

  const source = resolveSourceFolder(sourcePath);
  const markdown = await generateReadingList(source);

  if (outputFile) {
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
