import React from "react";
import Top5Item from "./Top5Item";

export default class Workspace extends React.Component {
    render() {
        const 
        { 
            currentList,
            renameItemCallback,
            addMoveItemCallback
        } = this.props;

        if(currentList!==null) {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                        <div id="edit-items">
                            {
                                currentList.items.map((i, index) => (
                                    <Top5Item
                                        item={i}
                                        index={index+1}
                                        renameItemCallback={renameItemCallback}
                                        addMoveItemCallback={addMoveItemCallback}
                                    />
                                ))
                                
                            }
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
