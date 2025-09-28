import primariesData from '../../data/primaries.json';

export type PrimaryId = 'CB' | 'WB' | 'WR' | 'CR' | 'WY' | 'CY';

export interface PrimaryDef {
  id: PrimaryId;
  name: string;
  rgb: [number, number, number];
  hex: string;
}

export const primaries: PrimaryDef[] = primariesData as PrimaryDef[];

export const getPrimaryById = (id: PrimaryId): PrimaryDef | undefined => {
  return primaries.find(p => p.id === id);
};

export const getPrimaryByHex = (hex: string): PrimaryDef | undefined => {
  return primaries.find(p => p.hex.toLowerCase() === hex.toLowerCase());
};


