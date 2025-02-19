import axios from 'axios';

const GetData = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/collection/');
        
        return response.data.data.get_all_collections;
    } catch (error) {
        console.error("Error getting Data: ", error);
    }
};

export default GetData