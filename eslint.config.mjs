import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-inline-comments": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "BlockComment",
          message: "Use JSDoc/TSDoc for documentation.",
        },
        {
          selector:
            'LineComment:not(Program > LineComment, :matches([id.name=\"TODO\"],[id.name=\"FIXME\"]))',
          message:
            "Comments are discouraged. Explain 'why', not 'what'. Use JSDoc/TSDoc for APIs.",
        },
      ],
    },
  },
  {
    ignores: [
      "dist",
      "eslint.config.mjs",
      "coverage",
      "node_modules",
      "{.,}next/",
    ],
  },
];

export default eslintConfig;
