# Agent run dashboard

Start with `npm run dashboard`, then open `http://localhost:3001/dashboard`.
The local server binds to loopback. Set `DASHBOARD_PORT` to change its port.
For public HTTPS access, use the [Cloudflare deployment](CLOUDFLARE.md).

## Operator workflow

1. Click **New run**, choose a name, and select **Original 30 tasks**
   (the default) or **All 240 tasks**.
2. Click **Add agent URL**. Select Grokbot, Dots or Muse and add optional tags and
   comments. You can generate up to five URLs per run, including repeated agents.
3. Use **Copy prompt** or **Copy URL** and give the link to that agent.
4. Refresh the run to review progress and each submitted task's private grade.
   Update labels, comments and comma-separated tags with **Save**.
5. Click **View traversal** on an agent, then select a task. Follow connected page
   nodes or switch to **All events**. Drag the canvas to pan, use the zoom controls
   or **Fit view**, and select a node to inspect requests, clicks, forms and timing.
   The graph refreshes every five seconds while open; **JSON** downloads the selected
   task's loaded events.
6. Click **Watch replay** in the traversal window to play the selected task back like
   a video: every page the agent opened, with its scrolling, pointer movement, clicks
   and typing. **Reload** picks up newer recording from a task still in progress.

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
deadline and state. Traversal events are appended to a separate SQLite archive,
with paginated operator reads, so historical traces do not grow the active checkpoint.

## Traversal recording

New tasks record dynamic storefront requests and HTTP outcomes. A small script
records browser page relationships, interactive clicks, form submissions, field
changes and history navigation. Entered field values, request bodies, cookies and
URL query values are excluded. Static assets are omitted from the tree. Browser
events are observations and are not used for grading; they can be missing when
JavaScript is disabled or a browser closes before sending them. Server requests
remain visible even without the script, though their page relationships may be unknown.

The tree covers activity on the benchmark website, not the external agent's
internal reasoning, tool calls, sub-agents, model configuration or token usage.
Tasks created before recording was enabled show **Traversal unavailable**. No
historical browsing path is inferred from its score or request count.

## Replay recording

New tasks also load a page recorder ([rrweb](https://github.com/rrweb-io/rrweb),
pinned in `package.json`) next to the traversal script. It saves the page itself and
every change to it, so the dashboard can rebuild what the agent saw. It records
scrolling, pointer movement, clicks, opened menus and typed text. Passwords and payment
card fields (number, security code, expiry, PIN) are masked in the browser before
they are sent; the agent URL capability is removed on the server.

The recorder sends compressed pieces about once a second and when a page closes.
A local dashboard stores them under `data/dashboard/replays/<task>/`. The Cloudflare
deployment stores them in the same Durable Object SQLite database as traversal
events, in a separate table outside the recovery checkpoint. A typical page load is
about 25 KB compressed; each task is capped at 48 MB.

Replays are observations, like traversal, and are never used for grading. They show
the page, not the agent's own screen, reasoning or tools. Product images in a replay
load from the live site, so they can be missing on a local dashboard. Tasks started
before replay recording was enabled have no replay.

Verification commands:

```sh
npm run dashboard:check
npm run hosting:check
RUN_BROWSER_TESTS=1 node --test test/dashboard-traversal-browser.reference.test.mjs
RUN_BROWSER_TESTS=1 node --test test/dashboard-replay-browser.reference.test.mjs
```
