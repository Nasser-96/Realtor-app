import { BadGatewayException, BadRequestException, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { AppService } from './app.service';
import ReturnResponse from './helper/returnResponse';

@Controller("*")
export class AppController 
{
    noPathFoundResponse()
    {
        throw new NotFoundException(ReturnResponse("This Url Incorrect"));
    }
}
