# Cloudflare hosting

This deployment runs all 20 storefronts in a Cloudflare Container behind an HTTPS
Worker. It uses the existing Node/Express application and reference catalog. The
container has no outbound Internet access; purchases remain simulations.

The deployed Worker is `gta-6-bench` in account
`d0a68e3d8918b6b0d9e48c1659e9e450`. Open the
[hosted dashboard](https://gta-6-bench.simon-oh.workers.dev/dashboard) and sign in
with the `BENCHMARK_API_TOKEN` value from the private local `.dev.vars` file.
The token is also installed as a Worker runtime secret; it is excluded from Git
and the container image.

## Prerequisites and deploy

- Enable the [Workers Paid plan](https://dash.cloudflare.com/?to=/:account/workers/plans).
  Cloudflare currently requires it for Containers. The plan has a $5/month minimum;
  container, Worker and storage usage can add charges. See
  [current pricing](https://developers.cloudflare.com/containers/platform/pricing/).
- Run Docker (or a compatible engine) for the Linux container image build.
- Authenticate Wrangler with `npx wrangler login`, or supply a scoped
  `CLOUDFLARE_API_TOKEN` through your environment/CI secret store.

Install dependencies and create an operator secret file once:

```sh
npm ci
node --input-type=module -e 'import {randomBytes} from "node:crypto"; import {writeFileSync} from "node:fs"; writeFileSync(".dev.vars", "BENCHMARK_API_TOKEN=" + randomBytes(32).toString("hex") + "\n", {flag:"wx", mode:0o600})'
npm run hosting:check
npm run deploy:check
npm run deploy -- --secrets-file .dev.vars
```

`.dev.vars` is ignored by Git and excluded from the Docker build. Never give its
token to a benchmark agent. The internal container token is generated privately
by the Durable Object and does not need manual setup. On later deploys, Wrangler
preserves the existing secret; use `npm run deploy`.

`npm run deploy:check` builds the container as well as compiling the Worker; it
requires Docker but publishes nothing. To compile only the Worker on a machine
without Docker, run:

```sh
npx wrangler deploy --dry-run --containers-rollout none
```

Image source is explicitly limited by `.dockerignore` and `Dockerfile`. Local
orders, benchmark outputs, research files, credentials and Git history are excluded.

## Create runs and give agents URLs

Open `/dashboard` and sign in with `BENCHMARK_API_TOKEN`. Click **New run**, choose the original 30 tasks or all 240, then create up to five agent URLs.
Each URL has an editable agent label (Grokbot, Dots or Muse), tags and comments.
Share the generated URL or use **Copy prompt**. Do not share the operator
secret. See the [dashboard workflow](DASHBOARD.md) for task submission and grading.

Each agent URL gets an isolated task worker, with private grading and a fixed
benchmark version. Use a separate browser profile/context for every attempt;
tabs in one browser share cookies. The dashboard rejects switching between
unfinished attempts in the same browser session.

The root redirects to the dashboard. Direct store paths remain available for
manual demonstrations, but a `?run=` tag on a direct store URL does not provide
benchmark isolation. Use the generated `/agent/<token>` URLs for scored runs.

The hosted server fixes secure cookies, trusts its immediate proxy, disables
CAPTCHA simulation, marks responses `noindex`, and hides checkpoint endpoints from
the public Worker. Dashboard APIs require operator sign-in. The legacy `/api/*`
endpoints except `/api/health` require the operator bearer token; they do not
contain isolated dashboard task evidence. Read that evidence in the dashboard.

## AI summary key

The run page's [AI summary](DASHBOARD.md#ai-summary) calls Claude from the Worker,
because the container has no internet access. Add a Claude API key as a second
Worker secret named `ANTHROPIC_API_KEY`: in Cloudflare open Workers & Pages >
gta-6-bench > Settings > Variables and Secrets and add it as a Secret, or run
`npx wrangler secret put ANTHROPIC_API_KEY`, or add an `ANTHROPIC_API_KEY=` line to
`.dev.vars` before `npm run deploy -- --secrets-file .dev.vars`. Never commit it.
Adding or changing it does not restart the container or sign anyone out. Without
it, everything else works and the summary card says it is not set up. Summaries
are kept in a `run_summaries` table in the Durable Object's SQLite database.

## Deploy from GitHub

Workers Builds is connected to `simon0h/gta-6-bench`, with `main` as the production
branch, repository root `/`, no separate build command, and deploy command
`npx wrangler deploy`. Cloudflare builds the container image remotely, so this
workflow does not require Docker on your computer. The private runtime secret
persists across deployments; it is not a build environment variable.

Pushes to `main` trigger deployment.
A pull request is not a production deployment until its changes reach that branch.
Other branches run the preview command, `npx wrangler preview`. It needs the
`previews` block in `wrangler.jsonc`, which gives each Preview its own Storefront
Durable Object namespace, so test builds cannot alter production state. A Preview
has no operator secret unless one is added with `wrangler preview secret`, so it
answers "Hosting is not configured" until then. A new Cloudflare account or Worker needs its
own repository connection and runtime secret; these files alone do not create them.

## State and restart behavior

One Durable Object coordinates the Node dashboard and its isolated child workers.
Dynamic requests are serialized. Before releasing each response, it checkpoints
dashboard runs, task results, active task sessions and scenario state, plus manual
demo sessions, accounts and orders, in Durable Object SQLite storage. New processes restore the last committed
checkpoint before serving traffic. A failed checkpoint returns 503 and discards
the process rather than reporting a successful purchase. A lost connection can
still leave a committed purchase whose response was not received; inspect evidence
before retrying a checkout.

Manual demo static assets bypass checkpoints; assets within an agent attempt
still pass through its session checkpoint. The container sleeps after ten minutes of
Durable Object inactivity, and its first subsequent request waits for startup.
The configured instance is `standard-1`; this provides room for the app's catalog
and embedded reference images. Image or operator-token changes replace the running
container on its next initialization and restore stored state.

Throughput is bounded by one dynamic request at a time. Multiple active agent
attempts allocate separate child processes inside the same container. Checkpoints are capped at 16 MiB and
dynamic responses at 16 MiB to accommodate embedded reference product images. SQLite also imposes per-row limits. There is no automatic
retention policy; archive and reset test data deliberately before a long campaign.
Deleting `/api/orders` only clears orders, not accounts or sessions.

## Verify the live deployment

The initial live check on 2026-10-13 UTC passed: 20 reference stores, operator
sign-in and sign-out, private evidence protection, large product images, run and
agent-link creation, metadata edits, and a scripted browser purchase with a passing
strict grade and zero environment errors. Its `deployment-smoke` run contains one
completed task and 29 unstarted tasks. This validates deployment, not model quality.

Check `/api/health` reports 20 stores and `catalog_mode: reference`. Confirm
`/dashboard/api/runs` returns 401 without sign-in, `/api/orders` returns 401 without
a bearer token and `/__hosting/state` returns 404 publicly. Sign in, generate a run
and agent URL, then open that URL in a separate browser session. Start a task,
visit the store, submit a result, and verify its grade appears in the dashboard.
Repeat an active cart check after the container sleeps to verify restoration.

The local checks exercise the five-link limit, run compatibility, isolated task
state, private grading, task timing, authorization, session/account restoration,
concurrent commits and persistence failure. They do not substitute for the image
build and live Cloudflare smoke checks.
