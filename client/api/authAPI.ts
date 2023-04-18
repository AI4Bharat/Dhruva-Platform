import { apiInstance } from "./apiConfig";

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

const login = async (email: string, password: string) => {
  const response = await apiInstance.post("/auth/signin", { email, password });
  let token = response.data.token;
  if (token) {
    localStorage.setItem("refresh_token", token);
  }
  await timeout(500);
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

export { login, getNewAccessToken };
