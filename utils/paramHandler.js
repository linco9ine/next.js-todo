export default function validateIdParam(req, res) {
  const { id } = req.query;

  if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) {
    const err = new Error("The URL must contain a 24-character hexadecimal 'id' string.");
    err.statusCode = 400;
    throw err;
  }

  req.taskId = id;
}