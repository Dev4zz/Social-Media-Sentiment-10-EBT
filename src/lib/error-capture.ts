// Standalone replacement for the Lovable-provided error capture helper.
// Keeps track of the last uncaught server-side error so the fetch handler
// in src/server.ts can surface something useful when SSR fails silently.
let lastError: unknown = null;

export function captureError(error: unknown) {
  lastError = error;
}

export function consumeLastCapturedError(): unknown {
  const err = lastError;
  lastError = null;
  return err;
}

if (typeof process !== "undefined" && typeof process.on === "function") {
  process.on("uncaughtException", (err) => {
    captureError(err);
    console.error(err);
  });
  process.on("unhandledRejection", (err) => {
    captureError(err);
    console.error(err);
  });
}
