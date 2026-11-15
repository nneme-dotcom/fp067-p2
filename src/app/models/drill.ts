/** Where the drill is done. */
export type Space = 'Full court' | 'Half court';

/** The options in order, for the dropdown. */
export const SPACES: readonly Space[] = ['Full court', 'Half court'];

/** The groups of the list, in the order they are shown. */
export type DrillGroup = 'Pepper' | 'Ball control';

export const GROUPS: readonly DrillGroup[] = ['Pepper', 'Ball control'];

/** Where the drills with no group are shown. */
export const OTHER_GROUP = 'Other';

/**
 * The data of a drill. Fields with `?` are optional.
 * Long texts are saved as plain text; in `sequence`
 * each line is one step.
 */
export interface Drill {
  /** Set by Firestore when the document is created. */
  id: string;
  name: string;
  objective: string;
  players: number;
  space: Space;
  description: string;
  /** The group it belongs to in the list. With no group it goes to "Other". */
  group?: DrillGroup;
  fixedRoles?: string;
  rotating?: string;
  sequence?: string;
  rotation?: string;
  progressions?: string;
  /** Link to the 3D animation. */
  animationUrl?: string;
  /** Image URL. */
  image?: string;
  /** Video URL. */
  video?: string;
}

/** What is saved in Firestore: the drill without its id. */
export type DrillData = Omit<Drill, 'id'>;
