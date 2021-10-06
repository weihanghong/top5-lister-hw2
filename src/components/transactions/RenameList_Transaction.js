import jsTPS_Transaction from "../../common/jsTPS.js"

export default class renameList_Transaction extends jsTPS_Transaction {
    constructor(initApp, initKey, initOldText, initNewText) {
        super();
        this.app = initApp;
        this.key = initKey;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.app.renameList(this.key, this.newText);
    }
    
    undoTransaction() {
        this.app.renameList(this.key, this.oldText);
    }
}