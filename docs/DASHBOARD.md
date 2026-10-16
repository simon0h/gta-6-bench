# Agent run dashboard

Start with `npm run dashboard`, then open `http://localhost:3001/dashboard`.
The local server binds to loopback. Set `DASHBOARD_PORT` to change its port.
For public HTTPS access, use the [Cloudflare deployment](CLOUDFLARE.md).

## Operator workflow

1. Click **New run**, choose a name, and select **Original 30 tasks**
   (the default), **All 240 tasks** or **My tasks** (tick the saved tasks to include;
   see [My tasks](#my-tasks)).
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

Each task starts when the agent clicks **Start task**. This starts the clock and
reveals the instructions and supplied shopping details. The agent uses **Continue
shopping**, performs the task in the simulated store, and follows **Task & submit
result** back to report its final answer. **Submit result & continue** seals that
task and prepares the next one. The next clock starts only after clicking Start.

There is no time limit. A task stays open until the agent submits a result, and
the result records how long it took (`elapsed_ms`, from Start task to Submit
result). The run page shows that time for every result, the total for each agent
URL, and a running clock in the live tracker, so agents can be compared on speed.

The form supports purchased and did-not-purchase outcomes. Grading uses private
order and scenario evidence together with the final answer; selecting Purchased
does not itself establish a successful purchase. No real payment is made.

Each result on the run page (and in **View traversal** and its JSON download)
shows three things side by side:

- **Expected output**: what the task required, such as buy 2 copies of the
  Standard Edition for PS5 shipped to a given address under a spending limit, or
  buy nothing and report `budget_exceeded`.
- **Actual output**: what the agent reported and every order it placed, with
  items, totals, delivery and the card used.
- **Failure reason**: for tasks that did not pass, one bullet per problem the
  grader found, such as the wrong quantity or the wrong refusal reason.

These are worked out from the task when the page loads (`benchmark/outcome.js`),
so results saved earlier show them too. They are never shown to the agent.

Passed results are marked green, failed results red and environment errors
amber, on the run page, in the live tracker and in **View traversal**.

## Run page layout

The run page has three tabs, and the chosen tab stays put when the page refreshes:

- **Overview**: totals, the live tracker, results by store, a table of agents
  and the AI summary.
- **Results**: every task result in one table. **All**, **Failed** (failed
  tasks and environment errors) and **Passed** filter it, with counts; a text box
  and an agent picker narrow it further. Click a row to see Expected output,
  Actual output and Failure reason.
- **Agents**: one card per agent URL, with its link, prompt, comments and
  **View traversal**. **See results** jumps to that agent's rows in Results.

The chat about this run is a small window in the bottom right corner, opened and
closed with the round button there (or Esc). It stays open while you switch tabs,
and the browser remembers whether it was open.

The top bar has a **Go to** search (Ctrl+K or ⌘K) for runs, pages and saved tasks,
and a light/dark switch that is remembered in the browser. On phones the sidebar
opens from the menu button.

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
start time and state. Traversal events are appended to a separate SQLite archive,
with paginated operator reads, so historical traces do not grow the active checkpoint.

## My tasks

**My tasks** in the sidebar lists tasks written in the dashboard. **New task** asks for
a name, the store (Best Buy, GAME or Rockstar Store), console, edition, number of
copies, spending limit, the shopper's name, email and phone, and the shipping address.
Instructions for the agent are optional; left blank, the task uses the same wording as
the built-in tasks.

The right answer is never typed in. The dashboard works it out from the store's own
prices, tax and delivery charge (`benchmark/custom-tasks.js`) and shows it as you
type: buy, or don't buy and report `budget_exceeded` (the cheapest total is over the
limit) or `unsupported_variant` (none of these stores sells the Ultimate Edition as a
code-in-box). **Exact total** and **1 cent short** fill the limit for the two budget
edge cases. The form only accepts what the store's checkout accepts: a valid state and
ZIP or UK postcode, the store's phone format, and up to 3 copies at Best Buy, 5 at GAME
and 1 at Rockstar (its code-in-box pre-order sells one copy per order).

Custom tasks are graded exactly like built-in ones, so the run page shows Expected
output, Actual output and Failure reason for them too. A run keeps its own copy of
each task, so editing or deleting a saved task only affects runs created afterwards.
Saved tasks live with the run records (`dashboard_tasks` in the local state file and
in the Cloudflare checkpoint), so they survive restarts and deploys. Up to 200 tasks
can be saved and up to 100 used in one run.

## Live tracker

The Overview tab of a run page shows where each agent is right now: its current task and
store, how long it has been running, the page it is on (home, search results, product, cart,
checkout, order placed, sign-in or other browsing), which of those steps it has
reached, its last click or form action, and its most recent pages. It refreshes
every three seconds while an agent is shopping, every fifteen seconds otherwise,
and pauses while the browser tab is hidden. **View traversal** opens the full path.

The tracker is built from the traversal events below, so it adds nothing to the
store pages. Each running task keeps a small summary of its position in the
checkpoint, which is dropped when the task is submitted. Page types
are a best guess from the page address. Tasks started before the tracker existed
show no position.

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

## AI summary

The run page has an **AI summary** card. Click **Write summary** and Claude
(`claude-opus-5-5`) reads the run's graded results and writes a short overview,
one line per agent on how it did and its biggest weak spot, and up to four
patterns across the run. Passed tasks are sent as one line each; tasks that did
not pass also send their expected output, actual output and failure reasons.
Card numbers in agent messages are hidden first. Nothing from the store pages,
traversal or replays is sent.

The summary is kept with the run. When more results arrive the card says how many
are new and offers **Update summary**; it is never rewritten on its own, so each
summary is one Claude request. It never changes a grade, and agents never see it:
the endpoints need operator sign-in.

It needs a Claude API key. On Cloudflare, add a Worker secret named
`ANTHROPIC_API_KEY` (see [Cloudflare hosting](CLOUDFLARE.md#ai-summary-key)).
For a local dashboard, start it with `ANTHROPIC_API_KEY` set; local summaries are
kept in memory until the dashboard stops. Without a key the card says how to turn
it on.

## Chat about a run

Under the AI summary, **Chat about this run** lets you ask Claude questions about
that run, such as "Why did Muse fail the Rockstar tasks?". Each question sends the
same results the summary reads (the whole run, so counts are exact), and the first
question or any question after new results arrive includes a fresh copy. Claude also
has one tool, a click path lookup: when a question needs to know what an agent did
on a task, it asks for that agent and task and gets back the pages opened, buttons
clicked and forms sent, with seconds since the task started (from the traversal
recording; typed values are never recorded). Replays are not sent.

Answers stream in as they are written. Task ids in an answer are links that open
and highlight that task's rows on the page. The chat is kept with the run, one chat
per run shared by everyone signed in, until **Clear chat**. A chat holds up to 30
questions. Earlier turns are sent back unchanged with each question, so Claude's
earlier reasoning stays valid and repeat reading is billed at the cheaper cached
rate. The chat only reads results; it cannot change grades, runs or tasks, and
agents never see it. It uses the same `ANTHROPIC_API_KEY` as the summary; locally
the chat is kept in memory.

## Feedback

**Feedback** in the sidebar opens the real site in a frame so you can click
through it and leave notes, like a design review tool. Pick a store or a
dashboard page from **Jump to**, or type a path. **Desktop**, **Tablet** and
**Phone** change the frame's width.

Switch to **Comment** (or press C) and click anything on the page: a numbered pin
drops there and a box asks for your note. Pins remember the page, the element you
clicked and the spot inside it, so they come back in the right place when the page
is opened again, even at another width. While commenting, the page does not react
to clicks; scrolling still works. Press Esc or pick **Browse** to use the page again.

The panel on the right lists notes for this page or all pages. Notes can be
edited, resolved, reopened and deleted. **Copy notes** copies every open note as
plain text grouped by store (page, element, screen size and the note), ready to
paste into a chat with Claude; **Download** saves the same text as a `.md` file.

Pins and the note box are drawn by the dashboard over the frame. Store pages are
not changed, and agents never see any of it: the endpoints need operator sign-in.
On Cloudflare the notes are kept in the Durable Object's SQLite (`feedback_notes`
table, up to 500 notes); a local dashboard keeps them in memory. A local dashboard
does not serve store pages on its own address, so only dashboard pages open there.

If this browser has opened an agent link, store pages would be sent to that
agent's task, so the viewer refuses to show them and asks you to use a private
window. Dashboard pages still work.
