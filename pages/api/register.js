import Controller from "@/controller/controllers";
import { asyncHandler } from "@/utils/errorHandler";

export default asyncHandler(async function handler(req, res) {
    if (req.method === 'POST') {
        return Controller.postRegister(req, res);
    }

    res.status(405).end();
});