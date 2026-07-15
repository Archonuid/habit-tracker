export type Archetype =
  | 'adventurer'
  | 'assassin'
  | 'cyborg'
  | 'elf'
  | 'hunter'
  | 'player'
  | 'siren'
  | 'ranker'
  | 'traveller'
;

export interface SigilDef {
  name: string;
  color: string;
  mark: string;
  orbital: string;
}

export const SIGILS: Record<Archetype, SigilDef> = {
  adventurer: {
    name: 'Adventurer',
    color: '#EF9F27',
    mark:
      '<path d="M110 62 L122 104 L158 110 L122 116 L110 158 L98 116 L62 110 L98 104 Z" fill="currentColor"/><circle cx="110" cy="110" r="9" fill="none" stroke="currentColor" stroke-width="2"/>',
    orbital:
      '<circle cx="110" cy="34" r="3" fill="currentColor"/><circle cx="186" cy="110" r="2.5" fill="currentColor"/>',
  },
  assassin: {
    name: 'Assassin',
    color: '#E24B4A',
    mark:
      '<path d="M110 54 L120 100 L110 150 L100 100 Z" fill="currentColor"/><path d="M88 104 L132 104 L128 114 L92 114 Z" fill="currentColor"/><path d="M110 150 L104 168 L116 168 Z" fill="currentColor" opacity="0.6"/>',
    orbital:
      '<path d="M110 30 L114 40 L110 50 L106 40 Z" fill="currentColor"/><path d="M110 170 L114 180 L110 190 L106 180 Z" fill="currentColor" opacity="0.5"/>',
  },
  cyborg: {
    name: 'Cyborg',
    color: '#378ADD',
    mark:
      '<rect x="86" y="86" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="100" y="100" width="20" height="20" fill="currentColor"/><path d="M110 62 L110 86 M110 134 L110 158 M62 110 L86 110 M134 110 L158 110" stroke="currentColor" stroke-width="2"/><path d="M74 74 L86 86 M146 74 L134 86 M74 146 L86 134 M146 146 L134 134" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>',
    orbital:
      '<rect x="106" y="28" width="8" height="8" fill="currentColor"/><rect x="182" y="106" width="6" height="8" fill="currentColor"/><rect x="32" y="106" width="6" height="8" fill="currentColor" opacity="0.6"/>',
  },
  elf: {
    name: 'Elf',
    color: '#639922',
    mark:
      '<path d="M110 56 C138 78 144 116 110 160 C76 116 82 78 110 56 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M110 60 L110 156" stroke="currentColor" stroke-width="1.5"/><path d="M110 92 C96 88 90 96 88 104 M110 92 C124 88 130 96 132 104 M110 120 C98 116 94 124 92 130 M110 120 C122 116 126 124 128 130" stroke="currentColor" stroke-width="1.5" fill="none"/>',
    orbital:
      '<circle cx="110" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="176" cy="145" r="3" fill="currentColor" opacity="0.7"/>',
  },
  hunter: {
    name: 'Hunter',
    color: '#BA7517',
    mark:
      '<path d="M78 60 C82 96 84 128 92 156" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M104 54 C106 94 106 130 110 160" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M130 60 C130 96 128 128 124 156" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M142 72 C140 102 136 124 132 144" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.65"/>',
    orbital:
      '<path d="M110 26 L116 38 L104 38 Z" fill="currentColor"/>',
  },
  player: {
    name: 'Player',
    color: '#85B7EB',
    mark:
      '<rect x="66" y="80" width="88" height="62" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M66 96 L154 96" stroke="currentColor" stroke-width="2"/><rect x="72" y="86" width="5" height="5" fill="currentColor"/><path d="M80 112 L140 112 M80 124 L120 124" stroke="currentColor" stroke-width="2" opacity="0.7"/><path d="M60 74 L60 66 L68 66 M152 66 L160 66 L160 74 M60 148 L60 156 L68 156 M160 148 L160 156 L152 156" stroke="currentColor" stroke-width="2" fill="none"/>',
    orbital:
      '<rect x="104" y="30" width="12" height="3" fill="currentColor"/><rect x="104" y="188" width="12" height="3" fill="currentColor" opacity="0.6"/>',
  },
  siren: {
    name: 'Siren',
    color: '#1D9E75',
    mark:
      '<path d="M110 110 C110 90 128 82 140 92 C156 106 148 142 110 154 C72 142 64 106 80 92 C92 82 110 90 110 110 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M110 108 C118 100 128 104 128 114 C128 126 118 134 110 138 C102 134 92 126 92 114 C92 104 102 100 110 108 Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/><circle cx="110" cy="72" r="7" fill="currentColor"/>',
    orbital:
      '<path d="M110 30 C120 36 120 46 110 52 C100 46 100 36 110 30 Z" fill="currentColor" opacity="0.8"/>',
  },
  ranker: {
    name: 'Ranker',
    color: '#F0997B',
    mark:
      '<path d="M110 52 L146 76 L146 128 L110 156 L74 128 L74 76 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M110 74 L132 88 L132 122 L110 138 L88 122 L88 88 Z" fill="none" stroke="currentColor" stroke-width="1.8" opacity="0.75"/><path d="M110 94 L120 100 L120 116 L110 124 L100 116 L100 100 Z" fill="currentColor"/>',
    orbital:
      '<path d="M110 26 L118 40 L102 40 Z" fill="currentColor"/><path d="M110 182 L118 196 L102 196 Z" fill="currentColor" opacity="0.5"/>',
  },
  traveller: {
    name: 'Traveller',
    color: '#AFA9EC',
    mark:
      '<circle cx="110" cy="66" r="4" fill="currentColor"/><circle cx="76" cy="104" r="3.5" fill="currentColor"/><circle cx="146" cy="98" r="3.5" fill="currentColor"/><circle cx="94" cy="148" r="4" fill="currentColor"/><circle cx="140" cy="142" r="3" fill="currentColor"/><circle cx="110" cy="112" r="5" fill="currentColor"/><path d="M110 66 L76 104 L94 148 L140 142 L146 98 Z" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.55"/><path d="M110 112 L110 66 M110 112 L76 104 M110 112 L146 98 M110 112 L94 148 M110 112 L140 142" stroke="currentColor" stroke-width="1" opacity="0.4"/>',
    orbital:
      '<circle cx="110" cy="30" r="2.5" fill="currentColor"/><circle cx="188" cy="126" r="2" fill="currentColor"/><circle cx="36" cy="90" r="2" fill="currentColor" opacity="0.7"/>',
  },
};

export const ARCHETYPES = Object.keys(SIGILS) as Archetype[];
