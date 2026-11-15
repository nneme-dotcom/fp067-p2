import { Component, computed, inject, signal } from '@angular/core';
import { DetailComponent } from './components/detail/detail.component';
import { DrillFormComponent } from './components/drill-form/drill-form.component';
import { DrillsComponent } from './components/drills/drills.component';
import { HeaderComponent } from './components/header/header.component';
import { TrainingComponent } from './components/training/training.component';
import { Drill, DrillData } from './models/drill';
import { DrillsService } from './services/drills.service';

/** Below this width (mobile) the list and the detail go one below the other. */
const STACKED_LAYOUT = '(max-width: 767.98px)';

/** What is shown on the right: the detail, the new drill form or the edit form. */
type Mode = 'view' | 'new' | 'edit';

/** Where the chosen drills are remembered in this browser. */
const TRAINING_KEY = 'eagles-training';

function readTraining(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(TRAINING_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

interface Notice {
  kind: 'success' | 'danger';
  text: string;
}

/**
 * The main component is the middleman: the list tells it what
 * happens (select, delete, new) and it tells the service and the others.
 */
@Component({
  selector: 'app-root',
  imports: [HeaderComponent, DrillsComponent, DetailComponent, DrillFormComponent, TrainingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly service = inject(DrillsService);

  protected readonly drills = this.service.drills;
  protected readonly failed = this.service.failed;
  protected readonly configured = this.service.configured;

  protected readonly selectedId = signal<string | null>(null);
  protected readonly mode = signal<Mode>('view');
  protected readonly saving = signal(false);
  protected readonly notice = signal<Notice | null>(null);

  /**
   * The selected drill, looked up each time in the list that comes from Firestore.
   * This way, if someone changes it from the console, the detail updates by itself.
   */
  protected readonly selected = computed(
    () => this.drills()?.find((d) => d.id === this.selectedId()) ?? null,
  );

  /** The ids of the drills chosen for the training, in the order they were chosen. */
  protected readonly trainingIds = signal<string[]>(readTraining());

  /** True while the training is on screen instead of the list. */
  protected readonly showTraining = signal(false);

  /** The chosen drills. If one was deleted from the database it is simply left out. */
  protected readonly training = computed(() => {
    const all = this.drills() ?? [];
    return this.trainingIds()
      .map((id) => all.find((d) => d.id === id))
      .filter((d): d is Drill => !!d);
  });

  private noticeTimer?: ReturnType<typeof setTimeout>;

  /** Adds the drill to the training, or takes it out if it was already there. */
  protected toggleTraining(drill: Drill): void {
    const ids = this.trainingIds();
    this.saveTraining(ids.includes(drill.id) ? ids.filter((id) => id !== drill.id) : [...ids, drill.id]);
  }

  protected clearTraining(): void {
    this.saveTraining([]);
  }

  protected openTraining(): void {
    this.showTraining.set(true);
    window.scrollTo({ top: 0 });
  }

  private saveTraining(ids: string[]): void {
    this.trainingIds.set(ids);
    try {
      localStorage.setItem(TRAINING_KEY, JSON.stringify(ids));
    } catch {
      // Without storage (private mode) the training still works, it is just not remembered
    }
  }

  protected onSelected(drill: Drill): void {
    this.selectedId.set(drill.id);
    this.mode.set('view');
    this.scrollToZone();
  }

  protected startNew(): void {
    this.selectedId.set(null);
    this.mode.set('new');
    this.scrollToZone();
  }

  protected onClosed(): void {
    const closedId = this.selectedId();
    this.selectedId.set(null);
    this.mode.set('view');

    // On close, the keyboard focus goes back to the drill that was open
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-drill-id="${closedId}"]`)?.focus(),
    );
  }

  /** Cancel the form: if it was an edit, go back to the detail; if it was new, go to the list. */
  protected onCancelled(): void {
    this.mode.set('view');
  }

  protected async onSave(data: DrillData): Promise<void> {
    const editing = this.mode() === 'edit' ? this.selected() : null;
    this.saving.set(true);

    try {
      if (editing) {
        await this.service.update(editing.id, data);
        this.mode.set('view');
        this.showNotice('success', `“${data.name}” was saved.`);
      } else {
        await this.service.add(data);
        // After adding we go back to the list, so another drill can be chosen
        this.selectedId.set(null);
        this.mode.set('view');
        this.showNotice('success', `“${data.name}” was added to the list.`);
      }
    } catch (err) {
      console.error('Could not save the drill:', err);
      this.showNotice('danger', 'The drill could not be saved. Check your connection and try again.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async onDelete(drill: Drill): Promise<void> {
    if (!window.confirm(`Delete “${drill.name}”? This cannot be undone.`)) return;

    try {
      await this.service.remove(drill.id);
      if (this.selectedId() === drill.id) {
        this.selectedId.set(null);
        this.mode.set('view');
      }
      this.showNotice('success', `“${drill.name}” was deleted.`);
    } catch (err) {
      console.error('Could not delete the drill:', err);
      this.showNotice('danger', 'The drill could not be deleted. Try again.');
    }
  }

  protected dismissNotice(): void {
    clearTimeout(this.noticeTimer);
    this.notice.set(null);
  }

  private showNotice(kind: Notice['kind'], text: string): void {
    clearTimeout(this.noticeTimer);
    this.notice.set({ kind, text });
    this.noticeTimer = setTimeout(() => this.notice.set(null), 5000);
  }

  /** On mobile the right area is below the list, so we scroll down to it. */
  private scrollToZone(): void {
    if (window.matchMedia(STACKED_LAYOUT).matches) {
      requestAnimationFrame(() =>
        document.getElementById('drill-zone')?.scrollIntoView({ behavior: 'smooth' }),
      );
    }
  }
}
