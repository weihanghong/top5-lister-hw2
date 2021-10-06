import jsTPS_Transaction from "../../common/jsTPS.js"

export default class RenameItem_Transaction extends jsTPS_Transaction {
    constructor(initApp, initIndex, initOldText, initNewText) {
        super();
        this.app = initApp;
        this.index = initIndex;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.app.renameItem(this.index, this.newText);
    }
    
    undoTransaction() {
        this.app.renameItem(this.index, this.oldText);
    }
}