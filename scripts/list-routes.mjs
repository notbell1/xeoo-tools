import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const frontendRoot = process.cwd();
const projectRoot = path.resolve(frontendRoot, "..");

const appPath = path.join(frontendRoot, "src", "App.tsx");
const viteConfigPath = path.join(frontendRoot, "vite.config.ts");

const backendApiPath = path.join(projectRoot, "backend", "api");
const backendAdminPath = path.join(projectRoot, "backend", "admin");

const LINE = "─".repeat(78);

function section(title) {
  console.log("");
  console.log(title);
  console.log(LINE);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  if (!fileExists(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function getReactRoutes() {
  const content = readFile(appPath);

  if (!content) {
    return [];
  }

  const routes = [];
  const routeRegex =
    /<Route\s+path=["'`]([^"'`]+)["'`]\s+element=\{<([A-Za-z0-9_]+)[^>]*\/>\}/g;

  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      path: match[1],
      component: match[2],
    });
  }

  return routes;
}

function getViteProxy() {
  const content = readFile(viteConfigPath);

  if (!content) {
    return [];
  }

  const proxies = [];

  const proxyRegex =
    /["'`]([^"'`]+)["'`]\s*:\s*\{\s*[\s\S]{0,500}?target\s*:\s*["'`]([^"'`]+)["'`]/g;

  let match;

  while ((match = proxyRegex.exec(content)) !== null) {
    proxies.push({
      prefix: match[1],
      target: match[2],
    });
  }

  return proxies;
}

function getPhpFiles(directory) {
  if (!fileExists(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, {
      withFileTypes: true,
    })
    .filter((entry) => {
      return entry.isFile() && entry.name.toLowerCase().endsWith(".php");
    })
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getPhpRoutes(directory, relativePrefix) {
  const files = getPhpFiles(directory);

  return files.map((file) => ({
    file,
    route: `${relativePrefix}/${file}`,
  }));
}

function printFrontendRoutes() {
  const routes = getReactRoutes();

  section("FRONTEND — React Router");

  if (routes.length === 0) {
    console.log("No React routes found.");
    return;
  }

  for (const route of routes) {
    console.log(`${route.path.padEnd(36)} → ${route.component}`);
  }

  console.log("");
  console.log(`Total: ${routes.length} React routes`);
}

function printViteProxy() {
  const proxies = getViteProxy();

  section("VITE — Development Proxy");

  if (proxies.length === 0) {
    console.log("No Vite proxy detected.");
    return;
  }

  for (const proxy of proxies) {
    console.log(`${proxy.prefix.padEnd(20)} → ${proxy.target}`);
  }

  console.log("");
  console.log(`Total: ${proxies.length} Vite proxy rules`);
}

function printPhpRoutes() {
  const apiRoutes = getPhpRoutes(backendApiPath, "/backend/api");

  const adminRoutes = getPhpRoutes(backendAdminPath, "/backend/admin");

  section("BACKEND — PHP API");

  if (apiRoutes.length === 0) {
    console.log("No PHP API files found.");
  } else {
    for (const item of apiRoutes) {
      console.log(item.route);
    }

    console.log("");
    console.log(`Total: ${apiRoutes.length} PHP API files`);
  }

  section("BACKEND — Legacy/Admin PHP");

  if (adminRoutes.length === 0) {
    console.log("No PHP admin files found.");
  } else {
    for (const item of adminRoutes) {
      console.log(item.route);
    }

    console.log("");
    console.log(`Total: ${adminRoutes.length} legacy/admin PHP files`);
  }
}

console.clear();

console.log(LINE);
console.log(" XeooTools Route Scanner");
console.log(LINE);

console.log("");
console.log(`Project : ${projectRoot}`);
console.log(`Frontend: ${frontendRoot}`);

printFrontendRoutes();
printViteProxy();
printPhpRoutes();

console.log("");
console.log(LINE);
console.log(" Route scan completed.");
console.log(LINE);
