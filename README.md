# eslint-config-next

## Installation

1. Setup your local `.npmrc` with a GitHub token. See [this guide](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) for more information.

  ```bash
  echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc
  ```

2. Inside your project, create a `.npmrc` that points `@totominc` scope to GitHub Packages npm registry.

  ```bash
  echo "@totominc:registry=https://npm.pkg.github.com" >> .npmrc
  ```

3. Install the package and its required dependencies.

  ```bash
  npm install --save-dev @totominc/eslint-config-next eslint prettier
  ```

4. Create an `.eslintrc.cjs` file in the root of your project with the following content:

  ```js
  module.exports = {
    extends: ["@totominc/next"],

    parserOptions: {
      project: "./tsconfig.json"
    },
  };
  ```

5. Create a `prettier.config.js` file in the root of your project with the following content:

  ```js
  module.exports = {
    plugins: ["prettier-plugin-tailwindcss"],
  };
  ```

6. If deploying on Vercel, [add the following environment variable](https://vercel.com/guides/using-private-dependencies-with-vercel#other-package-registries) to your project:

  ```bash
  NPM_RC=//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
  ```

  This is required to make sure that Vercel can access and install the package from GitHub Packages npm registry.
