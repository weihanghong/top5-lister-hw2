import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

import RenameList_Transaction from './components/transactions/RenameList_Transaction'
import RenameItem_Transaction from './components/transactions/RenameItem_Transaction';
import MoveItem_Transaction from './components/transactions/MoveItem_Transaction';
import DeleteList_Transaction from './components/transactions/DeleteList_Transaction';
import jsTPS from './common/jsTPS';


class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            title: null
        }

        this.tps = new jsTPS();
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.closeVisible();
            this.undoInvisible();
            this.redoInvisible();
        });
    }
    renameItem = (index, newName) => {
        let newCurrentList = this.state.currentList;
        newCurrentList.items[index] = newName;
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            let list = this.db.queryGetList(newCurrentList.key);
            list.items[index] = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            if(!this.tps.hasTransactionToUndo()) {
                this.undoInvisible();
            } else {this.undoVisible();}
            if(!this.tps.hasTransactionToRedo()) {
                this.redoInvisible();
            } else {this.redoVisible();}

        });
    }
    addRenameItemTransaction = (index, newName) => {
        let oldName = this.state.currentList.items[index-1];
        let transaction = new RenameItem_Transaction(this, index-1, oldName, newName);
        this.tps.addTransaction(transaction);
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    addRenameListTransaction = (key, newName) => {
        let oldName = this.state.currentList.name;
        let transaction = new RenameList_Transaction(this, key, oldName, newName);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.closeVisible();
            this.undoInvisible();
            this.redoInvisible();
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.closeInvisible();
            this.undoInvisible();
            this.redoInvisible();
            this.tps.clearAllTransactions();
        });
    }
    deleteList = (keyNamePair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        let name = keyNamePair.name;
        this.setState(prevState => ({
            title: name
        }))
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    confirmDeleteListModal = () => {
        let modal = document.getElementById("delete-modal");
        let newKeyNamePairs = {};
        this.setState(prevState => ({
            currentList: null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter-1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            modal.classList.remove("is-visible");
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.closeCurrentList();
        });
    }

    addConfirmDeleteTransaction = (key) => {
        let transaction = new DeleteList_Transaction(this, key);
        this.tps.addTransaction(transaction);
    }

    addMoveItemTransaction = (keyNamePair) => {
        let oldIndex = this.currentList;
        let newIndex = keyNamePair.key;
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
    }

    closeVisible = () => {
        let close = document.getElementById("close-button");
            close.classList.remove("top5-button-disabled");
            close.classList.add("top5-button");
    }

    closeInvisible = () => {
        let close = document.getElementById("close-button");
            close.classList.remove("top5-button");
            close.classList.add("top5-button-disabled");
    }

    undoVisible = () => {
        let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button-disabled");
            undo.classList.add("top5-button");
    }

    undoInvisible = () => {
        let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button");
            undo.classList.add("top5-button-disabled");
    }

    redoVisible = () => {
        let redo = document.getElementById("redo-button");
            redo.classList.remove("top5-button-disabled");
            redo.classList.add("top5-button");
    }

    redoInvisible = () => {
        let redo = document.getElementById("redo-button");
            redo.classList.remove("top5-button");
            redo.classList.add("top5-button-disabled");
    }

    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.redoVisible();
        }
    }

    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.undoVisible();
        }
    }

    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback={this.undo}
                    redoCallback={this.redo} />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.addRenameListTransaction}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.addRenameItemTransaction}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    confirmDeleteListModalCallback={this.addRenameItemTransaction}
                    listKeyPair={this.state.title}
                />
            </div>
        );
    }
}

export default App;
