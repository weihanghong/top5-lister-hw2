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
                        className="top5-item-text">
                        {item}
                    </span>
                </div>
            );
        }
    }
}