/** Project roles. Derived from the user's GitHub permission on the repository (see membership.ts). */
export const PROJECT_ROLES = ['founder', 'frontend', 'backend', 'designer', 'pm', 'qa', 'prompt-engineer', 'data'] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];
