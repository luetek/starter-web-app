import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateActivityCollectionRequestDto } from '@luetek/common-models';
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
}
