import axios from 'axios'

const DeleteComponent = async (data) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/collection/delete-collection',
      data
    )
  } catch (error) {
    console.error(error)
  }
}
export default DeleteComponent
