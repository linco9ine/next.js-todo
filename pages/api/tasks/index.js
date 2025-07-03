import Controller from "@/controller/controllers";
import { asyncHandler } from "@/utils/errorHandler";
import authenticate from "@/utils/authenticate";

export default asyncHandler(async function handler(req, res) {
    await authenticate(req, res);
    if (req.method === 'POST') {
        return Controller.addTask(req, res);
    }

    if (req.method === 'GET') {
        return Controller.getTasks(req, res);
    }

    res.status(405).end();
});