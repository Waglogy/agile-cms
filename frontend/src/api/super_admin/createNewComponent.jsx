import axios from 'axios';

const createNewComponent = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/api/collection/create', data);
        // console.log('Response:', response.data);
    } catch (error) {
        console.error("Error creating component: ", error);
    }
};

export default createNewComponent;