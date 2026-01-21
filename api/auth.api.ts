import { APIRequestContext } from "@playwright/test";

type LoginResponse = {
  access_token: string;
};

export const loginApi = async (
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> => {
  const response = await request.post("https://api.practicesoftwaretesting.com/users/login", {
    data: {
      'email': email,
      'password': password,
    },
  });
  const jsonData = (await response.json()) as LoginResponse;
  return jsonData.access_token;
};
