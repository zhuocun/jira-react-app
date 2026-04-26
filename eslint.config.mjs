import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

export default [
    {
        ignores: ["build/**", "coverage/**", "dist/**", "node_modules/**"],
        linterOptions: {
            reportUnusedDisableDirectives: false
        }
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },
                sourceType: "module"
            },
            sourceType: "module"
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            prettier: prettierPlugin,
            "simple-import-sort": simpleImportSortPlugin
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-var-requires": "off",
            "no-console": "warn",
            "no-nested-ternary": "off",
            "no-param-reassign": [
                "error",
                {
                    props: false
                }
            ],
            "no-plusplus": "off",
            "no-restricted-exports": "off",
            "no-shadow": "off",
            "no-undef": "off",
            "no-underscore-dangle": [
                "error",
                {
                    allow: ["_id"]
                }
            ],
            "no-unused-vars": "off",
            "no-use-before-define": ["error", "nofunc"],
            "prettier/prettier": "error",
            "simple-import-sort/exports": "error"
        }
    }
];
