/** Dónde se hace el drill. */
export type Space = 'Full court' | 'Half court';

/** Las opciones en orden, para el desplegable. */
export const SPACES: readonly Space[] = ['Full court', 'Half court'];

/**
 * La ficha de un drill. Los datos con `?` son opcionales.
 * Los textos largos se guardan como texto normal; en `secuencia`
 * cada línea es un paso.
 */
export interface Drill {
  /** Lo pone Firestore al crear el documento. */
  id: string;
  nombre: string;
  objetivo: string;
  jugadoras: number;
  espacio: Space;
  descripcion: string;
  rolesFijos?: string;
  rotan?: string;
  secuencia?: string;
  rotacion?: string;
  progresiones?: string;
  /** Enlace a la animación 3D. */
  animacionUrl?: string;
  /** Dirección de la imagen. */
  imagen?: string;
  /** Dirección del vídeo. */
  video?: string;
}

/** Lo que se guarda en Firestore: el drill sin su id. */
export type DrillData = Omit<Drill, 'id'>;
