# Executable commerce benchmark

The `gta6-commerce-v3` suite has **240 versioned tasks across all 20 stores**:
30 original purchase/budget/variant cases and 210 obstacle scenarios. It evaluates
an exact purchase request or a justified decision not to purchase. Each task
pins its catalog mode: 146 use captured reference listings, and 94 use explicitly
authored fixtures where a captured checkout is unavailable. All checkout behavior
is simulated; results do not establish current retailer stock or live parity.

## Run

```bash
npm ci
npx playwright install chromium
npm run benchmark -- list
npm run benchmark -- run --baseline reference
npm run benchmark -- run --baseline noop
npm run benchmark -- run --store bestbuy --repeats 3
npm run benchmark -- run --family payment_recovery
npm run benchmark -- run --family availability_fallback
npm run benchmark -- run --catalog-mode fixtures
npm run benchmark -- run --task game-uk-budget_decline-ps5 --out data/benchmark/budget-check
npm run benchmark:verify
```

On Linux CI, use `npx playwright install --with-deps chromium`. The runner uses
Playwright's matching Chromium, a fresh 1280×900 browser context, `en-US` locale,
and UTC timezone. `--headed` opens the browser for local debugging. Results are
written under `data/benchmark/` by default and are ignored by Git. An existing
output directory is refused so unrelated evaluations cannot be mixed.

The reference baseline is a deterministic script that clicks the visible store
controls, reads product descriptions and checkout totals, and obeys the task
budget. The baseline name describes the scripted policy; it follows each task's
pinned catalog mode, including explicit fixture tasks. It does not call evaluator APIs or read private expectations. The noop
baseline visits the store without attempting the task. They validate the
environment and grading, and are **not model-performance baselines**.

Exit codes are `0` for all passed, `1` for any agent/task failures, and `2` for
configuration or environment errors. Environment errors appear separately and
are excluded from the success-rate denominator. Always inspect their count.

## Task contract and coverage

`benchmark/tasks.js` is the versioned task manifest. Each case specifies its
instruction, user-supplied structured requirements, time budget, and evaluator
expectations. The public projection omits expectations and outcome-revealing
family labels. Public task IDs are opaque. Inputs include fictitious contact
details and a test card for this local simulation.

The original 30 tasks retain PS5 and Xbox cases at Best Buy, GAME and Rockstar for a normal purchase, exact budget boundary,
insufficient budget, and an unsupported Ultimate code-in-box edition. Best Buy
and GAME also test quantity two. Rockstar instead tests a required apartment
address because its visible GTA checkout supports one copy.

Version 3 expands the obstacle families to every storefront, with two product
variants per family (both console platforms, both digital editions, or two
ordinary products). Best Buy task versions advance to 2 because their public
instructions/card details changed; the 30 original cases remain version 1.

| Family | Controlled condition | Required behavior |
| --- | --- | --- |
| `payment_recovery` | A valid primary card is declined at purchase authorization. | Observe the rejection, use the explicitly authorized backup card, and complete one order. |
| `payment_decline` | The primary card is declined and no backup is authorized. | Stop without buying and report `payment_declined`. |
| `availability_loss` | The selected item becomes unavailable after cart entry or direct checkout selection. | Observe the change, place no order, and report `unavailable`. |
| `availability_fallback` | Shipping becomes unavailable; the named pickup location remains available. | Try shipping first, then use the authorized pickup location and recipient. |
| `pickup_required` | The request requires a named pickup location and person. | Use that location/person; if this checkout cannot provide pickup, place no order and report `unsupported_fulfillment`. |
| `cart_recovery` | The starting cart contains the other variant/product, with excess quantity where the native cart supports it. | Remove the wrong item and purchase exactly the requested product and quantity. |

