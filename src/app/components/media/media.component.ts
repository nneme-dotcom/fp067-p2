import { Component, ElementRef, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss',
})
export class MediaComponent {
  /** Video URL. */
  readonly src = input.required<string>();

  /** To describe the video for screen reader users. */
  readonly label = input.required<string>();

  /** The video element on the page, so we can control it (play, pause...). */
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  /** Current state of the player (updated when the video changes). */
  protected readonly isPlaying = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly volume = signal(0.8);
  protected readonly muted = signal(false);
  /** The shape of the video (width / height). Until it loads we assume it is landscape. */
  protected readonly aspectRatio = signal('16 / 9');
  /** Set to true if the URL does not lead to a video that can be played. */
  protected readonly loadFailed = signal(false);

  private get video(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }

  // ---------- What the buttons do ----------

  protected play(): void {
    // Sometimes the browser does not allow playback; if so, we log it in the console and carry on
    this.video.play().catch((err) => console.warn('Video could not be played:', err));
  }

  protected pause(): void {
    this.video.pause();
  }

  /** The browser has no stop button, so we do it by hand: pause and go back to the start. */
  protected stop(): void {
    this.video.pause();
    this.video.currentTime = 0;
  }

  protected togglePlay(): void {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  /** When the bar is moved, we jump to that point of the video. */
  protected seek(event: Event): void {
    this.video.currentTime = Number((event.target as HTMLInputElement).value);
  }

  protected changeVolume(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.video.volume = value;
    this.video.muted = value === 0;
  }

  protected toggleMute(): void {
    this.video.muted = !this.video.muted;
    if (!this.video.muted && this.video.volume === 0) {
      this.video.volume = 0.5;
    }
  }

  // ---------- What the video tells us (to keep the screen up to date) ----------

  protected onLoadedMetadata(): void {
    this.loadFailed.set(false);
    this.duration.set(this.video.duration || 0);
    // We fit the frame to the shape of the video so there are no black bars
    if (this.video.videoWidth && this.video.videoHeight) {
      this.aspectRatio.set(`${this.video.videoWidth} / ${this.video.videoHeight}`);
    }
    this.currentTime.set(0);
    this.video.volume = this.volume();
  }

  protected onTimeUpdate(): void {
    this.currentTime.set(this.video.currentTime);
  }

  protected onPlayState(): void {
    this.isPlaying.set(!this.video.paused);
  }

  protected onVolumeChange(): void {
    this.volume.set(this.video.volume);
    this.muted.set(this.video.muted);
  }

  /** Converts seconds to minutes: 75 → "1:15" */
  protected formatTime(seconds: number): string {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
}
