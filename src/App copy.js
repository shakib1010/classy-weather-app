import React from 'react'

class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { count: 0 }
    console.log(this)
  }


  handleDecrement() {
    this.setState((curState) => {
      return { count: curState.count - 1 }
    })
  }

  handleIncrement() {
    this.setState((curState) => {
      return { count: curState.count + 1 }
    })
  }

  render() {
    const date = new Date()
    date.setDate(date.getDate() + this.state.count)

    return (
      <div>
        <button onClick={this.handleDecrement.bind(this)}>-</button>
        {date.toDateString()} [{this.state.count}]
        <button onClick={this.handleIncrement.bind(this)}>+</button>
      </div>
    )
  }
}

export default Counter
