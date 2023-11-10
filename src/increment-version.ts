type VersionUpdateMode = "major" | "minor" | "patch";

function totalDots(string: string): number {
  return string.split(".").length - 1;
}

/**
 * Update the given version based on package.json versioning schema
 *
 * @param {string} version
 * @param {VersionUpdateMode} mode
 * @returns {string}
 */
export default function incrementVersion(
  version: string,
  mode: VersionUpdateMode = "patch"
): string {
  if (totalDots(version) > 3) {
    throw new Error(
      `Version schema must be major.minor.patch schema i.e 1.0.0 provided version: ${version}`
    );
  }

  while (totalDots(version) < 3) {
    version += ".0";
  }

  const [major, minor, patch] = version.split(".").map(Number);

  if (mode === "major") {
    return `${major + 1}.${minor}.${patch}`;
  } else if (mode === "minor") {
    return `${major}.${minor + 1}.${patch}`;
  } else if (mode === "patch") {
    return `${major}.${minor}.${patch + 1}`;
  }

  return version;
}