| Storefronts | Catalog mode | Product cases | Pickup behavior in this suite |
| --- | --- | --- | --- |
| Best Buy | Reference | PS5 / Xbox code-in-box | Required pickup and shipping-to-pickup fallback at Compton |
| GAME, Rockstar Store | Reference | PS5 / Xbox code-in-box | Explicitly labeled authored pickup controls at Oxford Street / Miami |
| Amazon, GameStop, Target, Walmart | Reference | PS5 / Xbox code-in-box | Shipping-only simulated checkout; refuse pickup |
| JB Hi-Fi, EB Games Australia | Reference | PS5 / Xbox code-in-box | Reference checkout does not support pickup; refuse pickup |
| PlayStation Store, Xbox Store | Reference | Standard / Ultimate digital editions | Digital licenses; refuse pickup |
| Argos, Smyths Toys | Fixtures | PS5 / Xbox code-in-box | Native simulated collection at London Central Argos / Smyths Toys Beckton |
| Coupang, Gmarket | Fixtures | PS5 / Xbox code-in-box | Shipping-only simulated checkout; refuse pickup |
| Chewy | Fixtures | Dry dog food / pet bowl | Shipping-only simulated checkout; refuse pickup |
| IKEA | Fixtures | Reading lamp / cushion cover | Shipping-only simulated checkout; refuse pickup |
| Nike | Fixtures | Backpack / crew socks | Shipping-only simulated checkout; refuse pickup |
| Sephora | Fixtures | Mascara / eye palette | Shipping-only simulated checkout; refuse pickup |
| Williams Sonoma | Fixtures | Utensil set / dinner plates | Shipping-only simulated checkout; refuse pickup |

Every storefront has payment recovery, payment decline, availability loss,
pickup requirements, and cart recovery (10 scenarios). The five pickup-capable
storefronts additionally have two availability-fallback cases. The complete
suite has **118 purchase cases and 122 no-purchase cases**. Unknown or unverified
real-world eligibility remains unknown in reference mode; fixture tasks do not
promote those listings into verified offers. The five specialist stores do not
receive fabricated GTA products.

Scenarios are private harness configuration, never shopper URL parameters.
Availability transitions depend on shopping actions, not wall-clock timing.
Declines and stock changes persist across retries and fresh browser sessions in
the same run. Each trial starts clean. Digital cart seeds contain one license;
physical carts contain two units of the wrong product. The initial PlayStation
sign-in preserves that seed so authentication cannot silently solve the task.

Each split contains 120 public tasks. PS5, Standard digital editions, and the
first specialist product form development cases; Xbox, Ultimate digital editions,
and the second specialist product form validation cases. Both splits use the
same public families; this is not a secret held-out generalization benchmark.

The deterministic grader requires exactly one order with the correct store,
SKU, platform, edition, format, quantity, recipient/contact details, address,
fulfillment, currency and card suffix. It checks finite monetary amounts,
arithmetic consistency, pinned offer prices and the all-in budget. Minimum totals
allow supported member shipping savings at Nike and Sephora. Extra,
duplicate, cancelled or returned purchases fail. No-purchase tasks require
zero orders and the correct structured reason. A cancelled purchase does not
count as having abstained. Pickup tasks additionally require the exact store
and pickup person. Backup-card tasks require the authorized backup suffix and
trusted evidence that the primary card was rejected before the order. Stock
fallback tasks require evidence that shipping was attempted before switching.
Order records pin the scenario event sequence at purchase so events occurring
afterward cannot retroactively satisfy a recovery requirement. Payment rejection
is attributed to the actual checkout selection, not unrelated items left in a
cart. Cart recovery additionally requires a `cart_corrected` event bound to the
order number and session, recorded before storefront cleanup at commit. A direct
Buy Now purchase that ignores the seeded cart mistake therefore fails grading.

The final response must contain `outcome` (`purchased` or `not_purchased`), a
nonempty `message`, and, for abstention, `reason` (`budget_exceeded`,
`unsupported_variant`, `unsupported_fulfillment`, `payment_declined` or `unavailable`). Structured claims are graded; free-form prose is saved
for inspection, not semantically judged. Unknown/unverified source listings must not be labeled unavailable. When their
historical purchase simulations are used, the task explicitly selects fixture
mode. The `unavailable` outcome concerns controlled local stock loss, distinct
from those unknown source observations.

## Connect an agent

Create a trusted local ES module exporting `run`:

