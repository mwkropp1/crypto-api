// for custom API errors
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // database errors
  if (err.code && err.code.startsWith('ER_')) {
    let info = '';
    if (err.code === 'ER_DUP_ENTRY') {
      // username and email are the only SQL columns set as UNIQUE
      info = err.message.includes('username') ? 'Username already exists' : 'Email already exists';
    }
    return res.status(400).json({
      status: 'error',
      message: info || err.message
    });
  }

  // catch all
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
