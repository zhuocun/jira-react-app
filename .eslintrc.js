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
    plugins: ["react", "react-hooks", "@typescript-eslint"],
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
        react: {
            version: "detect"
        }
    }
};
