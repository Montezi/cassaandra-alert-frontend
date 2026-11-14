import { z } from 'zod';
import type { Language } from '../../shared/i18n';

/**
 * Contract of POST /api/agente (Cloud Run, ADR-005). Documented for the
 * backend in docs/api-contract.md.
 */
export const agentAnswerSchema = z.object({
  /** Answer paragraphs. **bold** marks the measured number. */
  paragraphs: z.array(z.string().min(1)).min(1),
  /** Tools the agent called, shown as chips ("consultar_hotspot"). */
  tools: z.array(z.string()),
  /** Sources with date ("NISAR GCOV, 12 nov 2026"). */
  sources: z.array(z.string()),
  /** Optional warning, e.g. forecasts are less certain than measurements. */
  note: z.string().nullable().optional(),
});

export type AgentAnswer = z.infer<typeof agentAnswerSchema>;

/** Matches the design: "the agent did not answer within 20 seconds". */
export const AGENT_TIMEOUT_MS = 20_000;

/**
 * The agent is not there: placeholder container (HTML answer), route missing
 * (404/405) or no backend at all (502/503, e.g. local dev without the API).
 * The chat then switches to demo mode instead of showing an error.
 */
export class AgentUnavailableError extends Error {}

const UNAVAILABLE_STATUS = new Set([404, 405, 501, 502, 503]);

export async function askAgent(
  question: string,
  hotspotId: string,
  language: Language,
): Promise<AgentAnswer> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/agente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, hotspot_id: hotspotId, language }),
      signal: controller.signal,
    });
    if (UNAVAILABLE_STATUS.has(response.status)) {
      throw new AgentUnavailableError(`/api/agente answered HTTP ${response.status}`);
    }
    if (!response.ok) throw new Error(`/api/agente answered HTTP ${response.status}`);
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      // The placeholder container answers an HTML page, not JSON.
      throw new AgentUnavailableError('/api/agente did not answer JSON');
    }
    const parsed = agentAnswerSchema.safeParse(json);
    if (!parsed.success) throw new AgentUnavailableError('/api/agente answer is off-contract');
    return parsed.data;
  } finally {
    window.clearTimeout(timer);
  }
}
