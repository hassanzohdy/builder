import path from "path";

export function root(...morePaths: string[]) {
  return path.resolve(process.cwd(), ...morePaths);
}

export function builderPath(): string {
  return root("builder.json");
}

export function clonable(...morePaths: string[]) {
  return root("cloneable", ...morePaths);
}
