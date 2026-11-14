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

/** Everything the app does with the database is here. */
@Injectable({ providedIn: 'root' })
export class DrillsService {
  private readonly firestore = inject(Firestore);
  private readonly drillsRef = collection(this.firestore, COLLECTION);

  /** False until the project data is put in firebase.config.json. */
  readonly configured = !firebaseConfig.projectId.startsWith('YOUR_');

  /** Set to true if Firestore does not allow reading the data. */
  readonly failed = signal(false);

  /**
   * The drills, always up to date: Firestore tells us as soon as something changes
   * (even if the change is made from the console), without reloading the page.
   * It is null while they load.
   */
  readonly drills = toSignal(this.watchDrills(), { initialValue: null });

  add(data: DrillData): Promise<string> {
    return addDoc(this.drillsRef, data).then((ref) => ref.id);
  }

  /** Replaces the whole document, so an optional field that is emptied disappears. */
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
      map((list) => [...list].sort((a, b) => a.name.localeCompare(b.name))),
      catchError((err) => {
        console.error('Could not read the drills:', err);
        this.failed.set(true);
        return of([]);
      }),
    );
  }
}
