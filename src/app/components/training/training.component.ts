import { Component, input, output } from '@angular/core';
import { Drill } from '../../models/drill';
import { AnimationComponent } from '../animation/animation.component';
import { SheetComponent } from '../sheet/sheet.component';

/**
 * The training: the drills chosen in the list, one after another,
 * each with its animation on the left and its sheet on the right.
 */
@Component({
  selector: 'app-training',
  imports: [AnimationComponent, SheetComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  /** The chosen drills, in the order they were chosen. */
  readonly drills = input.required<Drill[]>();

  readonly closed = output<void>();
  readonly removed = output<Drill>();
  readonly cleared = output<void>();
}
