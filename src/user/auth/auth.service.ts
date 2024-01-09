import { BadGatewayException, ConflictException, Injectable } from '@nestjs/common';
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

interface SigninParams
{
    email:string
    password:string
}

@Injectable()
export class AuthService 
{
    constructor( private readonly prismaSirvce:PrismaService){}
    
    async signup({email, password,name, phone}:SignupParams, userType:UserType)
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
                        user_type: userType
                    }
                })

                const token = await this.generateJWT(user?.email,user.id)

                return ReturnResponse({user_token: token},'',"User Created Successfully")       
    }

    async signin({email,password}:SigninParams)
    {
        const getUserByEmail = await this.prismaSirvce.user.findUnique(
            {
                where:
                {
                    email
                },
            })

            if(!getUserByEmail)
            {
                throw new BadGatewayException(ReturnResponse({},"Email or Password incorrect"))
            }
            const isValidPassword = await bcrypt?.compare(password, getUserByEmail?.password)

            if (getUserByEmail && isValidPassword)
            {
                const token = await this.generateJWT(getUserByEmail?.email,getUserByEmail?.id)

                return ReturnResponse({user_token: token},'',"")   
            }
            else
            {
                throw new BadGatewayException(ReturnResponse({},"Email or Password incorrect"))
            }
    }

    private async generateJWT( name:string,id?:number )
    {
        return jwt.sign(
            {
                name:name,
                id:id
            },process.env.JSON_TOKEN_KEY,{expiresIn:3600000})
    }

    async generateProductKey(email:string, userType:UserType)
    {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`

        return ReturnResponse({token: await bcrypt.hash(string,10)})
    }
}
