import { Component, computed, inject, signal } from '@angular/core';
import { DetailComponent } from './components/detail/detail.component';
import { DrillFormComponent } from './components/drill-form/drill-form.component';
import { DrillsComponent } from './components/drills/drills.component';
import { HeaderComponent } from './components/header/header.component';
import { Drill, DrillData } from './models/drill';
import { DrillsService } from './services/drills.service';

/** Por debajo de este ancho (móvil) la lista y el detalle van uno debajo del otro. */
const STACKED_LAYOUT = '(max-width: 767.98px)';

/** Qué se enseña a la derecha: el detalle, el formulario de uno nuevo o el de editar. */
type Mode = 'view' | 'new' | 'edit';

interface Notice {
  kind: 'success' | 'danger';
  text: string;
}

/**
 * El componente principal hace de intermediario: la lista le avisa de lo que
 * pasa (elegir, borrar, nuevo) y él se lo cuenta al servicio y a los demás.
 */
@Component({
  selector: 'app-root',
  imports: [HeaderComponent, DrillsComponent, DetailComponent, DrillFormComponent],
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
   * El drill elegido, buscado cada vez en la lista que viene de Firestore.
   * Así, si alguien lo cambia desde la consola, el detalle se actualiza solo.
   */
  protected readonly selected = computed(
    () => this.drills()?.find((d) => d.id === this.selectedId()) ?? null,
  );

  private noticeTimer?: ReturnType<typeof setTimeout>;

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

    // Al cerrar, el cursor del teclado vuelve al drill que estaba abierto
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-drill-id="${closedId}"]`)?.focus(),
    );
  }

  /** Cancelar el formulario: si se editaba, volvemos al detalle; si era nuevo, a la lista. */
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
        this.showNotice('success', `“${data.nombre}” was saved.`);
      } else {
        await this.service.add(data);
        // Al terminar de añadir volvemos a la lista, para poder elegir otro drill
        this.selectedId.set(null);
        this.mode.set('view');
        this.showNotice('success', `“${data.nombre}” was added to the list.`);
      }
    } catch (err) {
      console.error('Could not save the drill:', err);
      this.showNotice('danger', 'The drill could not be saved. Check your connection and try again.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async onDelete(drill: Drill): Promise<void> {
    if (!window.confirm(`Delete “${drill.nombre}”? This cannot be undone.`)) return;

    try {
      await this.service.remove(drill.id);
      if (this.selectedId() === drill.id) {
        this.selectedId.set(null);
        this.mode.set('view');
      }
      this.showNotice('success', `“${drill.nombre}” was deleted.`);
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

  /** En el móvil la zona de la derecha queda debajo de la lista, así que bajamos hasta ella. */
  private scrollToZone(): void {
    if (window.matchMedia(STACKED_LAYOUT).matches) {
      requestAnimationFrame(() =>
        document.getElementById('drill-zone')?.scrollIntoView({ behavior: 'smooth' }),
      );
    }
  }
}
