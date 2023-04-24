const AppError = require("../utils/appError");

const handleCasteErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  new AppError("Invalid token .Please login again!", 401);
};

const handleJWTExpiredError = () => {
  new AppError("Your token has expired", 401);
};

const sendErrordev = (err, req, res) => {

  if(req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } 
  // Render website
  console.log('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  })  

};

const sendErrorprod = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
  //Operational,trusted error: send msg to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //Programming or other unknown error: don't leak error details
    } 
    //1) Log errors
    console.error("ERROR ", err);
    //2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  } 

  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    })
  } else {
    // Log Error
    console.log('ERROR', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    })
  }

};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrordev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CasteError") error = handleCasteErrorDB(error);
    sendErrorprod(error, req, res);
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // if (error.name === "ValidationError")
    //   error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();

    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorprod(error, req, res);
  }
};
