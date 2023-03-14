/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "next/core-web-vitals",
    "airbnb",
    "airbnb-typescript",
    "plugin:prettier/recommended"
  ],

  rules: {
    "import/prefer-default-export": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-array-index-key": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off"
  },

  "overrides": [
    {
      "files": ["./pages/api/**/*.ts"],
      "rules": {
        // Allow console.log in serverless functions endpoints.
        "no-console": "off"
      }
    }
  ]
};