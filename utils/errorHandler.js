export default function errorHandler(err, req, res, next) {
  console.log('$$$$$$$$$$$ errorHandler');
  console.log(err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({"message": "Bad request"});
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }

  return res.status(500).json({"message": "Internal server error"});
}

export const asyncHandler = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('API error:', err);
    res.status(err.statusCode || 500).json({message: err.message || 'Something went wrong'});
  }
};
