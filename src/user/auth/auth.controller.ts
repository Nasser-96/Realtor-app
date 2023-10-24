import { Body, Controller, Get, Param, ParseEnumPipe, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from 'src/user/dtos/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from "bcryptjs"
import ReturnResponse from 'src/helper/returnResponse';

@Controller('auth')
export class AuthController 
{
    constructor(private readonly authService:AuthService){}
    
    @Post("/signup/:userType")
    async signup(@Body() body:SignupDto, @Param("userType",new ParseEnumPipe(UserType)) userType:UserType)
    {
        if(userType !== UserType?.BUYER)
        {
            if(!body.product_key)
            {
                throw new UnauthorizedException(ReturnResponse({},"Unauthorized"))
            }
            const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`

            const isValidProductKey = await bcrypt.compare(validProductKey,body.product_key)

            if(!isValidProductKey)
            {
                throw new UnauthorizedException(ReturnResponse({},"Unauthorized"))
            }
        }
        return this.authService?.signup(body,userType)
    }

    @Post("/signin")
    signin(@Body() body:SigninDto)
    {
        return this.authService?.signin(body)
    }

    @Post("/key")
    generateProductKey(@Body() body:GenerateProductKeyDto)
    {
        return this?.authService.generateProductKey(body?.email,body?.userType)
    }
}
