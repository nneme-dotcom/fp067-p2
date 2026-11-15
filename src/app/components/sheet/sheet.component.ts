import { Component, computed, input, output } from '@angular/core';
import { Drill } from '../../models/drill';

/** The drill sheet: objective, description, set-up, sequence and progressions in one card. */
@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.scss',
})
export class SheetComponent {
  readonly drill = input.required<Drill>();

  /** True to show the small delete button at the end of the sheet. */
  readonly canDelete = input(false);
  readonly deleted = output<void>();

  /** The steps of the sequence: each line of the text is one step. */
  protected readonly steps = computed(() =>
    (this.drill().sequence ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );
}
