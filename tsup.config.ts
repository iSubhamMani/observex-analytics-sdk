import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react.tsx", "src/next.tsx"],
  format: ["cjs", "esm"], // Outputs both CommonJS and ES Modules
  dts: true, // Generates .d.ts definition files automatically
  splitting: false,
  sourcemap: true,
  clean: true, // Clears the dist folder before rebuilding
  minify: true, // Compresses the production bundle size
  external: ["react", "next"], // Don't pack react or next source code into your library
});
