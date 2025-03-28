import React, { useEffect } from 'react'
import MenuBar from '../../../../components/MenuBar'
import Header from '../../../../components/Header'

const AdminPage = () => {
  const [blogs, setBlogs] = React.useState([])

  useEffect(() => {
    async function loadBlogs() {
      const response = await fetch(
        'http://localhost:3000/api/collection/data/blogs'
      )
      const { data } = await response.json()
      setBlogs(data)
    }

    loadBlogs()
  }, [])

  return (
    <div className="bg-white">
      <Header title="Super Admin" />

      <div className="flex">
        <MenuBar />

        <div className="flex justify-center items-center h-screen pb-100">
          {blogs.map((blog) => {
            return (
              <div key={blog.id} className="flex justify-center items-center">
                <p className="text-black">{blog.title.toString()}</p>
                <p className="text-black">
                  {blog.image.large.imagePath.toString()}
                </p>

                <img
                  src={`http://localhost:3000${blog.image.large.imagePath.toString()}`}
                  alt="sdjkhfjk"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
