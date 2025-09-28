export interface SingleColumnDefinition {
  type: 'single';
  gradations: number;
  colors: [string, string]; // [start, end] color IDs
}

export interface MultiColumnDefinition {
  type: 'multi';
  columns: {
    gradations: number;
    colors: [string, string]; // [start, end] color IDs
  }[];
}

export type PuzzleDefinition = SingleColumnDefinition | MultiColumnDefinition;

export const PUZZLE_DEFINITIONS: Record<number, PuzzleDefinition> = {
  1: { type: 'single', gradations: 3, colors: ['CB', 'CY'] }, // Cool Blue → Cool Yellow (5 total: 3 intermediate + 2 anchors)
  2: { type: 'single', gradations: 3, colors: ['WB', 'WY'] }, // Warm Blue → Warm Yellow (5 total: 3 intermediate + 2 anchors)
  3: { type: 'single', gradations: 4, colors: ['WY', 'WR'] }, // Warm Yellow → Warm Red (6 total: 4 intermediate + 2 anchors)
  4: { type: 'single', gradations: 4, colors: ['CY', 'CR'] }, // Cool Yellow → Cool Red (6 total: 4 intermediate + 2 anchors)
  5: { type: 'single', gradations: 5, colors: ['CR', 'WB'] }, // Cool Red → Warm Blue (7 total: 5 intermediate + 2 anchors)
  6: { type: 'single', gradations: 5, colors: ['WR', 'CB'] }, // Warm Red → Cool Blue (7 total: 5 intermediate + 2 anchors)
  7: { 
    type: 'multi', 
    columns: [
      { gradations: 3, colors: ['CR', 'WB'] }, // Column 1: Cool Red → Warm Blue (5 total: 3 intermediate + 2 anchors)
      { gradations: 3, colors: ['WR', 'CB'] }  // Column 2: Warm Red → Cool Blue (5 total: 3 intermediate + 2 anchors)
    ]
  },
};

export const TOTAL_LEVELS = Object.keys(PUZZLE_DEFINITIONS).length;
