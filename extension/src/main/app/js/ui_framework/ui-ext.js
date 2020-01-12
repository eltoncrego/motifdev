import { formatAsHTMLClass } from "../ext/helpers"
import MOTIF_CLASSES from "../constants/motif_classes"

class UIExt {
    buildTagDiv(tag, isOperator = false) {
        return  (
            `<li class="${formatAsHTMLClass(MOTIF_CLASSES.SONGTAG)}">
                <div class="motif-tag motif-tag-song ${isOperator ? "motif-operator" : ""}">
                    <span>${tag}</span>
                    <div class="${formatAsHTMLClass(MOTIF_CLASSES.DELETE_CONTAINER)}">
                        <svg viewBox="0 0 8 8" class="${formatAsHTMLClass(MOTIF_CLASSES.DELETE)}"><polygon points="8 1.01818182 6.98181818 0 4 2.98181818 1.01818182 0 0 1.01818182 2.98181818 4 0 6.98181818 1.01818182 8 4 5.01818182 6.98181818 8 8 6.98181818 5.01818182 4"></polygon></svg>
                    </div>
                </div>
            </li>`
        );
    }
}

export default UIExt;