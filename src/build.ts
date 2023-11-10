import buildPackage from "./build-package";
import { colors } from "./cli";
import Package from "./types/Package";

export default async function build(packages: Package[]) {
  if (packages.length === 0) {
    return console.log(
      colors.bold.redBright("packages key is empty in builder.json file, ") +
        colors.yellow("Nothing to build, exiting...")
    );
  }

  for (let index = 0; index < packages.length; index++) {
    const packageData: Package = packages[index];

    // await buildPackage(index, packageData);
    buildPackage(index, packageData);
  }
}
