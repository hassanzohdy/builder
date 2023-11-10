import path from "path";

export function root(...morePaths: string[]) {
  return path.join(__dirname, "../", ...morePaths);
}

export function builderPath(): string {
  return root("builder.json");
}

export function clonable(...morePaths: string[]) {
  return root("cloneable", ...morePaths);
}
