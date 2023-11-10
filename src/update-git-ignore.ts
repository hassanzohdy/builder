import { fs } from "@flk/fs";
import { clonable } from "./paths";
import Package from "./types/Package";

export default function updateGitIgnore(buildPath: string): void {
  // fs.copy(clonable(".gitignore"), buildPath + "/.gitignore");
}
