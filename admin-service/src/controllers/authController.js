import { ResponseHandler } from "@bookzilla/shared";
import authService from "../services/authService.js";

class AuthController {
  async login(req, res) {
    const result = await authService.login(req.body, req.requestId);
    return ResponseHandler.success(
      res,
      result.token,
      result.message || "Logged in successfully",
      200
    );
  }
}
export default new AuthController();
