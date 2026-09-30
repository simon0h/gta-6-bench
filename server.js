import { createApp } from './app.js'

const port = Number(process.env.PORT) || 3000
const app = await createApp()
app.listen(port, () => {
  console.log(`GTA 6 bench listening on http://localhost:${port}`)
  for (const s of app.locals.stores) console.log(`  ${s.name.padEnd(28)} http://localhost:${port}${s.url}`)
})
