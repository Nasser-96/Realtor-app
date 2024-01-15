import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { homeSelect } from './home.service'
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = 
[
  {
    id: 1,
    address: "Sevilla",
    city: "Riydah",
    price: 1000000,
    property_type: PropertyType.RESIDENTIAL,
    number_of_bathrooms: 3,
    image: "img10",
    numberOfBedrooms: 3,
    images:[
      {
        url:'src1'
      }
    ]
  }
]

const mockGetHome = 
  {
    id: 1,
    address: "Sevilla",
    city: "Riydah",
    price: 1000000,
    property_type: PropertyType.RESIDENTIAL,
    number_of_bathrooms: 3,
    image: "img10",
    number_of_Bedrooms: 3,
    images:[
      {
        url:'src1'
      }
    ]
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

const mockImages = 
[
  {
    id:1,
    url:'src1'
  },
  {
    id:2,
    url:'src2'
  },
]

const findUniqueUserId = 1

const mockFindUniqueUser = 
{
  id:findUniqueUserId,
  user_type: "ADMIN"
}

describe('HomeService', () => {
  let service: HomeService;
  let prismaService : PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, 
        {
          provide:PrismaService,
          useValue:
          {
            home:
            {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              findUnique: jest.fn().mockReturnValue(mockGetHome),
              create:jest.fn().mockReturnValue(mockHome),
            },
            image:
            {
              createMany:jest.fn().mockReturnValue(mockImages)
            },
            user:
            {
              findUnique:jest.fn().mockReturnValue(mockFindUniqueUser),
            }
          }
        }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("getHomes",()=>
  {
    const filters = 
    {
      city:"Abha",
      price:
      {
          gte:1000000,
          lte:1500000
      },
      propertyType:PropertyType.RESIDENTIAL
    }

    it("should call prisma home.findMany find with correct params", async ()=>
    {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes)
  
      jest.spyOn(prismaService.home,'findMany').mockImplementation(mockPrismaFindManyHomes)
      
      await service.getHomes(filters)

      expect(mockPrismaFindManyHomes).toBeCalledWith(
        {
          select:
          {
              ...homeSelect,
              images:
              {
                  select: 
                  {
                      url:true,
                  },
                  take:1 //max number of images
              }
          },
          where:filters
      }
      )
    })

    it("should throw not found exception if not homes are found", async ()=>
    {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
  
      jest.spyOn(prismaService.home,'findMany').mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException);
    })
    
    it("should call prisma home.findUnique find with correct params", async ()=>
    {
      const id = 1;
      
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHome)
      
      jest.spyOn(prismaService.home,'findUnique').mockImplementation(mockPrismaFindManyHomes)
      
      await service.getHomeById(id);

      expect(mockPrismaFindManyHomes).toBeCalledWith(
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
      )
    })

    it("should throw not found exception if not home are found", async ()=>
    {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(null);
  
      jest.spyOn(prismaService.home,'findUnique').mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomeById(2)).rejects.toThrowError(NotFoundException);
    })

  })
  describe("createMany",()=>
  {
    const mockCreateHomeParam = 
    {
      address:"address",
      number_of_bedrooms:2,
      number_of_bathrooms:3,
      city:"Abha",
      price:2222,
      land_size:1111,
      property_type:PropertyType.RESIDENTIAL,
      images:mockImages
    }
    it("should call prisma home.create with the correct payload", async ()=>
    {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome)

      jest.spyOn(prismaService.home,"create").mockImplementation(mockCreateHome)

      await service.createHome(mockCreateHomeParam,"GGs")

      expect(mockCreateHome).toBeCalledWith(
        {
          data:
          {
            address:"address",
            number_of_bedrooms:2,
            number_of_bathrooms:3,
            city:"Abha",
            price:2222,
            land_size:1111,
            property_type:PropertyType.RESIDENTIAL,
            realtor_id:findUniqueUserId
          }
        }
      )
    })

    it("should call prisma image.createMany with the correct payload",async ()=>
    {
      const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);

      jest.spyOn(prismaService.image,"createMany").mockImplementation(mockCreateManyImages);
      
      await service.createHome(mockCreateHomeParam,"GGs");

      expect(mockCreateManyImages).toBeCalledWith(
        {
          data:[
            {
              url:"src1",
              home_id:1,
              id:1
            },
            {
              url:"src2",
              home_id:1,
              id:2
            },
          ]
        }
        );
    })
  })
});