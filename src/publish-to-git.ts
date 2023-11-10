import exec from "./exec";
import Package from "./types/Package";

export default async function publishToGit(packageData: Package) {
  await exec("git", ["add", "."], {
    cwd: packageData.root,
    stdio: "inherit",
  });

  await exec("git", ["commit", "-m", `"${packageData.commit}"`], {
    cwd: packageData.root,
    stdio: "inherit",
  });

  await exec("git", ["push", "-u"], {
    cwd: packageData.root,
    stdio: "inherit",
  });

  await exec("git", ["tag", packageData.newVersion], {
    cwd: packageData.root,
    stdio: "inherit",
  });

  await exec("git", ["push", "origin", "--tags"], {
    cwd: packageData.root,
    stdio: "inherit",
  });

  const pushTo = ["push", "-u"];

  if (packageData.branch) {
    pushTo.push("origin", packageData.branch);
  }

  await exec("git", pushTo, {
    cwd: packageData.root,
    stdio: "inherit",
  });
}
