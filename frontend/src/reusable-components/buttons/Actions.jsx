import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const Actions = ({
  openDropdown,
  setOpenDropdown,
  components,
  handleDragStart,
}) => {
  return (
    <div className="flex gap-3 mt-5">
      <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
        Save
      </button>
      <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
        Publish
      </button>
    </div>
  )
}
export default Actions
