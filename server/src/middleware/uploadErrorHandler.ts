import multer from "multer";
import type { ErrorRequestHandler } from "express";

const uploadErrorHandler: ErrorRequestHandler = (error, request, response, next) => {
    if(error instanceof multer.MulterError ){
        return response.status(400).json({
            message: "Multer error"
        })
    }
    next(error);

}

export default uploadErrorHandler;