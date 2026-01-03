import { generateJwtToken, UnauthorizedError } from "@bookzilla/shared";

class AuthService {
  constructor() {}
  async login(payload, requestId) {
    const { email } = payload;
    if (email != "admin@bookzilla.com") {
      throw new UnauthorizedError("Invalid credentials");
    }
    //pwd : admin123
    const token = generateJwtToken(payload);
    return { token, email };
  }
}

export default new AuthService();
