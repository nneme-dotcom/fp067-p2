import { Component, ElementRef, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss',
})
export class MediaComponent {
  /** Dirección del vídeo. */
  readonly src = input.required<string>();

  /** Para describir el vídeo a quien usa lector de pantalla. */
  readonly label = input.required<string>();

  /** El vídeo de la página, para poder darle órdenes (play, pausa...). */
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  /** Cómo está el reproductor ahora mismo (se actualiza cuando el vídeo cambia). */
  protected readonly isPlaying = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly volume = signal(0.8);
  protected readonly muted = signal(false);
  /** La forma del vídeo (ancho / alto). Hasta que carga suponemos que es apaisado. */
  protected readonly aspectRatio = signal('16 / 9');
  /** Se pone a true si la dirección no lleva a un vídeo que se pueda reproducir. */
  protected readonly loadFailed = signal(false);

  private get video(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }

  // ---------- Lo que hacen los botones ----------

  protected play(): void {
    // A veces el navegador no deja reproducir; si pasa, lo apuntamos en la consola y seguimos
    this.video.play().catch((err) => console.warn('Video could not be played:', err));
  }

  protected pause(): void {
    this.video.pause();
  }

  /** El navegador no trae botón de stop, así que lo hacemos a mano: pausa y vuelta al principio. */
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

  /** Al mover la barra, saltamos a ese momento del vídeo. */
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

  // ---------- Lo que nos cuenta el vídeo (para tener la pantalla al día) ----------

  protected onLoadedMetadata(): void {
    this.loadFailed.set(false);
    this.duration.set(this.video.duration || 0);
    // Ajustamos el marco a la forma del vídeo para que no queden franjas negras
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

  /** Pasa segundos a minutos: 75 → "1:15" */
  protected formatTime(seconds: number): string {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
}
