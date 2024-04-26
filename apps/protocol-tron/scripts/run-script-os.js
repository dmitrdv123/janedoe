const os = require('os')
const { exec } = require('child_process')

const execTask = (task) => {
  exec(`pnpm run ${task} ${process.argv.slice(3).join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }

    console.log(stdout)
    console.log(stderr)
  })
}

const platform = os.platform();
const task = process.argv.slice(2)[0]

if (platform === 'win32') {
  console.log('Running on Windows')
  execTask(`${task}:windows`)
} else if (platform === 'linux') {
  console.log('Running on Linux')
  execTask(`${task}:linux`)
} else {
  console.log(`Running on an unsupported platform: ${platform}`)
  execTask(`${task}:other`)
}
