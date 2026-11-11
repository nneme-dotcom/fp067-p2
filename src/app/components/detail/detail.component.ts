import { Component, computed, input, output, signal } from '@angular/core';
import { Drill } from '../../models/drill';
import { MediaComponent } from '../media/media.component';

@Component({
  selector: 'app-detail',
  imports: [MediaComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  /** El drill que hay que mostrar (nos lo pasa el componente principal). */
  readonly drill = input.required<Drill>();

  /** Avisos al componente principal: editar o cerrar. */
  readonly edit = output<void>();
  readonly closed = output<void>();

  /** Los pasos de la secuencia: cada línea del texto es un paso. */
  protected readonly steps = computed(() =>
    (this.drill().secuencia ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );

  /** La imagen que no se ha podido cargar, para no enseñar el icono de imagen rota. */
  protected readonly brokenImage = signal<string | null>(null);
}
