import { Pipe, PipeTransform } from '@angular/core';
import { Drill, GROUPS, OTHER_GROUP } from '../models/drill';

/** One block of the list: the group name and its drills. */
export interface DrillBlock {
  name: string;
  drills: Drill[];
}

/**
 * Puts the drills of the list into their groups, in the order of GROUPS.
 * The drills with no group go to "Other", at the end. Empty groups are left out.
 *
 * Used like this: filtered | drillGroups
 */
@Pipe({ name: 'drillGroups' })
export class DrillGroupsPipe implements PipeTransform {
  transform(drills: readonly Drill[]): DrillBlock[] {
    const known: readonly string[] = GROUPS;
    const blocks: DrillBlock[] = [...GROUPS, OTHER_GROUP].map((name) => ({ name, drills: [] }));

    for (const drill of drills) {
      const index = drill.group ? known.indexOf(drill.group) : -1;
      blocks[index >= 0 ? index : blocks.length - 1].drills.push(drill);
    }

    return blocks.filter((block) => block.drills.length > 0);
  }
}
