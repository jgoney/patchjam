import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader

import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#607D8B",
        secondary: "#757575",
        accent: "#009688"
      }
    }
  }
});
