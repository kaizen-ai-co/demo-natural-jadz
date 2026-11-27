import globals from "globals";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y-x";

export default [
  {
    ignores: [
      "dist/",
      ".artifact/",
      ".astro/",
      "node_modules/",
      "screenshots/",
      ".playwright-mcp/",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-recommended"],
  // Accesibilidad también en islas React (.tsx)
  { files: ["**/*.tsx"], ...jsxA11y.configs.recommended },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
