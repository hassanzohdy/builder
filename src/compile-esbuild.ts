// import { removeDirectory } from "@mongez/fs";
// import esbuild from "esbuild";
// import path from "path";
// import { root } from "./paths";
// import Package from "./types/Package";

// export async function compileEsbuild(packageData: Package, buildPath: string) {
//   const rootPath = (
//     packageData.newSourcePath || root(packageData.root)
//   ).replace(/\\/g, "/");

//   removeDirectory(buildPath);

//   await compile({
//     rootPath,
//     format: "esm",
//     buildPath,
//     packageData,
//   });
// }

// async function compile({
//   rootPath,
//   format,
//   buildPath,
//   packageData,
// }: {
//   rootPath: string;
//   format: "cjs" | "esm";
//   buildPath: string;
//   packageData: Package;
// }) {
//   const entries = (
//     (!Array.isArray(packageData.entries)
//       ? [packageData.entries]
//       : packageData.entries) as string[]
//   ).map((entry: string) => path.resolve(rootPath, "src", entry));

//   console.log(entries);

//   await esbuild.build({
//     entryPoints: ["D:\\xampp\\htdocs\\test\\esm/index.ts"],
//     format,
//     entryNames: "[dir]/[name]-[hash]",
//     // packages: "external",
//     // sourcemap: "linked",
//     // sourcesContent: true,
//     // outdir: buildPath + "/" + format,
//     outdir: "D:\\xampp\\htdocs\\test\\esbuild",
//     // platform: "neutral",
//     // target: "node12",
//     // export typings as well
//     // write: true,
//   });
// }
