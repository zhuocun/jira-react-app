module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    overrides: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: [
        "react",
        "react-hooks",
        "@typescript-eslint",
        "prettier",
        "better-styled-components",
        "import",
        "react",
        "simple-import-sort"
    ],
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react-hooks/exhaustive-deps": "warn",
        "better-styled-components/sort-declarations-alphabetically": 2,
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "sort-imports": ["error", { ignoreDeclarationSort: true }],
        "import/order": [
            "error",
            {
                groups: ["builtin", "external", "parent"],
                "newlines-between": "always",
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true
                }
            }
        ]
    },
    settings: {
        react: {
            version: "detect"
        }
    }
};
