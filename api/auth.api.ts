import { APIRequestContext } from "@playwright/test";
import { API_BASE } from "../config/baseConfig";

type LoginResponse = {
  access_token: string;
};

export const loginApi = async (
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> => {
  const response = await request.post(`${API_BASE}/users/login`, {
    data: {
      email,
      password,
    },
  });
  const jsonData = (await response.json()) as LoginResponse;
  return jsonData.access_token;
};
