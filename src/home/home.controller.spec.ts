import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser =
{
  id:53,
  name:"Nasser",
  email:"nasser@gmail.com",
  phone:'1234567891'
}

const mockHome = 
  {
    id: 1,
    address: "Sevilla",
    city: "Riydah",
    price: 1000000,
    property_type: PropertyType.RESIDENTIAL,
    number_of_bathrooms: 3,
    image: "img10",
    number_of_Bedrooms: 3,
  }

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers:[
        {
          provide:HomeService,
          useValue:
          {
            getHomes:jest.fn().mockReturnValue([]),
            getRealtorByHomeId:jest.fn().mockReturnValue(mockUser),
            updateHome:jest.fn().mockReturnValue(mockHome)
          }
        }, PrismaService]
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe("getHomes",()=>
  {
    it("should construct filter object correctly",async ()=>
    {
      const mockGetHomes = jest.fn().mockReturnValue([])
      jest.spyOn(homeService,'getHomes').mockImplementation(mockGetHomes)
      await controller.getHomes("Abha","1000000")

      expect(mockGetHomes).toBeCalledWith(
        {
          city:"Abha",
          price:
          {
            gte:1000000
          }
        }
      )
    })
  })

  describe("updateHome",()=>
  {
    const mockUserInfo = 
    {
      name:"nasser",
      id:20,
      iat:1,
      exp:3 
    }
    const mockUpdateHomeParam = 
      {
        address:"address",
        number_of_bedrooms:2,
        number_of_bathrooms:3,
        city:"Abha",
        price:2222,
        land_size:1111,
        property_type:PropertyType.RESIDENTIAL,
      }

    it("should throw unauth error if realtor didn't create home",async ()=>
    {
      await expect(controller.updateHome(5,mockUpdateHomeParam,mockUserInfo)).rejects.toThrowError(UnauthorizedException);
    })

    it("should update home if realtor id is valid",async ()=>
    {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome)

      jest.spyOn(homeService, "updateHome").mockImplementation(mockUpdateHome)

      await controller.updateHome(5,mockUpdateHomeParam,{...mockUserInfo,name:"nasser@gmail.com"})

      expect(mockUpdateHome).toBeCalled()
    })
  })
});
