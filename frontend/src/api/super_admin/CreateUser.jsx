import axios from 'axios'

const CreateUser = async (data) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/signup',
      data
    )
    console.log(response.data)
  } catch (error) {
    console.error('Error occured while creating user: ', error)
  }
}
export default CreateUser
