/** Where the drill is done. */
export type Space = 'Full court' | 'Half court';

/** The options in order, for the dropdown. */
export const SPACES: readonly Space[] = ['Full court', 'Half court'];

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
