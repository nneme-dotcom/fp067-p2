import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Shows the 3D animation of a drill inside the page. */
@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrl: './animation.component.scss',
  host: { '[class.compact]': 'compact()' },
})
export class AnimationComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Address of the animation page (the form only lets https:// or assets/ links through). */
  readonly src = input.required<string>();
  /** Describes the animation for screen reader users. */
  readonly label = input('3D animation');
  /** True to show it small and fill the space it is given (used in the training). */
  readonly compact = input(false);

  /** Angular does not trust iframe addresses by default, so we mark this one as safe. */
  protected readonly safeSrc = computed(() => {
    // In compact mode the animation page hides its title and shrinks its buttons
    const src = this.compact() ? this.src() + (this.src().includes('?') ? '&' : '?') + 'compact' : this.src();
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  });
}
