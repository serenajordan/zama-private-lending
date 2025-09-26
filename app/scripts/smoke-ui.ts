// Minimal UI smoke test for restore branch
import assert from 'node:assert/strict'

;(async () => {
  const root = await fetch('http://localhost:3000')
  assert.equal(root.status, 200)

  const dash = await fetch('http://localhost:3000/dashboard')
  assert.equal(dash.status, 200)
  const html = await dash.text()
  assert.ok(/Deposit|Borrow/.test(html), 'dashboard missing expected actions')

  console.log('SMOKE OK')
})().catch((err) => {
  console.error('SMOKE FAIL', err?.message || err)
  process.exit(1)
})
