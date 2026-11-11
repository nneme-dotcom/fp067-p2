import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drill, SPACES, Space } from '../../models/drill';
import { DrillFilterPipe } from '../../pipes/drill-filter.pipe';

@Component({
  selector: 'app-drills',
  imports: [FormsModule, DrillFilterPipe],
  templateUrl: './drills.component.html',
  styleUrl: './drills.component.scss',
})
export class DrillsComponent {
  /** Los drills de la base de datos. Vale null mientras cargan. */
  readonly drills = input<Drill[] | null>(null);

  /** Es true si no se han podido leer los datos. */
  readonly failed = input(false);

  /** Qué drill está elegido (para pintarlo en lima). */
  readonly selectedId = input<string | null>(null);

  /** Avisos al componente principal. */
  readonly drillSelected = output<Drill>();
  readonly drillDeleted = output<Drill>();
  readonly newClicked = output<void>();

  protected readonly spaces = SPACES;

  /** Lo que has escrito en el buscador y el espacio elegido. */
  protected readonly search = signal('');
  protected readonly space = signal<Space | ''>('');

  protected clearFilters(): void {
    this.search.set('');
    this.space.set('');
  }
}
