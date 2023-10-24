import { Injectable, NotFoundException } from '@nestjs/common';
import ReturnResponse, { ReturnResponseType } from 'src/helper/returnResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { NotFoundError } from 'rxjs';


interface  GetHomesParams
{
    city?:string
    price?:
    {
        gte?:number
        lte?:number
    }
    propertyType?:PropertyType
}

@Injectable()
export class HomeService 
{
    constructor(private readonly prismaService:PrismaService){}

    async getHomes(filter:GetHomesParams):Promise<ReturnResponseType<HomeResponseDto[]>>
    {
        const homes = await this.prismaService?.home?.findMany(
            {
                select:
                {
                    id:true,
                    address:true,
                    city:true,
                    price:true,
                    property_type:true,
                    number_of_bathrooms:true,
                    number_of_bedrooms:true,
                    images:
                    {
                        select: 
                        {
                            url:true,
                        },
                        take:1 //max number of images
                    }
                },
                where:filter
            }
        );
        
        homes?.sort((a,b)=> a.id - b.id);

        if(!homes?.length)
        {
            throw new NotFoundException(ReturnResponse([],"Not Found"));
        }

        return ReturnResponse(homes?.map((home)=> new HomeResponseDto({...home,image:home?.images[0]?.url})));
    }

    async getHomeById(id:number)
    {
        const home = await this.prismaService?.home?.findUnique(
            {
                select:
                {
                    id:true,
                    address:true,
                    city:true,
                    price:true,
                    property_type:true,
                    number_of_bathrooms:true,
                    number_of_bedrooms:true,
                    images:
                    {
                        select: 
                        {
                            url:true,
                        },
                    }
                },
                where:{id:id}
            }
        );

        if(!home)
        {
            throw new NotFoundException(ReturnResponse({},"Not Found"));
        }

        return ReturnResponse(new HomeResponseDto({...home,image:home?.images[0]?.url}));
    }

    createHome()
    {
        return ReturnResponse({},'','Home created successfully')
    }

    updateHome()
    {
        return ReturnResponse({},'','Home updated successfully')
    }

    deleteHome()
    {
        return ReturnResponse({},'','Home deleted  successfully')
    }
}
