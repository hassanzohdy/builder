import Package from "./types/Package";
import print, { colors } from "./cli";
import exec from "./exec";

export default function publish(packageData: Package): void {
  print(colors.magentaBright("Publishing to npm"));

  exec("yarn", ["publish", "--access", "public", "--non-interactive"], {
    cwd: packageData.buildPath,
    stdio: "inherit",
  });
}
