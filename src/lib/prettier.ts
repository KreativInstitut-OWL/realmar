import type { Plugin } from "prettier";
import * as prettierPluginBabel from "prettier/plugins/babel.js";
import * as prettierPluginEstree from "prettier/plugins/estree.js";
import * as prettierPluginHtml from "prettier/plugins/html.js";
import * as prettier from "prettier/standalone.js";

export function prettifyHtml(html: string) {
  return prettier.format(html, {
    parser: "html",
    plugins: [
      prettierPluginHtml,
      prettierPluginBabel,
      prettierPluginEstree as Plugin,
    ],
    htmlWhitespaceSensitivity: "ignore",
  });
}

export function prettifyJs(js: string) {
  return prettier.format(js, {
    parser: "babel",
    plugins: [prettierPluginBabel],
  });
}
