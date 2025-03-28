import axios from 'axios'

const EditArchitecture = async (data) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/collection/alter',
      data
    )
    console.log('Response:', response.data)
  } catch (error) {
    console.error('Error altering component: ', error)
  }
}

export default EditArchitecture
