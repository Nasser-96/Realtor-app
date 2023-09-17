import { ConflictException, Injectable } from '@nestjs/common';
import ReturnResponse from 'src/helper/returnResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import * as jwt from 'jsonwebtoken'
import {UserType} from '@prisma/client'

interface SignupParams
{
    email:string
    password:string
    name:string
    phone:string
}

@Injectable()
export class AuthService 
{
    constructor( private readonly prismaSirvce:PrismaService){}
    
    async signup({email, password,name, phone}:SignupParams)
    {
        const userExists = await this.prismaSirvce.user.findUnique(
            {
                where:
                {
                    email
                },
            })

            if (userExists)
            {
                throw new ConflictException(ReturnResponse({},[{field:"email",error:"Email Already Exists"}]))
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const user = await this.prismaSirvce?.user.create(
                {
                    data:
                    {
                        email:email,
                        name:name,
                        phone:phone,
                        password:hashedPassword,
                        user_type: UserType.BUYER
                    }
                })

                const token = await jwt.sign(
                    {
                        name,
                        id:user?.id
                    },process.env.JSON_TOKEN_KEY,{expiresIn:3600000})

                return ReturnResponse({user_token: token},'',"User Created Successfully")       
    }
}
