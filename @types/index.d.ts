export type SynthPatch = {
  id: number;
  name: number;
  data: string;
  synth: string;
};

export type SynthConfig = {
  numVoices: number
};

export type Config = {
  synths: {[key:string]: SynthConfig};
};

export type RemovePatchEvt = {
  index: number;
};