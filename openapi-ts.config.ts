import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/openapi.json",
  output: "src/client",
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      asSDK: true,
    },
    "@tanstack/react-query",
  ],
});
