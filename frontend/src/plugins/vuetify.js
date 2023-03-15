// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

import { en, zhHans } from "vuetify/locale";

import { md2 } from 'vuetify/blueprints';

export default createVuetify(
  {
    locale: {
      locale: "zhHans",
      messages: { zhHans, en },
    },
    blueprint: md2,
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
);
