import { apiInstance } from "./apiConfig";

const login = async (username: string, password: string) => {
  const response = await apiInstance.post("/api/login", { username, password });
  let token = response.data.token;
  if (token) {
    localStorage.setItem("refresh_token", token);
  }
  await getNewAccessToken();
};

const getNewAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const response = await apiInstance.post("/auth/refresh", {
    token: refreshToken,
  });
  let token = response.data.token;
  if (token) {
    localStorage.setItem("access_token", token);
  }
};
