import React from "react"
import addToMailchimp from "gatsby-plugin-mailchimp"

import { rhythm } from "../utils/typography"

export default class Mail extends React.Component {
  state = {
    email: null,
    firstName: null,
    result: null,
    success: false,
  }

  _handleChange = e => {
    console.log({
      [`${e.target.name}`]: e.target.value,
    })
    this.setState({
      [`${e.target.name}`]: e.target.value,
    })
  }

  _handleSubmit = async e => {
    e.preventDefault()
    const { result, msg } = await addToMailchimp(this.state.email, { FNAME: this.state.firstName })

    if (result !== "success") {
      throw Error(msg)
    } else {
      this.setState({ success: true })
    }

    this.setState({ result: result })
  }

  handleClick = () => {
    this.props.toggle()
  }

  render() {
    return (
      <div className="modal">
        <div className="modal_content">
          <span
            className="close"
            onClick={this.handleClick}
            onKeyDown={this.handleClick}
            role="button"
            tabIndex={0}
          >
            &times;
          </span>
          <form
            onSubmit={this._handleSubmit}
            className={`${this.state.success ? "hidden" : ""}`}
            style={{
              marginBottom: 0,
            }}
          >
            <p
              style={{
                marginBottom: rhythm(1 / 4),
              }}
            >
              Email Address <span style={{ color: "red" }}>*</span>
            </p>
            <input
              required
              type="email"
              onChange={this._handleChange}
              placeholder="Email"
              name="email"
              style={{ marginBottom: rhythm(1 / 4) }}
            />
            <p style={{ marginBottom: rhythm(1 / 4) }}>First Name</p>
            <input
              type="text"
              onChange={this._handleChange}
              placeholder="First Name"
              name="firstName"
              style={{ marginBottom: rhythm(1 / 4) }}
            />
            <br />
            <button type="submit" value="Submit" className="button">
              Submit
            </button>
          </form>
          <div className={`${this.state.success ? "" : "hidden"}`}>
            Thank you for subscribing!
          </div>
        </div>
      </div>
    )
  }
}
