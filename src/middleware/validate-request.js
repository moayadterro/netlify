module.exports = validateRequest;

function validateRequest(req, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    let errors = {};
    error.details.map((error) => {
      errors[error.path] = error.message;
    });

    next({
      message: "validation error",
      errors,
    });
  } else {
    req.body = value;
    next();
  }
}
