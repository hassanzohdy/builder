import PackageManager from "./../package-manager";

type Package = {
  name: string;
  root: string;
  publish?: boolean;
  packageJsonPath?: string;
  hasRepository?: boolean;
  commit?: string;
  branch?: string;
  mainType?: "cjs" | "esm";
  version?: "auto" | string;
  type?: "typescript" | "react";
  repositoryUrl?: string;
  cloneSource?: boolean;
  srcDirectory?: string;
  newSourcePath?: string; // defined on the fly
  newVersion?: string; // defined on the fly
  entries?: string | string[];
  buildPath?: string; // defined on the fly
  packageManager?: PackageManager;
  clone?: string[];
};

export default Package;
