import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../lib/urlState';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Link between pages of this app ("/" and "/app") without a full reload.
 * Ctrl/Cmd-click and middle-click still open a new tab, like a normal link.
 */
export function Link({ href, onClick, children, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  }
  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
