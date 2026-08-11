/**
 * Runtime access to server-side secrets.
 *
 * Do NOT read these through `import.meta.env`. Vite statically replaces
 * `import.meta.env.FOO` at build time, so a variable that is unset during the
 * build compiles to `undefined` - and the bundler then dead-code-eliminates
 * every branch behind it. That silently removed the entire Resend send path
 * from the deployed function, and no amount of setting the variable in the
 * hosting dashboard could bring it back without a rebuild.
 *
 * `process.env` is read when the function actually runs, so values set in the
 * hosting dashboard take effect on the next invocation and a rotated key needs
 * no redeploy. Locally, astro.config.mjs copies .env into process.env so this
 * same path works under `astro dev`.
 *
 * Never reference the bare `import.meta.env` object in server code either: Vite
 * expands it into an object literal holding every variable, which writes the
 * build machine's secrets straight into the server bundle.
 *
 * PUBLIC_* variables are deliberately not here: those belong in the client
 * bundle and are correct to inline at build time.
 */
function readEnv(name: string): string | undefined {
  const value = typeof process !== 'undefined' ? process.env?.[name] : undefined;
  return value && value.length > 0 ? value : undefined;
}

export interface MailConfig {
  apiKey: string;
  from: string;
  to: string;
}

/**
 * Returns null when the mail credentials are missing, so callers fail loudly
 * instead of reporting a delivery that never happened.
 */
export function getMailConfig(fallbackTo: string): MailConfig | null {
  const apiKey = readEnv('RESEND_API_KEY');
  const from = readEnv('LEAD_FROM_EMAIL');
  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    to: readEnv('LEAD_NOTIFICATION_EMAIL') ?? fallbackTo,
  };
}
