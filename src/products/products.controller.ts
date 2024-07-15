import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NATS_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}


  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.client.send({ cmd: 'create_product'}, createProductDto)
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.client.send({ cmd: 'find_all_product' }, paginationDto )
  }

  @Get(':id')
  async findOneProducts(@Param('id') id: string) {
    try {
      const product = await firstValueFrom(
        this.client.send({ cmd: 'find_one_product' }, { id })
      );

      return product;

    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: number) {
    return this.client.send({ cmd: 'delete_product' }, { id })
  }

  @Patch(':id')
  updatedProduct(@Body() updateProductDtop: UpdateProductDto, @Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'update_product' }, {
      id,
      ...updateProductDtop
    }).pipe(
      catchError(err => { throw new RpcException(err) } )
    )
  }
}
