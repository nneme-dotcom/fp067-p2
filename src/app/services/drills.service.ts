import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';
import firebaseConfig from '../firebase.config.json';
import { Drill, DrillData } from '../models/drill';

const COLLECTION = 'drills';

/** Todo lo que la app hace con la base de datos está aquí. */
@Injectable({ providedIn: 'root' })
export class DrillsService {
  private readonly firestore = inject(Firestore);
  private readonly drillsRef = collection(this.firestore, COLLECTION);

  /** Es false mientras no se hayan puesto los datos del proyecto en firebase.config.json. */
  readonly configured = !firebaseConfig.projectId.startsWith('YOUR_');

  /** Se pone a true si Firestore no deja leer los datos. */
  readonly failed = signal(false);

  /**
   * Los drills, siempre al día: Firestore avisa en cuanto algo cambia
   * (aunque el cambio se haga desde la consola), sin recargar la página.
   * Vale null mientras cargan.
   */
  readonly drills = toSignal(this.watchDrills(), { initialValue: null });

  add(data: DrillData): Promise<string> {
    return addDoc(this.drillsRef, data).then((ref) => ref.id);
  }

  /** Sustituye el documento entero, así un campo opcional que se vacía desaparece. */
  update(id: string, data: DrillData): Promise<void> {
    return setDoc(doc(this.firestore, COLLECTION, id), data);
  }

  remove(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, COLLECTION, id));
  }

  private watchDrills(): Observable<Drill[] | null> {
    if (!this.configured) {
      return of([]);
    }

    return (collectionData(this.drillsRef, { idField: 'id' }) as Observable<Drill[]>).pipe(
      map((list) => [...list].sort((a, b) => a.nombre.localeCompare(b.nombre))),
      catchError((err) => {
        console.error('Could not read the drills:', err);
        this.failed.set(true);
        return of([]);
      }),
    );
  }
}
