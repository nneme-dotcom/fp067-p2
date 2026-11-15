import { Component, input, output, signal } from '@angular/core';
import { Drill } from '../../models/drill';
import { AnimationComponent } from '../animation/animation.component';
import { MediaComponent } from '../media/media.component';
import { SheetComponent } from '../sheet/sheet.component';

@Component({
  selector: 'app-detail',
  imports: [AnimationComponent, MediaComponent, SheetComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  /** The drill to show (the main component gives it to us). */
  readonly drill = input.required<Drill>();

  /** Events for the main component: edit, delete or close. */
  readonly edit = output<void>();
  readonly deleted = output<void>();
  readonly closed = output<void>();

  /** The image that failed to load, so we do not show the broken image icon. */
  protected readonly brokenImage = signal<string | null>(null);
}
