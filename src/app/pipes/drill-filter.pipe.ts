import { Pipe, PipeTransform } from '@angular/core';
import { Drill, Space } from '../models/drill';

/**
 * The list filter. It receives two things:
 *  1. what is typed in the search box → searches in the name and the objective
 *  2. the space from the dropdown    → empty = all
 *
 * Used like this: drills | drillFilter : text : space
 */
@Pipe({ name: 'drillFilter' })
export class DrillFilterPipe implements PipeTransform {
  transform(drills: readonly Drill[], search = '', space: Space | '' = ''): Drill[] {
    const term = normalize(search.trim());

    return drills.filter((d) => {
      const matchesText = !term || normalize(`${d.name} ${d.objective}`).includes(term);
      const matchesSpace = !space || d.space === space;
      return matchesText && matchesSpace;
    });
  }
}

/** Removes capitals and accents, so "defence" finds "Defence", and the same for accented letters. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
