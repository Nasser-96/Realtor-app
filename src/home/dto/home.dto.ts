import { PropertyType } from "@prisma/client"
import { Exclude, Expose } from "class-transformer"

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