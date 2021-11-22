const reporters = ["default"];

if (process.env.NODE_ENV.toUpperCase() === "CI")
  reporters.push([
    "jest-junit",
    {
      outputName: "e2e.xml",
    },
  ]);

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  collectCoverageFrom: ["src/index.ts"],
  preset: "ts-jest",
  roots: ["<rootDir>"],
  testEnvironment: "node",
  transform: { "^.+\\.(ts|tsx|js|jsx)?$": "ts-jest" },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$"],
};

module.exports = config;
