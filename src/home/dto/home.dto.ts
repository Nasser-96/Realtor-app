import { PropertyType } from "@prisma/client"
import { Exclude, Expose, Type } from "class-transformer"
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator"

 export class HomeResponseDto
 {
    id: number
    address: string

    @Exclude()
    number_of_bedrooms: number
    @Expose({name:"numberOfBedrooms"})
    numberOfBedrooms()
    {
        return this?.number_of_bedrooms
    }

    number_of_bathrooms: number
    city: string
    listed_date: Date
    price: number
    land_size: number

    @Exclude()
    created_at: Date
    @Exclude()
    updated_at: Date

    property_type: PropertyType
    realtor_id: number
    @Exclude()
    images

    image:string

    constructor(paritial: Partial<HomeResponseDto>)
    {
        Object.assign(this,paritial);
    }
 }

 export class Image
 {
    @IsString()
    @IsNotEmpty()
    url:string
 }

 export class CreateHomeDto
 {
    @IsString()
    @IsNotEmpty()
    address:string;

    @IsNumber()
    @IsPositive()
    number_of_bedrooms:number;

    @IsNumber()
    @IsPositive()
    number_of_bathrooms:number;

    @IsString()
    @IsNotEmpty()
    city:string;

    @IsNumber()
    @IsPositive()
    price:number;

    @IsNumber()
    @IsPositive()
    land_size:number;

    @IsEnum(PropertyType)
    property_type:PropertyType;

    @IsArray()
    @ValidateNested({each:true})
    @Type(()=> Image)
    images:Image[]
 }

 export class UpdateHomeDto
 {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?:string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    number_of_bedrooms?:number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    number_of_bathrooms?:number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city?:string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?:number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    land_size?:number;

    @IsOptional()
    @IsEnum(PropertyType)
    property_type?:PropertyType;
 }