import { BadRequestException, Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ActivityCollectionDto, CreateActivityCollectionRequestDto } from '@luetek/common-models';
import { ActivityCollectionService } from './activity-collection-service';

@Controller('activity-collections')
export class ActivityCollectionController {
  constructor(private activityCollectionService: ActivityCollectionService) {}

  @Get()
  async findAll() {
    return this.activityCollectionService.findAll();
  }

  @Post()
  create(@Body() createReq: CreateActivityCollectionRequestDto) {
    return this.activityCollectionService.create(createReq);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReq: ActivityCollectionDto) {
    if (updateReq.id !== parseInt(id, 10))
      throw new BadRequestException(`param id = ${id} not mataching with data id = ${updateReq.id}`);
    return this.activityCollectionService.update(updateReq);
  }
}
