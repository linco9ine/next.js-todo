import Controller from "@/controller/controllers";
import { asyncHandler } from "@/utils/errorHandler";
import authenticate from "@/utils/authenticate";

export default asyncHandler(async function handler(req, res) {
    await authenticate(req, res);
    return Controller.authCheck(req, res);
});