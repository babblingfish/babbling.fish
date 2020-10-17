import React from "react"
import Mail from "./mail"

export default class PopUp extends React.Component {
  state = {
    visible: false,
  }

  togglePop = () => {
    this.setState({
      visible: !this.state.visible,
    })
  }

  render() {
    return (
      <div>
        <div>
          <p>
            <button
              className="button"
              onClick={this.togglePop}
              onKeyDown={this.togglePop}
              tabIndex={0}
            >
              Newsletter
            </button>
          </p>
          {this.state.visible ? <Mail toggle={this.togglePop} /> : null}
        </div>
      </div>
    )
  }
}
