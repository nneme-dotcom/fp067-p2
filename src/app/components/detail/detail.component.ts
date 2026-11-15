import { Component, computed, input, output, signal } from '@angular/core';
import { Drill } from '../../models/drill';
import { AnimationComponent } from '../animation/animation.component';
import { MediaComponent } from '../media/media.component';

@Component({
  selector: 'app-detail',
  imports: [AnimationComponent, MediaComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  /** The drill to show (the main component gives it to us). */
  readonly drill = input.required<Drill>();

  /** Events for the main component: edit or close. */
  readonly edit = output<void>();
  readonly closed = output<void>();

  /** The steps of the sequence: each line of the text is one step. */
  protected readonly steps = computed(() =>
    (this.drill().sequence ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );

  /** The image that failed to load, so we do not show the broken image icon. */
  protected readonly brokenImage = signal<string | null>(null);
}
