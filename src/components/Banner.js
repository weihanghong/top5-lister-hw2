import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const { title, closeCallback, undoCallnback, redoCallback } = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar 
                    closeCallback = {closeCallback}
                    undoCallnback = {undoCallnback}
                    redoCallback = {redoCallback}
                    />
            </div>
        );
    }
}