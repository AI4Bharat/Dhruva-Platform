import { apiInstance } from "./apiConfig";

interface Icreatekey
{
  name:string;
  type:string; 
  regenerate:boolean; 
  user_id:string;
}

const listallkeys = async(user_id : string) => {
     const response = await apiInstance.get(`/auth/api-key/all?target_user_id=${user_id}`);
      return response.data.api_keys;
  };

const createkey = async (key_details : Icreatekey) => {
    const response = await apiInstance.post(
      `/auth/api-key`,key_details
    );
    return response.data;
  };
export {listallkeys, createkey};