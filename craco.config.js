module.exports = {
    eslint: {
        enable: false
    },
    jest: {
        configure: {
            moduleNameMapper: {
                "^@rc-component/picker/(.*)$":
                    "<rootDir>/node_modules/@rc-component/picker/lib/$1",
                "^@rc-component/picker/locale/(.*)$":
                    "<rootDir>/node_modules/@rc-component/picker/lib/locale/$1",
                "^react-router$":
                    "<rootDir>/node_modules/react-router/dist/development/index.js",
                "^react-router-dom$":
                    "<rootDir>/node_modules/react-router-dom/dist/index.js",
                "^react-router/dom$":
                    "<rootDir>/node_modules/react-router/dist/development/dom-export.js"
            }
        }
    }
};
