import { boot } from "quasar/wrappers";
import VueDOMPurifyHTML from "vue-dompurify-html";

export default boot(({ app }) => {
  app.use(VueDOMPurifyHTML);
});
