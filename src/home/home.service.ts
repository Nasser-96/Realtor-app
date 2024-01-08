import { BadGatewayException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import ReturnResponse, { ReturnResponseType } from 'src/helper/returnResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { NotFoundError, throwError } from 'rxjs';
import { UserTypeDecorator } from 'src/user/decorators/user.decorator';


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

interface CreateHomeParams
{
    address:string;
    number_of_bedrooms:number;
    number_of_bathrooms:number;
    city:string;
    price:number;
    land_size:number;
    property_type:PropertyType;
    images:{url:string}[]
}

interface UpdateHomeParams
{
    address?:string;
    number_of_bedrooms?:number;
    number_of_bathrooms?:number;
    city?:string;
    price?:number;
    land_size?:number;
    property_type?:PropertyType;
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

    async createHome({address,city,images,land_size,number_of_bathrooms,number_of_bedrooms,price,property_type}:CreateHomeParams, email:string)
    {
        if(!email)
        {
            throw new NotFoundException(ReturnResponse({},"Missing or Invalid User"));
        }

        const userData = await this.prismaService?.user?.findUnique({where:{email:email}});
        
        if(userData?.user_type === "BUYER")
        {
            throw new UnauthorizedException(ReturnResponse({},"This User Not Allowed to Create Home"))
        }

        try
        {   
            const home = await this.prismaService?.home?.create(
                {
                    data:
                    {
                        address,
                        city,
                        land_size,
                        number_of_bathrooms,
                        number_of_bedrooms,
                        price,
                        property_type,
                        realtor_id:userData?.id
                    }
                })
    
            const homeImages = images?.map((image) =>
                {
                    return {...image, home_id:home?.id}
                })

                
                await this.prismaService?.image?.createMany({data: homeImages})
    
            return ReturnResponse(new HomeResponseDto(home),'','Home created successfully')
        }
        catch(e)
        {
            throw new BadGatewayException(ReturnResponse('',"Data Base Error"))
        }
    }

    async updateHome(id:number, body:UpdateHomeParams)
    {
        const home = await this.prismaService?.home?.findUnique(
            {
                where:
                {
                    id
                }
            })

        if(!home)
        {
            throw new NotFoundException(ReturnResponse({},'Home not Found',''))
        }

        const updatedHome = await this.prismaService?.home?.update(
            {
                where:{id},
                data:body
            }
        )
        return ReturnResponse(new HomeResponseDto(updatedHome),'','Home updated successfully')
    }

    async deleteHome(id:number)
    {
        await this.prismaService?.image?.deleteMany(
            {
                where:{home_id:id}
            }
        )
        await this.prismaService?.home?.delete({where:{id}})
        return ReturnResponse({},'','Home deleted  successfully')
    }

    async getRealtorByhomeId(id:number)
    {

        const home = await this.prismaService?.home?.findUnique(
            {
                where:{id:id},
                select:
                {
                    realtor:
                    {
                        select:
                        {
                            name:true,
                            email:true,
                            phone:true,
                            id:true
                        }
                    }
                }
            }
        );

        if(!home)
        {
            throw new NotFoundException(ReturnResponse({},"Home not found"))
        }

        return home?.realtor
    }

    inquire(user:UserTypeDecorator,homeId,message)
    {
        // const realtor = 
    }
}
