# Contribution guidelines

## Commands

### Build

To build the project, run:

```bash
yarn build # or npm start
```

This builds to `/dist` and runs the project.

## Configuration

Code quality is set up using `prettier`.

### TypeScript / Module Formats

This project is set up to build for both ESM and CJS. This is acheived by having a base tsconfig (`tsconfig.base.json`). This config is then extended by two other tsonfic projects, `tsconfig.json` and `tsconfig.cjs.json`.

The project is then built twice, once with each of the two profiles. The result is one `cjd` and one `esm` folder in `dist`. After a successful build, `package.json` files will be added to each directory with the correct `type` key set (`commonjs`/`module`).

## Continuous Integration

### GitHub Actions

Two actions are added by default:

- `main` which installs deps w/ cache, lints, and builds on all pushes against a Node and OS matrix
