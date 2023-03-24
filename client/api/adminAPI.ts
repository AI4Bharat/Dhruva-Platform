import { apiInstance } from "./apiConfig";

interface Icreatekey
{
  name:string;
  type:string; 
  regenerate:boolean; 
  target_user_id:string;
}

const listallkeys = async(user_id : string) => {
     const response = await apiInstance.get(`/auth/api-key/all?target_user_id=${user_id}`);
      return response.data.api_keys;
  };

const viewadmindashboard = async(user_id : string, limit:number, page:number) => {
    const response = await apiInstance.get(`/services/admin/dashboard?page=${page}&limit=${limit}&target_user_id=${user_id}`);
    return response.data.api_keys; 
  }

const createkey = async (key_details : Icreatekey) => {
    const response = await apiInstance.post(
      `/auth/api-key`,key_details
    );
    return response.data;
  };

  const setstatus = async ({ name, action }: { name: string, action: string }) => {
    const response = await apiInstance.patch(`/auth/api-key/set-status?api_key_name=${name}&action=${action}`);
    return response.data;
  }
  
  const listallusers = async() => {
    const response = await apiInstance.get(`/auth/user/list`);
     return response.data;
 };

export {listallkeys, createkey, setstatus, listallusers, viewadmindashboard};