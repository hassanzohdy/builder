import prettier, { Options } from "prettier";

export default function formatCode(
  code: string,
  parser?: Options["parser"]
): string {
  return prettier.format(code, {
    parser: parser,
  });
}
