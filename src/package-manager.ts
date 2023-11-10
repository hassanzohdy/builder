import fs from "@flk/fs";

export default class PackageManager {
  private content: object;
  public currentVersion: string = "";

  public constructor(private path: string) {
    this.content = fs.getJson(this.path);

    this.currentVersion = this.content["version"];
  }

  public set(key: string | object, value?: any): PackageManager {
    if (typeof key === "string") {
      this.content[key] = value;
    } else {
      this.content = { ...this.content, ...key };
    }

    return this;
  }

  public get(key: string): any {
    return this.content[key];
  }

  public remove(key: string): PackageManager {
    delete this.content[key];

    return this;
  }

  public saveTo(newPath: string): void {
    fs.putJson(newPath, this.content);
  }
}

let currentPackageInstance: PackageManager;

export function newPackageManager(path: string): PackageManager {
  const manager = new PackageManager(path);
  currentPackageInstance = manager;
  return manager;
}

export function currentPackageManager(): PackageManager {
  return currentPackageInstance;
}
