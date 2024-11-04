import { execSync } from 'child_process'

const args = process.argv.slice(2)
const script = args[0]

if (!script) {
  console.error('Please provide a script name to run.')
  process.exit(1)
}

try {
  // Run the specified TypeScript file using ts-node
  execSync(`node dist/${script}.js`, { stdio: 'inherit', env: { ...process.env, NODE_ENV: process.env.NODE_ENV } })
} catch (error) {
  console.error(`Failed to run ${script}:`, error)
  process.exit(1)
}
