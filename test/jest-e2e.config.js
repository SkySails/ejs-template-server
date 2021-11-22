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
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  reporters,
};

module.exports = config;
