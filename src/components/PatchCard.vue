<template>
  <v-card :color="color" dark class="mb-2">
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <v-card-title class="title"
          >{{ index + 1 }}: {{ patch.name }}</v-card-title
        >
        <v-card-subtitle
          >{{ patch.author }}<br />{{ patch.original_sysex }}</v-card-subtitle
        >
      </div>

      <v-btn v-if="deletable" text @click="removePatch" class="mt-1">
        <v-icon dark>mdi-minus-circle</v-icon>
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import { SynthPatch } from "../../@types";

export default Vue.extend({
  name: "PatchCard",
  props: {
    index: { type: Number, required: true },
    patch: { type: Object as PropType<SynthPatch>, required: true },
    deletable: { type: Boolean, default: false },
    color: { type: String, default: "accent" }
  },
  methods: {
    removePatch() {
      this.$emit("remove-patch", { index: this.index });
    }
  }
});
</script>
