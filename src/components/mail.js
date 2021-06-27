import React from "react"
import addToMailchimp from "gatsby-plugin-mailchimp"

import { rhythm } from "../utils/typography"

export default class Mail extends React.Component {
  state = {
    email: null,
    result: null,
    success: false,
  }

  _handleChange = (e) => {
    console.log({
      [`${e.target.name}`]: e.target.value,
    })
    this.setState({
      [`${e.target.name}`]: e.target.value,
    })
  }

  _handleSubmit = async (e) => {
    e.preventDefault()
    const { result, msg } = await addToMailchimp(this.state.email)

    if (result !== "success") {
      throw Error(msg)
    } else {
      this.setState({ success: true })
      setTimeout(() => {
        this.handleClick()
      }, 2500) // close after delay
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
          <form
            onSubmit={this._handleSubmit}
            className={`${this.state.success ? "hidden" : ""}`}
            style={{
              marginBottom: 0,
            }}
          >
            <div className="newsletter">
              <input
                required
                type="email"
                onChange={this._handleChange}
                placeholder="Your Email"
                name="email"
                style={{ marginBottom: rhythm(1 / 2) }}
                className="email"
              />
              <button type="submit" value="Submit" className="submit">
                Subscribe
              </button>
            </div>
          </form>
          <div className={`${this.state.success ? "" : "hidden"}`}>
            Thank you for subscribing!
          </div>
        </div>
      </div>
    )
  }
}
