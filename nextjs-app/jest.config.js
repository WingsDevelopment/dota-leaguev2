// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  // Exclude all node_modules except next-auth, @auth and oauth4webapi
  transformIgnorePatterns: ["/node_modules/(?!next-auth|@auth|oauth4webapi)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
