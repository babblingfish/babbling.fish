import React from "react"
import {
  mint,
  orange,
  indigo,
  gold,
} from '@radix-ui/colors';


export default class Category extends React.Component {
  getColor = (category) => {
    const colorMap = {
      Tutorial: mint.mint11,
      "How-to": orange.orange11,
      Reference: indigo.indigo11,
      Explanation: gold.gold11,
    }

    if (category in colorMap) {
      return colorMap[category]
    } else {
      return "blue"
    }
  }

  render() {
    const category = this.props.category
    const color = this.getColor(category)

    return (
      <small
        style={{
          color: color,
          borderRadius: "10px",
          padding: "2px 5px 2px 5px",
          fontFamily: `Lora`,
          fontStyle: "italic",
          fontWeight: 600,
        }}
      >
        {category}
      </small>
    )
  }
}
