import { Response } from "express";

// Response class => to handle own response
export default class ResponseGenerator {
    // constructor
    constructor (private statusCode: number, private data: Object) {
        this.statusCode = statusCode;
        this.data = data;
    }

    // send method => to send response back to client with status code and data
    send(response: Response) {
        return response.status(this.statusCode).json(this.data);
    }
}