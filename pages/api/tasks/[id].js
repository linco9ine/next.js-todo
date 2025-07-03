import Controller from "@/controller/controllers";
import { asyncHandler } from "@/utils/errorHandler";
import authenticate from "@/utils/authenticate";
import validateIdParam from "@/utils/paramHandler";

export default asyncHandler(async function handler(req, res) {
    await authenticate(req, res);
    validateIdParam(req, res);

    const { method } = req;

    if (method === 'GET') return Controller.getTask(req, res);
    if (method === 'PUT') return Controller.editTask(req, res);
    if (method === 'DELETE') return Controller.deleteTask(req, res);

    res.status(405).end();
});