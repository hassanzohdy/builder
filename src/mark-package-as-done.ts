import fs from "@flk/fs";
import print, { colors } from "./cli";
import formatCode from "./formatCode";
import { builderPath } from "./paths";
import Package from "./types/Package";

export default async function markPackageAsDone(packageName: string) {
  const builderContent = fs.getJson(builderPath());
  const packages = builderContent["build"] as string[];

  const packageData: Package = builderContent["packages"].find(
    (packageData: Package) => packageData.name === packageName,
  );

  if (packageData.commit) {
    delete packageData.commit;
  }

  if (packageData.version) {
    delete packageData.version;
  }

  const packageIndex = packages.indexOf(packageName);

  packages.splice(packageIndex, 1);

  fs.put(builderPath(), await formatCode(JSON.stringify(builderContent), "json"));

  print(colors.yellow("Package Is cleared from builder"));
}
