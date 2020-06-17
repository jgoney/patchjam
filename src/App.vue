<template>
  <v-app>
    <v-app-bar app color="primary" dark src="@/assets/banner.jpg">
      <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(19,84,122,.5), rgba(128,208,199,.8)"
        ></v-img>
      </template>
      <div class="d-flex align-center">
        <h1>Patchjam</h1>
      </div>
      <v-spacer></v-spacer>
      <v-tooltip top open-delay="300">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :disabled="!selectedSynth"
            v-bind="attrs"
            v-on="on"
            @click="getRandomPatches"
          >
            <v-icon>mdi-dice-5</v-icon>
          </v-btn>
        </template>
        <span>I'm feelin' lucky!</span>
      </v-tooltip>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-text-field
                  @keyup="search"
                  placeholder="Search for a patch (in name or author)"
                  v-model="searchString"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-pagination
                  @input="getPatches"
                  total-visible="10"
                  v-model="page"
                  :length="totalPages"
                ></v-pagination>
              </v-col>
            </v-row>

            <draggable
              v-model="patches"
              :group="{ name: 'patches', pull: 'clone', put: false }"
              :move="checkMove"
            >
              <PatchCard
                v-for="(patch, i) in patches"
                :key="patch.id"
                :index="i"
                :patch="patch"
                color="secondary"
              />
            </draggable>
          </v-col>

          <v-col>
            <v-row>
              <v-col>
                <v-select
                  :items="synthOptions"
                  label="Please select a synth"
                  v-model="selectedSynth"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>
                  New patch list
                  <span v-if="selectedSynth">for {{ selectedSynth }}</span>
                </h2>
              </v-col>
              <v-col> </v-col>
            </v-row>

            <draggable
              class="my-5"
              :class="dropzoneClass"
              v-model="myPatchList"
              group="patches"
            >
              <div v-show="!myPatchList.length" class="pa-5 pb-0" slot="header">
                <div v-if="selectedSynth">
                  Drag and drop patches here.
                  <span v-if="selectedSynth">
                    {{ selectedSynth }} requires
                    {{ selectedSynthConfig.numVoices }} patches to make a patch
                    list.
                  </span>
                </div>
                <div v-else>
                  Please select a target synth first.
                </div>
              </div>
              <PatchCard
                v-for="(patch, i) in myPatchList"
                :key="patch.id"
                :index="i"
                :patch="patch"
                deletable
                @remove-patch="removePatch"
              />
            </draggable>
            <v-btn
              @click="downloadSysex"
              class="ma-2"
              color="primary"
              :disabled="!patchlistIsValid"
            >
              <v-icon dark left>mdi-cloud-download</v-icon>
              Download sysex
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

import debounce from "lodash.debounce";
import draggable from "vuedraggable";
import { DateTime } from "luxon";

import { SynthPatch, SynthConfig, RemovePatchEvt } from "../@types";
import Config from "../config";

import PatchCard from "./components/PatchCard.vue";

export default Vue.extend({
  name: "App",
  components: {
    draggable,
    PatchCard
  },
  data: () => ({
    searchString: "",
    page: 1,
    limit: 32,
    totalPages: 0,
    loading: false,
    patches: [] as Array<SynthPatch>,
    myPatchList: [] as Array<SynthPatch>,
    synthOptions: [] as Array<string>,
    selectedSynth: ""
  }),
  computed: {
    selectedSynthConfig(): SynthConfig | null {
      if (this.selectedSynth) {
        return Config.synths[this.selectedSynth];
      }
      return null;
    },
    dropzoneClass(): string {
      const classes: string[] = [];
      if (!this.selectedSynth) {
        classes.push("deactivated");
      }
      if (!this.myPatchList.length) {
        classes.push("dropzone");
      }
      return classes.join(" ");
    },
    patchlistIsValid(): boolean {
      if (this.selectedSynthConfig) {
        return (
          this.selectedSynthConfig &&
          this.myPatchList.length === this.selectedSynthConfig.numVoices
        );
      }
      return false;
    }
  },
  methods: {
    removePatch(e: RemovePatchEvt) {
      this.myPatchList.splice(e.index, 1);
    },
    search() {
      this.page = 1;
      this.getPatches();
    },
    debounceSearchPatches: debounce(function(this: any) {
      this.search();
    }, 200),
    async getPatches() {
      this.loading = true;
      const response = await fetch(
        `/api/patches?qs=${this.searchString}&page=${this.page}&limit=${this.limit}&synth=${this.selectedSynth}`
      );

      const data = await response.json();
      this.loading = false;

      this.patches = data.patches;
      this.totalPages = data.total;
    },
    async getRandomPatches() {
      if (this.selectedSynthConfig) {
        this.loading = true;
        const response = await fetch(
          `/api/random?n=${this.selectedSynthConfig.numVoices}&synth=${this.selectedSynth}`
        );

        const data = await response.json();
        this.loading = false;

        this.myPatchList = data.patches;
      }
    },
    async downloadSysex() {
      const patchIDs = this.myPatchList.map(patch => `ids=${patch.id}`);
      const qp = patchIDs.join("&");

      const response = await fetch(
        `/api/sysex?${qp}&synth=${this.selectedSynth}`
      );
      const data = await response.blob();
      const filename = `${
        this.selectedSynth
      }-${DateTime.local().toISODate()}.syx`;

      // Create and activate an invisible download button for our sysex
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    checkMove(e: any) {
      // don't add patches if synth isn't chosen yet (to avoid incompatibilities)
      if (!this.selectedSynth) {
        return false;
      }
      // don't add any more patches if our list is at the maximum length
      if (this.selectedSynthConfig.numVoices === this.myPatchList.length) {
        return false;
      }
      // don't add patch if it's a dupe
      for (const patch of e.relatedContext.list) {
        if (e.draggedContext.element.id === patch.id) {
          return false;
        }
      }
      return true;
    }
  },
  mounted() {
    this.getPatches();
    this.synthOptions = Object.keys(Config.synths);
  }
});
</script>
<style>
.dropzone {
  position: relative;
  background-color: white;
  border-radius: 6px;
  color: #4a4a4a;
  display: block;
  height: 16rem;
  border: 2px dashed #363636;
}

.deactivated {
  opacity: 50%;
}
</style>
