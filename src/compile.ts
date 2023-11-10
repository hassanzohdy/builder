import fs from "@flk/fs";
import * as path from "path";
import print, { colors } from "./cli";
import exec from "./exec";
import { currentPackageManager } from "./package-manager";
import { clonable, root } from "./paths";
import Package from "./types/Package";

function compileRollup(buildPath: string, packageData: Package): void {
  const rootPath = (
    packageData.newSourcePath || root(packageData.root)
  ).replace(/\\/g, "/");

  compileRollupFormat(rootPath, buildPath, packageData, "esm");
  compileRollupFormat(rootPath, buildPath, packageData, "cjs");

  const mainFile = Array.isArray(packageData.entries)
    ? packageData.entries[0]
    : packageData.entries;

  const jsFileName = mainFile?.replace("ts", "js");

  const mainFileType = packageData.mainType || "cjs";

  currentPackageManager().set({
    module: `./esm/${jsFileName}`,
    main: `./${mainFileType}/${jsFileName}`,
    // type: mainFileType === "esm" ? "module" : "commonjs",
    typings: `./${mainFileType}/${mainFile
      ?.replace(".tsx", ".d.tsx")
      .replace(".ts", ".d.ts")}`,
  });

  if (mainFileType === "esm") {
    currentPackageManager().set("type", "module");
  }

  // check if there is any clones
  if (packageData.clone) {
    for (let cloningPath of packageData.clone) {
      let cloneTo = cloningPath;
      if (Array.isArray(cloningPath)) {
        cloneTo = cloningPath[1];
        cloningPath = cloningPath[0];
      }

      const fullPath = path.resolve(packageData.root, cloningPath);
      fs.copy(fullPath, path.resolve(buildPath, cloneTo));
    }
  }
}

function compileRollupFormat(
  rootPath: string,
  buildPath: string,
  packageData: Package,
  format: string
): void {
  print(
    colors.yellowBright(`Bundling With Rollup ${colors.bold.yellow(format)}...`)
  );

  buildPath += "/" + format;

  if (!fs.isDirectory(buildPath)) {
    fs.makeDirectory(buildPath);
  }

  const newTSConfigPath = packageData.newSourcePath + "/tsconfig.json";

  const rootApp = packageData.srcDirectory
    ? path.resolve(rootPath.replace(/\\/g, "/"), packageData.srcDirectory)
    : rootPath.replace(/\\/g, "/") + "/src"; // to avoid any other outside files and directories

  const tsConfigContent = fs
    .get(clonable("tsconfig.json"))
    .replace(new RegExp("ROOT_DIR", "g"), rootApp)
    .replace("OUT_DIR", buildPath.replace(/\\/g, "/"));

  fs.put(newTSConfigPath, tsConfigContent);

  const configPath = packageData.newSourcePath + "/rollup.config.js";

  let content = fs
    .get(clonable("rollup.config.js"))
    .replace(new RegExp("ROOT_DIR", "g"), rootApp)
    .replace("EXPORT_MODE", format === "esm" ? "auto" : "named")
    .replace("OUT_DIR", buildPath)
    .replace("FORMAT_NAME", format === "esm" ? "es" : format);

  if (Array.isArray(packageData.entries)) {
    const entries: string[] = [];
    packageData.entries.forEach((entry) => {
      entries.push(rootApp + "/" + entry);
    });

    content = content.replace("ROOT_FILE_PATH", JSON.stringify(entries));
  } else {
    content = content.replace(
      "ROOT_FILE_PATH",
      `"${rootApp + "/" + packageData.entries}"`
    );
  }

  fs.put(configPath, content);

  if (packageData.type === "react") {
    clonable(".babelrc");
  }

  // exec("npx", ["rollup", "-c", configPath, '--bundleConfigAsCjs'], {
  const args = ["rollup", "-c", configPath, "--bundleConfigAsCjs"];

  if (format === "cjs") {
    args.push("--no-dynamicImportInCjs");
  }

  exec("npx", args, {
    cwd: rootPath,
    stdio: "inherit",
  });
}

export default function compile(packageData: Package, buildPath: string): void {
  compileRollup(buildPath, packageData);
}
