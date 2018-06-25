import typescript from "rollup-plugin-typescript2";
import autoExternal from "rollup-plugin-auto-external";
import path from "path";

export default {
  input: path.resolve(__dirname, "./src/main.ts"),
  output: {
    file: path.resolve(__dirname, "../main.js"),
    format: "cjs"
  },
  external: ["electron"],
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, "./tsconfig.json")
    }),
    autoExternal({
      builtins: true,
      packagePath: path.resolve(__dirname, "../package.json")
    })
  ]
};
