import axios from 'axios';

const createNewComponent = async (data) => {
    try{
        const response = await axios.post('localhost:3000/api/collection/create', data);
    }catch (error){
        console.error("Error creating component: ",error)
    }
};
export default createNewComponent;