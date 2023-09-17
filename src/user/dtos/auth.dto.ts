import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator"

export class SignupDto
{
    @IsString()
    @IsNotEmpty()
    name:string

    @Matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,{message:"Phone must be valid phone number"})
    phone:string

    @IsEmail()
    email:string

    @IsString()
    @MinLength(5)
    password:string
}