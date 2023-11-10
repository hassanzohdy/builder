import childProcess from "cross-spawn";
import print, { colors } from "./cli";

export default function exec(...params: any[]): any {
  print(
    `Executing command: ${colors.bold(params[0] + " " + params[1].join(" "))}`
  );

  let command = childProcess.sync(...params);

  // it means command didn't end as expected, then stop the rest of the program
  if (command.error !== null) {
    process.exit(1);
  }

  return command;
}
