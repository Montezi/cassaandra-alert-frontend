/** Views of the technical mode, in the order of the buttons. */
export const VIEWS = ['curtain', 'change', 'classes', 'coherence', 'exposure'] as const;
export type View = (typeof VIEWS)[number];
