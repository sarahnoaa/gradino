export interface SingleColumnDefinition {
  type: 'single';
  gradations: number;
  colors: [string, string]; // [start, end] color IDs
}

export interface ThreeAnchorDefinition {
  type: 'three-anchor';
  colors: [string, string, string]; // [top, middle, bottom] color IDs
  topGradations: number; // intermediate tiles between top and middle
  bottomGradations: number; // intermediate tiles between middle and bottom
}

export interface MultiColumnDefinition {
  type: 'multi';
  columns: {
    gradations: number;
    colors: [string, string]; // [start, end] color IDs
  }[];
}

export interface ConnectedGridDefinition {
  type: 'connected-grid';
  corners: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  leftGradations: number; // intermediate tiles in left column
  rightGradations: number; // intermediate tiles in right column
}

export type PuzzleDefinition = SingleColumnDefinition | ThreeAnchorDefinition | MultiColumnDefinition | ConnectedGridDefinition;

export const PUZZLE_DEFINITIONS: Record<number, PuzzleDefinition> = {
  1: { type: 'single', gradations: 3, colors: ['CB', 'CY'] }, // Cool Blue → Cool Yellow (5 total: 3 intermediate + 2 anchors)
  2: { type: 'single', gradations: 3, colors: ['WB', 'WY'] }, // Warm Blue → Warm Yellow (5 total: 3 intermediate + 2 anchors)
  3: { type: 'single', gradations: 4, colors: ['WY', 'WR'] }, // Warm Yellow → Warm Red (6 total: 4 intermediate + 2 anchors)
  4: { type: 'single', gradations: 4, colors: ['CY', 'CR'] }, // Cool Yellow → Cool Red (6 total: 4 intermediate + 2 anchors)
  5: { type: 'single', gradations: 5, colors: ['CR', 'WB'] }, // Cool Red → Warm Blue (7 total: 5 intermediate + 2 anchors)
  6: { type: 'single', gradations: 5, colors: ['WR', 'CB'] }, // Warm Red → Cool Blue (7 total: 5 intermediate + 2 anchors)
  7: { 
    type: 'three-anchor',
    colors: ['CB', 'CY', 'WB'], // Cool Blue → Cool Yellow → Warm Blue
    topGradations: 2, // 2 intermediate tiles between CB and CY
    bottomGradations: 2 // 2 intermediate tiles between CY and WB
  },
  8: { 
    type: 'three-anchor',
    colors: ['CB', 'WY', 'WB'], // Cool Blue → Warm Yellow → Warm Blue
    topGradations: 2, // 2 intermediate tiles between CB and WY
    bottomGradations: 2 // 2 intermediate tiles between WY and WB
  },
  9: { 
    type: 'three-anchor',
    colors: ['WR', 'WB', 'CR'], // Warm Red → Warm Blue → Cool Red
    topGradations: 2, // 2 intermediate tiles between WR and WB
    bottomGradations: 2 // 2 intermediate tiles between WB and CR
  },
  10: { 
    type: 'three-anchor',
    colors: ['WR', 'CB', 'CR'], // Warm Red → Cool Blue → Cool Red
    topGradations: 2, // 2 intermediate tiles between WR and CB
    bottomGradations: 2 // 2 intermediate tiles between CB and CR
  },
  11: { 
    type: 'connected-grid',
    corners: {
      topLeft: 'WB',    // Warm Blue
      topRight: 'CB',   // Cool Blue
      bottomLeft: 'WY', // Warm Yellow
      bottomRight: 'CY' // Cool Yellow
    },
    leftGradations: 3,  // 3 intermediate tiles in left column (WB → WY)
    rightGradations: 3  // 3 intermediate tiles in right column (CB → CY)
  },
  12: { 
    type: 'multi', 
    columns: [
      { gradations: 3, colors: ['CB', 'WY'] }, // Column 1: Cool Blue → Warm Yellow (5 total: 3 intermediate + 2 anchors)
      { gradations: 3, colors: ['WB', 'CY'] }  // Column 2: Warm Blue → Cool Yellow (5 total: 3 intermediate + 2 anchors)
    ]
  },
};

export const TOTAL_LEVELS = Object.keys(PUZZLE_DEFINITIONS).length;