```js
export const metadata = {
  model: 'your-model-version', temperature: 0, prompt_version: 'v1',
  tools: 'browser-dom',
}

export async function run({ page, task, startUrl, recordAction, signal }) {
  await page.goto(startUrl)
  // Pass task.instruction and task.request to your agent and give it browser
  // tools backed by this page. Respect signal.aborted and task.timeout_ms.
  // Call recordAction({type: 'click', description: 'Open a product'}) as useful.
  return {
    finalResponse: {
      outcome: 'not_purchased',
      reason: 'unsupported_variant',
      message: 'Replace this example with the agent’s actual conclusion.',
    },
    metrics: { cost_usd: 0.01, input_tokens: 100, output_tokens: 50 },
  }
}
```

```bash
npm run benchmark -- run --agent ./my-agent.mjs --agent-label my-agent-version --repeats 3
```

Returning the final response object directly is also supported. Cost/token
metrics are optional, agent-reported, and recorded only when nonnegative and
finite. Missing cost is unknown, not zero. An optional exported `metadata` object
is saved in the report along with the adapter file's SHA-256. Use it to record
model/version, prompt version, tool policy and sampling settings; keep API keys
out of this object. Adapters execute as trusted Node code on the runner: they
are not a sandbox for hostile submissions and must not expose local files,
private evaluator state, IPC or arbitrary HTTP tools to the evaluated agent.

The shipped track allows DOM browser interaction. Browser network traffic is
restricted to the assigned run origin, service workers are blocked, and other
stores are unavailable within that origin. A screenshot-only track would need
an adapter/tool policy that withholds DOM access; do not compare those tracks
without reporting their tool differences.

## Isolation and reproducibility

Every trial launches a fresh Node worker and browser context. This isolates
legacy store/session/account module state without rewriting the storefronts.
Run IDs are generated by the harness and immutable; URL query parameters cannot
retag transactions. Each worker pins the task's declared catalog mode before loading any storefront
module, and records it in order metadata, trial results and report configuration.
Each worker has an exclusive orders file. The worker fails
startup if a store fails to import or the required store is missing.

The worker's HTTP app mounts only storefronts and assets. `/api/*` is absent,
including order reads and deletion. Evaluator snapshots use the parent/child
IPC channel. Completing or timing out a trial seals order writes before the
grader reads evidence. The ordinary `npm start` developer server retains its
legacy inspection APIs; use the benchmark runner for scored evaluations.

Order persistence uses atomic file replacement, rejects corrupted input and
does not silently discard history. One worker owns each file; sharing an orders
file between processes is unsupported. Every order includes the run/task/suite
identity and environment fingerprint. This is atomic snapshot storage, not a
transactional multi-tenant database or append-only event service.

Reports capture a SHA-256 fingerprint of application code, storefronts, local
assets, the lockfile and benchmark implementation, plus Git revision/dirty
state, Node/browser versions and selected task manifest hash. Card expiry
validation uses the pinned `2026-10-07` benchmark date; event timestamps remain
wall-clock timestamps. The lockfile and suite version should be preserved with
published results. Local content fingerprints capture uncommitted changes too.

## Evidence and interpretation

Each trial writes its task manifest, order snapshot, structured result, action
log, browser errors, blocked requests, final screenshot, and Playwright trace.
It also saves `scenario-events.json` and embeds the same private event evidence
in the result. Provider events include only the card suffix, never the full
card number or security code. Stock and cart events identify the affected
product and state change. Missing instrumentation is an environment error;
an untriggered required scenario fails the task rather than earning credit for
an unsupported guess.
The parent writes `report.json` and a linked `index.html` after every trial so
completed results survive a later interrupted run. Traces contain simulated
form inputs and can be opened locally:

```bash
npx playwright show-trace data/benchmark/RUN/runs/TASK-1/trace.zip
```

Reports break success down by store, task family, split and catalog mode, and include failure
codes, elapsed time and available cost metrics. Elapsed time includes capture
and cleanup overhead. Reported Wilson 95% intervals are descriptive per-trial
intervals; repeated trials for one task are correlated and the intervals do not
measure generalization to new task families.

`npm test` runs server, grader, state, isolation and reporting regressions in
reference mode, plus the historical fixture suite. Browser verification is an
explicit `npm run benchmark:verify` check and is included in CI. Passing the
scripted baseline proves those local journeys work; a human audit and measured
model baselines remain separate validation work.
