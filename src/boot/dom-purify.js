import { boot } from "quasar/wrappers";
import VueDOMPurifyHTML from "vue-dompurify-html";

export default boot(({ app }) => {
  app.use(VueDOMPurifyHTML, {
    namedConfigurations: {
      unity: {
        ALLOWED_TAGS: [
          "p",
          "br",
          "b",
          "strong",
          "i",
          "em",
          "size",
          "color",
          "a",
        ],
        ALLOWED_ATTR: ["style", "href", "target"],
      },
    },
  });
});
