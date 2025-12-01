enum httpStatusCodes {
    OK = 200,
    CREATED = 201,
    ALREADY_EXISTS = 409,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
    UN_AUTHORIZED = 401,
    FORBIDDEN = 403,
    MULTI_STATUS = 207,
}

export default httpStatusCodes;