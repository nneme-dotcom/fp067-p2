import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Shows the 3D animation of a drill inside the page. */
@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrl: './animation.component.scss',
})
export class AnimationComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Address of the animation page (the form only lets https:// or assets/ links through). */
  readonly src = input.required<string>();
  /** Describes the animation for screen reader users. */
  readonly label = input('3D animation');

  /** Angular does not trust iframe addresses by default, so we mark this one as safe. */
  protected readonly safeSrc = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.src()));
}
