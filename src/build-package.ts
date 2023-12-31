import fs from "@flk/fs";
import { removeDirectory } from "@mongez/fs";
import * as path from "path";
import print, { colors } from "./cli";
import compile from "./compile";
import { copyDirectoryExcept } from "./copy-directory-except";
import incrementVersion from "./increment-version";
import markPackageAsDone from "./mark-package-as-done";
import PackageManager, { newPackageManager } from "./package-manager";
import { root } from "./paths";
import publish from "./publish";
import publishToGit from "./publish-to-git";
import Package from "./types/Package";
import updateGitIgnore from "./update-git-ignore";

function getNewVersion(packageData, packageJson) {
  let version = packageData.version;

  if (!version || version === "auto") {
    let currentVersion = packageJson.version || "1.0.0";
    version = incrementVersion(currentVersion);
  }

  return version;
}

function prepareBuildPath(
  packageName: string,
  newVersion: string,
  packageJsonContent: object,
): string {
  const buildPath = root("../", "builds", packageName, newVersion);
  if (!fs.isDirectory(buildPath)) {
    fs.makeDirectory(buildPath);
  }

  return buildPath;
}

function cloneSource(packageData: Package, newVersion: string): string {
  const packageName: string = packageData.name;
  const segments = ["../", "sources", packageName, newVersion];

  const sourcePath = root(...segments);
  //   const packageJsonPath = root(...segments, "package.json");

  //   packageJsonContent["version"] = newVersion;

  removeDirectory(sourcePath);
  fs.makeDirectory(sourcePath);

  //   packageJsonContent["sideEffects"] = false; // for tree-shaking and webpack

  //   fs.putJson(packageJsonPath, packageJsonContent);

  console.log(colors.magenta("Making a backup copy for source code."));

  copyDirectoryExcept(root(packageData.root), sourcePath, ["./node_modules"]);
  console.log(colors.green("Backup has been completed successfully."));

  return sourcePath;
}

function updatePackageJson(
  packageManager: PackageManager,
  packageData: Package,
): void {
  const packageJsonPath = root(
    "../",
    "builds",
    packageData.name,
    packageManager.get("version"),
    "package.json",
  );

  print(colors.cyanBright("Updating Package.json..."));

  if (!packageManager.get("license")) {
    packageManager.set("license", "MIT");
  }

  packageManager.saveTo(packageJsonPath);

  const mainFile = Array.isArray(packageData.entries)
    ? packageData.entries[0]
    : packageData.entries;

  const mainFileType = packageData.mainType || "cjs";

  if (mainFileType === "esm") {
    packageManager.set("type", "module");
  }

  const jsFileName = mainFile?.replace("ts", "js");

  packageManager.set({
    module: `./esm/${jsFileName}`,
    main: `./${mainFileType}/${jsFileName}`,
    // type: mainFileType === "esm" ? "module" : "commonjs",
    typings: `./${mainFileType}/${mainFile
      ?.replace(".tsx", ".d.tsx")
      .replace(".ts", ".d.ts")}`,
  });
}

export default async function buildPackage(
  index: number,
  packageData: Package,
): Promise<any> {
  //
  if (!packageData.packageJsonPath) {
    packageData.packageJsonPath = path.resolve(
      packageData.root,
      "package.json",
    );
  }

  if (!fs.isDirectory(root(packageData.root))) {
    return print(
      `Can not find package root directory: ${root(packageData.root)}.`,
    );
  }

  packageData.hasRepository = fs.isDirectory(
    path.resolve(packageData.root, ".git"),
  );

  if (packageData.hasRepository && !packageData.commit) {
    return print(
      colors.redBright(
        `Can not make a new version without making a commit in the package object in builder.json file.`,
      ),
    );
  }

  const packageJsonPath = packageData.packageJsonPath;

  if (!packageData.type) {
    packageData.type = "typescript";
  }

  const packageJson: any = fs.getJson(packageJsonPath);

  let originalUpdatedPackage = { ...packageJson };

  // update package version that will be uploaded
  const newVersion = getNewVersion(packageData, packageJson);

  print(
    colors.cyan("Building") +
      " " +
      colors.cyan(packageData.name) +
      ` ${colors.yellow("v" + newVersion)}`,
  );

  if (!packageData.entries) {
    packageData.entries = "index.ts";
  }

  let packageManager = newPackageManager(packageJsonPath);

  if (!packageManager.get("name")) {
    packageManager.set("name", packageData.name);
  }

  // set the new version
  packageManager.set("version", newVersion);

  packageData.newVersion = newVersion;

  if (packageData.cloneSource !== false) {
    // clone the source code into the sources directory
    packageData.newSourcePath = cloneSource(packageData, newVersion);
  }

  console.log("Compiling...");

  // create the build path and return it
  const buildPath = prepareBuildPath(
    packageData.name,
    newVersion,
    packageJson,
  ).replace(/\\/g, "/");

  packageData.buildPath = buildPath;

  packageData.packageManager = packageManager;

  // compile the package
  await compile(packageData, buildPath);

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

  updateGitIgnore(buildPath);

  if (packageData.publish === false) return;

  // update package json version and put it in the build directory
  updatePackageJson(packageManager, packageData);

  // publish to npm
  publish(packageData);

  // update the original package.json version for future incremental

  originalUpdatedPackage["version"] = packageManager.get("version");

  fs.putJson(packageJsonPath, originalUpdatedPackage);

  // Push to repository
  if (packageData.hasRepository) {
    print(colors.magentaBright("Publishing to repository...."));
    publishToGit(packageData);
  }

  // update package json as done
  markPackageAsDone(packageData.name);

  print(
    colors.greenBright(
      `${packageData.name}@${packageManager.get(
        "version",
      )} has been published successfully.`,
    ),
  );
}
