// Every table passes through its Zod schema on import (CLAUDE.md: Zod at every boundary).
import cropsJson from '../crops.json' with { type: 'json' };
import timeJson from '../time.json' with { type: 'json' };
import { CropsFile, TimeFile } from './schemas.ts';

export * from './schemas.ts';

export const crops = CropsFile.parse(cropsJson).crops;
export const time = TimeFile.parse(timeJson);
