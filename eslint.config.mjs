// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
      },
    },
  },
  {
    rules: {
      //"@typescript-eslint/no-explicit-any ": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "classProperty",
          format: ["camelCase"],
        },
        {
          selector: "method",
          format: ["camelCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["camelCase"], 
        },
      ],
      "spaced-comment": ["error", "always"],
    },
  },
  {
    files: ["tests/**", "pages/**"],
    extends: [playwright.configs["flat/recommended"]],
    rules: {
      // Customize Playwright rules
      // ...
    },
  }
);
