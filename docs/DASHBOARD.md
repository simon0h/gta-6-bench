# Agent run dashboard

Start with `npm run dashboard`, then open `http://localhost:3001/dashboard`.
The local server binds to loopback. Set `DASHBOARD_PORT` to change its port.
For public HTTPS access, use the [Cloudflare deployment](CLOUDFLARE.md).

## Operator workflow

1. Click **Generate new run**, choose a name, and select **Original 30 tasks**
   (the default) or **All 240 tasks**.
2. Click **Add agent URL**. Select Grokbot, Dots or Muse and add optional tags and
   comments. You can generate up to five URLs per run, including repeated agents.
3. Use **Copy agent prompt** or **Copy URL** and give the link to that agent.
4. Refresh the run to review progress and each submitted task's private grade.
   Update labels, comments and comma-separated tags with **Save changes**.

An agent label is operator-supplied metadata. The system does not identify the
agent automatically or infer its underlying model. Record model/version, account
tier, tools and relevant settings in comments and tags. Official product icons
are served locally; their sources and hashes are recorded in
`public/dashboard/assets/agents/provenance.json`.

## Agent workflow

The generated URL is a secret capability for one attempt. It reveals no evaluator
expectations, grades, operator notes or sibling links. Keep the operator token
private and give agents only their own generated URL.

Use a separate browser profile/context for each agent URL. Tabs share cookies;
opening another unfinished attempt in the same browser session is rejected to
prevent one attempt's actions from entering another attempt's storefront.

Each task starts when the agent clicks **Start task**. This begins the deadline and
reveals the instructions and supplied shopping details. The agent uses **Continue
shopping**, performs the task in the simulated store, and follows **Task & submit
result** back to report its final answer. **Submit result & continue** seals that
task and prepares the next one. The next timer begins only after clicking Start.
Timeouts are recorded even when the agent does not submit a result.

The form supports purchased and did-not-purchase outcomes. Grading uses private
order and scenario evidence together with the final answer; selecting Purchased
does not itself establish a successful purchase. No real payment is made.

## Comparability and persistence

A run fixes the suite version, selected task definitions and environment hash.
Each URL gets the same ordered tasks, with a fresh isolated Node worker for each
task. Browser state, accounts, scenario mutations and order evidence are separate.
Changing a `?run=` query cannot change the trial's evaluator identity.

Results remain readable after a source update, but an unfinished attempt cannot
continue against changed benchmark code. Generate a new run after deployment
changes. Labels and notes remain editable without rewriting recorded task evidence.

Local state is atomically stored in `data/dashboard/dashboard-state.json`.
Cloudflare stores dashboard records and active-task snapshots in Durable Object
SQLite before releasing dynamic responses. A resumed task retains its original
deadline and state. This dashboard does not capture browser traces, screenshots,
model settings or token usage from external agents; the local adapter-based runner
has separate tracing support.

Verification commands:

```sh
npm run dashboard:check
npm run hosting:check
```
