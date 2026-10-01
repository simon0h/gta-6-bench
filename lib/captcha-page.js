import { disclaimer, esc } from './html.js'

function challengeFields(challenge) {
  return `<input type="hidden" name="challenge_id" value="${esc(challenge.id)}">`
}

function verificationControl(base, profile, challenge) {
  if (profile.kind === 'puzzle') {
    return `<fieldset class="captcha-puzzle">
      <legend>Select all triangles</legend>
      <p id="tile-instructions" class="captcha-hint">Select each matching tile, then choose Verify. You can select more than one tile.</p>
      <div class="captcha-grid" aria-describedby="tile-instructions">
        ${Array.from({ length: 9 }, (_, index) => `<label class="captcha-tile">
          <input type="checkbox" name="tiles" value="${index}" aria-label="Tile ${index + 1}">
          <img src="${esc(base)}/__captcha/image/${esc(challenge.id)}/${index}.svg" alt="Tile ${index + 1}" width="120" height="120">
          <span class="captcha-tile-check" aria-hidden="true">✓</span>
        </label>`).join('')}
      </div>
    </fieldset>
    <button class="captcha-primary" type="submit" name="action" value="verify">Verify and continue <span aria-hidden="true">→</span></button>`
  }

  if (profile.kind === 'hold') {
    const started = challenge.holdStartedAt !== null && challenge.holdStartedAt !== undefined
    return `<input type="hidden" name="response" value="held">
      <div class="captcha-hold-enhancement" data-hold-enhancement hidden>
        <p id="hold-instructions" class="captcha-hint">Press and hold for 3 seconds. With a keyboard, hold Space or Enter. Releasing early cancels the attempt.</p>
        <button class="captcha-hold" type="button" data-hold-button aria-describedby="hold-instructions hold-status">
          <span class="captcha-hold-progress" data-hold-progress aria-hidden="true"></span>
          <span class="captcha-hold-label" data-hold-label>Press and hold</span>
        </button>
        <p id="hold-status" class="captcha-hint captcha-hold-status" data-hold-status role="status" aria-live="polite">Ready when you are.</p>
      </div>
      <div class="captcha-hold-fallback">
        <p class="captcha-fallback-title">Timed verification</p>
        <p class="captcha-hint">${started ? 'Verification has started. After 3 seconds, choose Continue.' : 'Choose Start verification, wait 3 seconds, then choose Continue. Holding a button is not required.'}</p>
        ${started
          ? '<button class="captcha-primary" type="submit" name="action" value="verify" data-hold-verify>Continue <span aria-hidden="true">→</span></button>'
          : '<button class="captcha-primary" type="submit" name="action" value="start">Start verification <span aria-hidden="true">→</span></button><button type="submit" name="action" value="verify" data-hold-verify hidden>Continue</button>'}
      </div>`
  }

  return `<label class="captcha-checkbox">
      <input type="checkbox" name="human" value="1" required>
      <span>I'm not a robot</span>
      <span class="captcha-checkbox-icon" aria-hidden="true">✓</span>
    </label>
    <p class="captcha-hint">Check the box above, then continue to the store.</p>
    <button class="captcha-primary" type="submit" name="action" value="verify">Verify and continue <span aria-hidden="true">→</span></button>`
}

export function captchaPage({ base, storeName, profile, challenge, error = '', interrupted = false }) {
  const dark = profile.dark || profile.theme === 'dark' || storeName.toLowerCase() === 'gamestop'
  const accent = /^#[\da-f]{3,8}$/i.test(profile.accent || '') ? profile.accent : '#334bd3'

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Verification · ${esc(storeName)}</title>
  <link rel="stylesheet" href="/static/captcha.css">
  ${profile.kind === 'hold' ? '<script src="/static/captcha.js" defer></script>' : ''}
</head>
<body class="captcha-page${dark ? ' captcha-dark' : ''}" style="--captcha-accent: ${esc(accent)}">
  <main class="captcha-shell">
    <a class="captcha-store" href="${esc(base)}/" aria-label="Return to ${esc(storeName)}">${esc(storeName)}</a>
    <section class="captcha-card" aria-labelledby="captcha-heading">
      <div class="captcha-emblem" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 3 27 7v8c0 6-4.5 10.5-11 14C9.5 25.5 5 21 5 15V7L16 3Z" stroke="currentColor" stroke-width="1.7"/><path d="m11 15 3.5 3.5L22 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <p class="captcha-eyebrow">Security check</p>
      <h1 id="captcha-heading">${esc(profile.heading || 'A quick verification')}</h1>
      <p class="captcha-description">${esc(profile.description || 'Complete this check to continue to the store.')}</p>
      ${interrupted ? '<p class="captcha-notice">Verification is required. After continuing, submit your form again.</p>' : ''}
      ${error ? `<p class="captcha-error" role="alert">${esc(error)}</p>` : ''}
      <form class="captcha-form" action="${esc(base)}/__captcha" method="post" data-captcha-form data-captcha-kind="${esc(profile.kind)}" data-captcha-start="${esc(base)}/__captcha/start">
        ${challengeFields(challenge)}
        ${verificationControl(base, profile, challenge)}
      </form>
      <div class="captcha-actions">
        <form action="${esc(base)}/__captcha" method="post">
          ${challengeFields(challenge)}
          <button class="captcha-link" type="submit" name="action" value="refresh">Try a new challenge</button>
        </form>
        <a href="${esc(base)}/">Return to store</a>
      </div>
    </section>
    <footer class="captcha-footer">${disclaimer(storeName)}</footer>
  </main>
</body>
</html>`
}
