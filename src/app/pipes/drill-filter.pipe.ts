import { Pipe, PipeTransform } from '@angular/core';
import { Drill, Space } from '../models/drill';

/**
 * El filtro de la lista. Recibe dos cosas:
 *  1. lo que escribes en el buscador → busca en el nombre y en el objetivo
 *  2. el espacio del desplegable    → vacío = todos
 *
 * Se usa así: drills | drillFilter : texto : espacio
 */
@Pipe({ name: 'drillFilter' })
export class DrillFilterPipe implements PipeTransform {
  transform(drills: readonly Drill[], search = '', space: Space | '' = ''): Drill[] {
    const term = normalize(search.trim());

    return drills.filter((d) => {
      const matchesText = !term || normalize(`${d.nombre} ${d.objetivo}`).includes(term);
      const matchesSpace = !space || d.espacio === space;
      return matchesText && matchesSpace;
    });
  }
}

/** Quita mayúsculas y tildes, para que «defensa» encuentre «Defensa» y «zaguera» a «zaguéra». */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
