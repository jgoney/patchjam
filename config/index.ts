// configuration data for our supported synths. We only support one for now,
// but config parameters here could inform UI options, patch list lengths,
// etc.

import { Config } from "../@types";

const Config: Config = {
  synths: {
    DX7: {
      numVoices: 32
    }
  }
};

export default Config;
