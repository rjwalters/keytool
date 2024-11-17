// not sure if this needs to be fancier. we could also screen for
// instanceof MouseEvent but this misses change events...

export function isAriaIntent(e: Event): boolean {
  if (e instanceof KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Space") {
      return true;
    }
    return false;
  }
  return true;
}

export function ariaRedirect<T>(
  event: any,
  callback:
    | ((e: Event, arg0?: T) => void)
    | ((e: Event, arg0?: T) => Promise<void>),
  arg0?: T,
) {
  if ("key" in event) {
    if (event.key === "Enter" || event.key === "Space") {
      callback(event, arg0);
    }
  }
}
