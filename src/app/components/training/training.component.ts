import { Component, input, output } from '@angular/core';
import { Drill } from '../../models/drill';
import { AnimationComponent } from '../animation/animation.component';

/**
 * The training: the drills chosen in the list, in a grid that fills the screen.
 * Four drills fit on a tablet; each one shows its animation, objective and description.
 */
@Component({
  selector: 'app-training',
  imports: [AnimationComponent],
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
