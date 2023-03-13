import { apiInstance } from "./apiConfig";

const listallkeys = async(user_id : string) => {
     const response = await apiInstance.get(`/auth/api-key/all?target_user_id=${user_id}`);
      return response.data.api_keys;
  };

export {listallkeys};