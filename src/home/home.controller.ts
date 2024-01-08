import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import ReturnResponse, {ReturnResponseType} from 'src/helper/returnResponse';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, InquireDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User, UserTypeDecorator } from 'src/user/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

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

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Post()
    createHome(@Body() body:CreateHomeDto, @User() user:UserTypeDecorator)
    {
        return this.homeService?.createHome(body, user?.name);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Put(":id")
    async updateHome(@Param("id",ParseIntPipe)id:number, @Body() body:UpdateHomeDto, @User() user:UserTypeDecorator )
    {
        const realtor = await this?.homeService?.getRealtorByhomeId(id);

        if(realtor?.email !== user?.name )
        {
            throw new UnauthorizedException(ReturnResponse({},"You are not Allowed to update this home"))
        }
        
        return this.homeService?.updateHome(id,body)
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
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

    @Post('/inquire/:id')
    inquire(@Param("id",ParseIntPipe) homeId:number, @User() user:UserTypeDecorator, @Body() {message}:InquireDto)
    {
        return this.homeService.inquire(user,homeId,message)
    }
}
