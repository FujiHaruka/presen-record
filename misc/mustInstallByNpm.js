#!/usr/bin/env node

/**
 * Make sure people using `npm install`
 */
'use strict'

const red = (msg) => `\x1b[41m${msg}\x1b[0m`

{
  const byNpm = /npm/.test(process.env.npm_execpath)
  if (!byNpm) {
    console.error(`
${red('[YOU_MUST_USE_NPM]')} Use \`npm install\` for this project, NOT \`yarn install\`.
`)
    process.exit(1)
  }
}
