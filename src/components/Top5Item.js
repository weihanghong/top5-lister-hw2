import React from "react";

export default class Top5Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.item,
            editActive: false
        }
    }
    handleDoubleClick = (event) => {
        this.handleToggleEdit(event);    
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let textValue = this.state.text;
        console.log("Top5Item handleBlur: " + textValue);
        this.props.renameItemCallback(this.props.index, textValue);
        this.handleToggleEdit();
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("key", event.target.id);
    }
    handleDragOver = (event) => {
        event.preventDefault();
    }
    handleDrop = (event) => {
        event.preventDefault();
        if (event.target.className === "top5-item") {
            let data = event.dataTransfer.getData("key");
            let oldId = data.substring(5);
            let destId = event.target.id.substring(5);
            this.props.addMoveItemCallback(parseInt(oldId), parseInt(destId));
        }
    }
    render() {
        const { index, item } = this.props;

        if (this.state.editActive) {
            return (
                <input
                    id={"item-" + index}
                    className='top5-item'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={item}
                    autoFocus
                />)
        }
        else {
            return (
                <div
                    id={"item-" + index}
                    onDoubleClick={this.handleDoubleClick}
                    //onDrag
                    className={'top5-item'}>
                    <span
                        id={"top5-item-text-" + index}
                        className="top5-item-text"
                        draggable="true"
                        onDragStart={this.handleDragStart}
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDrop}>
                        {item}
                    </span>
                </div>
            );
        }
    }
}