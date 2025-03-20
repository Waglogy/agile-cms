import React, { Component } from 'react'
import Header from '../../components/Header'
import MenuBar from '../../components/MenuBar'

export class mediaLibrary extends Component {
  render() {
    return (
      <div className="bg-white">
        <Header title="Media Library" />
        <MenuBar />
        <div className="p-4 mt-20 mx-auto bg-white w-full h-screen">
          <h2 className="text-2xl mb-4 text-white">Media Library</h2>
        </div>
      </div>
    )
  }
}

export default mediaLibrary

