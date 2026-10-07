// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import { ACCESSORIES, HAIR_STYLES, OUTFIT_STYLES, PANTS_STYLES } from './types.ts';
import type { AgentSpec, Appearance } from './types.ts';

export const SKIN_TONES = ['#f6d5b8', '#efc29a', '#d9a27a', '#b9805a', '#8d5a3c', '#5e3a26'];
export const HAIR_COLORS = ['#1b1620', '#3a2a22', '#6b4226', '#b5762f', '#d9b36a', '#e8d9a8', '#c2c7d4', '#c8531f', '#b04a4a', '#e56b9f', '#4a6fd9', '#2fb9a8', '#8a4fc7'];
export const OUTFIT_COLORS = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#a06fe0', '#73daca', '#ff9e64', '#e6e8f0', '#4a5163', '#2ac3de', '#d9534f', '#1f6f5c', '#f2d16b', '#2b3a67', '#d98ac4', '#15171f'];
export const PANTS_COLORS = ['#2b3042', '#3a4052', '#4a3b2f', '#27303f', '#5a4a6a', '#3b5b8c', '#b59f78', '#566246', '#15171f', '#cfd3dc'];

/** Stable cache key covering every field that changes how a character is drawn. */
export const lookKey = (l: Appearance): string =>
  `${l.skin}${l.hair}${l.hairStyle}${l.outfit}${l.pants}${l.accessory}/${l.outfitStyle ?? 0}/${l.pantsStyle ?? 0}`;

/** Deterministic string hash → 32-bit. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T,>(arr: T[], n: number): T => arr[n % arr.length];

/** A pleasant, deterministic look derived from any seed (e.g. a user id). */
export function lookFromSeed(seed: string): Appearance {
  const h = hash(seed);
  return {
    skin: pick(SKIN_TONES, h),
    hair: pick(HAIR_COLORS, h >>> 3),
    hairStyle: (h >>> 7) % HAIR_STYLES,
    outfit: pick(OUTFIT_COLORS, h >>> 11),
    pants: pick(PANTS_COLORS, h >>> 15),
    accessory: (h >>> 19) % ACCESSORIES,
    outfitStyle: (h >>> 23) % OUTFIT_STYLES,
    pantsStyle: (h >>> 27) % PANTS_STYLES,
  };
}

const skill = (id: string, name: string) => ({ id, name });

/** Built-in agents used when a workspace has none synced from a repo. */
export const DEFAULT_AGENTS: AgentSpec[] = [
  {
    id: 'project-manager', name: 'Sarah Chen', role: 'Project Manager',
    persona: 'Calm, structured technical PM who turns fuzzy ideas into crisp milestones and INVEST user stories.',
    systemPrompt: 'You are Sarah Chen, a senior technical project manager. You break work into milestones, user stories with acceptance criteria, dependencies and risks. Be concise and actionable.',
    greeting: "Hi, I'm Sarah. Bring me a goal and I'll turn it into a plan.",
    homeZone: 'plaza',
    look: { skin: '#efc29a', hair: '#1b1620', hairStyle: 2, outfit: '#7aa2f7', pants: '#2b3042', accessory: 1 },
    skills: [skill('sprint-planning', 'Sprint Planning')],
  },
  {
    id: 'frontend-engineer', name: 'Alex Rivera', role: 'Frontend Engineer',
    persona: 'Enthusiastic UI craftsman: React, Tailwind, accessible and fast interfaces.',
    systemPrompt: 'You are Alex Rivera, a senior frontend engineer expert in React, TypeScript, Tailwind CSS and accessibility. Give pragmatic, modern answers with short code examples.',
    greeting: "Hey! I'm Alex. Need help with components, state or layout polish?",
    homeZone: 'frontend',
    look: { skin: '#d9a27a', hair: '#6b4226', hairStyle: 1, outfit: '#2ac3de', pants: '#27303f', accessory: 2 },
    skills: [skill('frontend-architecture', 'Frontend Architecture')],
  },
  {
    id: 'backend-engineer', name: 'David Kim', role: 'Backend Engineer',
    persona: 'Methodical backend engineer focused on API design, data modelling and reliability.',
    systemPrompt: 'You are David Kim, a senior backend engineer. You design typed APIs, schemas and background jobs, and you care about security and observability. Keep answers precise.',
    greeting: "David here. APIs, schemas, queues — what are we building?",
    homeZone: 'backend',
    look: { skin: '#f6d5b8', hair: '#3a2a22', hairStyle: 0, outfit: '#9ece6a', pants: '#3a4052', accessory: 0 },
    skills: [skill('backend-api-design', 'Backend API Design')],
  },
  {
    id: 'ui-ux-designer', name: 'Elena Rostova', role: 'UI/UX Designer',
    persona: 'Warm, opinionated designer who thinks in systems: tokens, hierarchy, rhythm and contrast.',
    systemPrompt: 'You are Elena Rostova, a product designer. You propose design tokens, layouts, interaction details and accessibility improvements, and explain the reasoning briefly.',
    greeting: "Hi! I'm Elena. Show me a screen and I'll help with tokens, hierarchy and micro-interactions.",
    homeZone: 'design',
    look: { skin: '#8d5a3c', hair: '#8a4fc7', hairStyle: 4, outfit: '#a06fe0', pants: '#5a4a6a', accessory: 0 },
    skills: [skill('design-systems', 'Design Systems')],
  },
  {
    id: 'qa-engineer', name: 'Marcus Vance', role: 'QA Engineer',
    persona: 'Detail-obsessed tester who hunts edge cases and writes sharp regression plans.',
    systemPrompt: 'You are Marcus Vance, a QA engineer. You enumerate edge cases, write test plans and automated E2E scenarios, and call out risk areas. Be direct.',
    greeting: "Marcus. I break things so users don't have to. What should I test?",
    homeZone: 'qa',
    look: { skin: '#b9805a', hair: '#1b1620', hairStyle: 3, outfit: '#e0af68', pants: '#27303f', accessory: 3 },
    skills: [skill('e2e-automation', 'E2E Automation')],
  },
];
