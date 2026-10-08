
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const frontendRoot = process.cwd();
const projectRoot = path.resolve(frontendRoot, "..");

const backendAdminPath = path.join(projectRoot, "backend", "admin");

const legacyFiles = [
  "auth.php",
  "dashboard.php",
  "index.php",
  "logout.php",
];

const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".vite",
]);

const allowedExtensions = new Set([
  ".php",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".html",
  ".css",
]);

function lineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

function walkDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkDirectory(fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      continue;
    }

    results.push(fullPath);
  }

  return results;
}

function relativePath(filePath) {
  return path.relative(projectRoot, filePath);
}

function searchReferences(files, targetFile) {
  const references = [];

  const normalizedTarget = targetFile.replaceAll("\\", "/");

  const searchPatterns = [
    targetFile,
    normalizedTarget,
    `admin/${targetFile}`,
    `admin\\${targetFile}`,
    `../admin/${targetFile}`,
    `../admin\\${targetFile}`,
    `/admin/${targetFile}`,
    `/admin\\${targetFile}`,
    `backend/admin/${targetFile}`,
    `backend/admin\\${targetFile}`,
  ];

  for (const file of files) {
    if (path.basename(file) === targetFile) {
      continue;
    }

    let content;

    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const pattern of searchPatterns) {
      let startIndex = 0;

      while (true) {
        const index = content.indexOf(pattern, startIndex);

        if (index === -1) {
          break;
        }

        references.push({
          file,
          line: lineNumber(content, index),
          pattern,
        });

        startIndex = index + pattern.length;
      }
    }
  }

  return references;
}

function printReferences(references) {
  if (references.length === 0) {
    console.log("  ✓ No references found.");
    return;
  }

  const unique = new Map();

  for (const reference of references) {
    const key =
      `${relativePath(reference.file)}:${reference.line}:${reference.pattern}`;

    if (!unique.has(key)) {
      unique.set(key, reference);
    }
  }

  for (const reference of unique.values()) {
    console.log(
      `  → ${relativePath(reference.file)}:${reference.line}`
    );

    console.log(
      `    matched: ${reference.pattern}`
    );
  }
}

console.clear();

console.log("─".repeat(78));
console.log(" XeooTools Legacy Admin Dependency Scanner");
console.log("─".repeat(78));

console.log("");
console.log(`Project : ${projectRoot}`);
console.log(`Scanning: ${backendAdminPath}`);

if (!fs.existsSync(backendAdminPath)) {
  console.log("");
  console.log("✗ backend/admin directory was not found.");
  process.exit(1);
}

const files = walkDirectory(projectRoot);

console.log("");
console.log(`Files scanned: ${files.length}`);

let totalReferences = 0;

for (const legacyFile of legacyFiles) {
  const targetPath = path.join(
    backendAdminPath,
    legacyFile
  );

  console.log("");
  console.log(`LEGACY FILE: backend/admin/${legacyFile}`);
  console.log("─".repeat(78));

  if (!fs.existsSync(targetPath)) {
    console.log("  ⚠ File does not exist.");
    continue;
  }

  const references = searchReferences(
    files,
    legacyFile
  );

  printReferences(references);

  totalReferences += references.length;
}

console.log("");
console.log("─".repeat(78));

if (totalReferences === 0) {
  console.log(
    "✓ No references to legacy admin PHP files were found."
  );

  console.log("");
  console.log(
    "The legacy admin files appear to be unused."
  );

  console.log(
    "They can be reviewed for removal."
  );
} else {
  console.log(
    `⚠ Found ${totalReferences} possible legacy references.`
  );

  console.log("");
  console.log(
    "Do NOT delete the legacy files yet."
  );

  console.log(
    "Review the references above first."
  );
}

console.log("─".repeat(78));
console.log("");

