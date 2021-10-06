import jsTPS_Transaction from "../../common/jsTPS.js"

export default class DeleteList_Transaction extends jsTPS_Transaction {
    constructor(initApp, initKey) {
        super();
        this.app = initApp;
        this.key = initKey;
        this.removed = [];
    }

    doTransaction() {
        this.removed = this.app.confirmDeleteListModal(this.key);
    }
    
    undoTransaction() {
        this.app.addList(this.key, this.removed);
    }
}