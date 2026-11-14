/** Cass images in public/img/cass. Every one carries the "AI-generated" seal. */
export const CASS_POSES = {
  alerta: [217, 276],
  ateamanha: [269, 221],
  atento: [217, 231],
  confiante: [175, 232],
  detectando: [257, 283],
  disponivel: [187, 236],
  enviando: [183, 277],
  globo: [228, 277],
  icone: [192, 208],
  monitorando: [270, 293],
  ola: [240, 289],
  pensativo: [148, 216],
  pin2: [520, 555],
  pin3: [520, 568],
  preocupado: [145, 215],
  tecnico: [283, 245],
  tudocerto: [216, 246],
} as const satisfies Record<string, readonly [number, number]>;

export type Pose = keyof typeof CASS_POSES;
