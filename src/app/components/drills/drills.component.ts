import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drill, SPACES, Space } from '../../models/drill';
import { DrillFilterPipe } from '../../pipes/drill-filter.pipe';
import { DrillGroupsPipe } from '../../pipes/drill-groups.pipe';

@Component({
  selector: 'app-drills',
  imports: [FormsModule, DrillFilterPipe, DrillGroupsPipe],
  templateUrl: './drills.component.html',
  styleUrl: './drills.component.scss',
})
export class DrillsComponent {
  /** The drills from the database. It is null while they load. */
  readonly drills = input<Drill[] | null>(null);

  /** True if the data could not be read. */
  readonly failed = input(false);

  /** Which drill is selected (to colour it lime). */
  readonly selectedId = input<string | null>(null);

  /** Events for the main component. */
  readonly drillSelected = output<Drill>();
  readonly drillDeleted = output<Drill>();
  readonly newClicked = output<void>();

  protected readonly spaces = SPACES;

  /** What was typed in the search box and the chosen space. */
  protected readonly search = signal('');
  protected readonly space = signal<Space | ''>('');

  protected clearFilters(): void {
    this.search.set('');
    this.space.set('');
  }
}
