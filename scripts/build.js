/* eslint-env node */

const rollup = require("rollup")
const babel = require("rollup-plugin-babel")
const npm = require("rollup-plugin-node-resolve")
const json = require("rollup-plugin-json")


rollup.rollup({
  entry: "src/app.js",
  plugins: [
    npm({
      jsnext: true,
      main: true
    }),
    json(),
    babel()
  ]
}).then(bundle => {
  bundle.write({
    dest: "build/app.js",
    format: "iife"
  })
})
.catch(error => console.error(error))
