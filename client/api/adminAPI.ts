import { apiInstance } from "./apiConfig";

interface Icreatekey
{
  name:string;
  type:string; 
  data_tracking:boolean; 
  target_user_id:string;
  regenerate : boolean;
}

const listallkeys = async(user_id : string) => {
     const response = await apiInstance.get(`/auth/api-key/list?target_user_id=${user_id}`);
      return response.data.api_keys;
  };

const viewadmindashboard = async(user_id : string, limit:number, page:number) => {
    const response = await apiInstance.get(`/services/admin/dashboard?page=${page}&limit=${limit}&target_user_id=${user_id}`);
    return response.data; 
  }

const createkey = async (key_details : Icreatekey) => {
    const response = await apiInstance.post(
      `/auth/api-key`,key_details
    );
    return response.data;
  };

  const setstatus = async ({ name, active, target_user_id }: { name: string, active: boolean, target_user_id:string }) => {
    const response = await apiInstance.patch(`/auth/api-key/modify?api_key_name=${name}&target_user_id=${target_user_id}&active=${active}`);
    return response.data;
  }
  
  const listallusers = async() => {
    const response = await apiInstance.get(`/auth/user/list`);
     return response.data;
 };

 const getkeydata = async({ api_key_name, target_user_id }: { api_key_name: string, target_user_id:string }) =>{
    const response = await apiInstance.get(`/auth/api-key?api_key_name=${api_key_name}&target_user_id=${target_user_id}`)
    return response.data;
 }
export {listallkeys, createkey, setstatus, listallusers, viewadmindashboard, getkeydata};