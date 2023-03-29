import { apiInstance } from "./apiConfig";

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

const login = async (email: string, password: string) => {
  const response = await apiInstance.post("/auth/signin", { email, password });
  let token = response.data.token;
  let role = response.data.role;
  if (token) {
    localStorage.setItem("refresh_token", token);
  }
  if (role) {
    localStorage.setItem("user_role", role);
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
  let role = response.data.role;
  if (token) {
    localStorage.setItem("access_token", token);
  }
  if (role) {
    localStorage.setItem("user_role", role);
  }
};

export { login, getNewAccessToken };
