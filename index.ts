import chalk from 'chalk';
import builder from "./builder.json";
import build from "./src/build";
import Package from "./src/types/Package";

const packages: Package[] = builder.packages as Package[];

if (! builder.build || builder.build.length === 0) {
  console.log(chalk.red("No build specified in builder.json"));

  process.exit(1);
}

const builds = packages
  .filter((packageData: Package) => {
    const name: string = packageData.name;
    return builder.build.length === 1 && builder.build[0] === "*"
      ? true
      : builder.build && builder.build.includes(name);
  })
  .map((packageData: Package) => {
    if (builder.build.length === 1 && builder.build[0] === "*") {
      packageData.commit = "Fixing Bundle";
    }

    return packageData;
  });

build(builds as Package[]);
