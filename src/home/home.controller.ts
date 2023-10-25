import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import ReturnResponse, {ReturnResponseType} from 'src/helper/returnResponse';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User, UserTypeDecorator } from 'src/user/decorators/user.decorator';

@Controller('home')
export class HomeController 
{

    constructor(private readonly homeService:HomeService){}

    @Get()
    getHomes(
            @Query('city') city?:string, 
            @Query('minPrice') minPrice?:string, 
            @Query('maxPrice') maxPrice?:string, 
            @Query('propertyType') propertyType?:PropertyType
        ):Promise<ReturnResponseType<HomeResponseDto[]>>
    {
        const price = maxPrice || minPrice 
        ? 
            {
                ...(minPrice && {gte:parseFloat(minPrice)}),
                ...(maxPrice && {lte:parseFloat(maxPrice)}),
            }
        : 
            undefined

        const filters = 
        {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType})
        }
        return this.homeService?.getHomes(filters);
    }

    @Get(':id')
    getHomeById(@Param('id', ParseIntPipe) id:number)
    {
        return this.homeService?.getHomeById(id)
    }

    // @Role(UserType?.REALTOR, UserType?.ADMIN)
    @Post()
    createHome(@Body() body:CreateHomeDto, @User() user:UserTypeDecorator)
    {
        return this.homeService?.createHome(body, user?.name)
    }

    @Put(":id")
    async updateHome(@Param("id",ParseIntPipe)id:number, @Body() body:UpdateHomeDto, @User() user:UserTypeDecorator )
    {
        const realtor = await this?.homeService?.getRealtorByhomeId(id);

        if(realtor?.email !== user?.name )
        {
            throw new UnauthorizedException(ReturnResponse({},"You are not Allowed not update this home"))
        }
        
        return this.homeService?.updateHome(id,body)
    }

    @Delete(":id")
    async deleteHome(@Param("id",ParseIntPipe)id:number, @User() user:UserTypeDecorator)
    {
        const realtor = await this?.homeService?.getRealtorByhomeId(id);

        if(realtor?.email !== user?.name )
        {
            throw new UnauthorizedException(ReturnResponse({},"You are not Allowed not delete this home"))
        }

        return this.homeService?.deleteHome(id)
    }
}
