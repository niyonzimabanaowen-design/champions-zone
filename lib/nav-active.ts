/** A link is active on an exact pathname match, or on a sub-route (e.g. "/clubs/arsenal" under "/clubs"). "/" only matches exactly. */
export function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
