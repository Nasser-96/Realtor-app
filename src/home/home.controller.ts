import { Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import {ReturnResponseType} from 'src/helper/returnResponse';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

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

    @Post()
    createHome()
    {
        return this.homeService?.createHome()
    }

    @Put(":id")
    updateHome()
    {
        return this.homeService?.updateHome()
    }

    @Delete(":id")
    deleteHome()
    {
        return this.homeService?.deleteHome()
    }
}
