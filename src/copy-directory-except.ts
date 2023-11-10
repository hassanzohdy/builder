import fs from "fs";
import path from "path";

export function copyDirectoryExcept(
  source: string,
  destination: string,
  exceptPaths: string[]
) {
  try {
    // Check if source and destination exist
    if (!fs.existsSync(source)) {
      throw new Error(`Source directory ${source} does not exist`);
    }
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    // Get list of files and directories in source directory
    const files = fs.readdirSync(source);

    exceptPaths = exceptPaths.map((exceptPath) =>
      path.join(source, exceptPath)
    );

    // Loop through files and directories
    for (const file of files) {
      const filePath = path.join(source, file);

      // Check if file or directory is in exceptPaths
      if (exceptPaths.includes(filePath)) {
        continue;
      }

      // Get stats of file or directory
      const stats = fs.statSync(filePath);

      // If file is a directory, recursively copy the directory
      if (stats.isDirectory()) {
        const newDestination = path.join(destination, file);
        copyDirectoryExcept(filePath, newDestination, exceptPaths);
      }
      // If file is a file, copy the file to the destination
      else if (stats.isFile()) {
        const newFilePath = path.join(destination, file);
        fs.copyFileSync(filePath, newFilePath);
      }
    }
  } catch (error) {
    console.error(`Error copying directory: ${error}`);
  }
}
