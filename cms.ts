import { yellow } from "./deps/colors.ts";
const specifier = "https://cdn.jsdelivr.net/gh/lumeland/cms@0.5.5/";

throw new Error(`
  This module is not longer available.
  Please, add this import to your import map:

  ${yellow(`"lume/cms/": "${specifier}"`)}

  And then, replace the import statement in your code:

  ${yellow(`import lumeCMS from "lume/cms/mod.ts";`)}
`);
