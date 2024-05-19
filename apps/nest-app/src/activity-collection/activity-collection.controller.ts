import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MapInterceptor } from '@automapper/nestjs';
import { ActivityCollectionDto } from '@luetek/common-models';
import { ActivityCollectionService } from './activity-collection-service';
import { ActivityCollectionJsonEntity } from './json-entities/activity-collection.entity';

@Controller('activity-collections')
export class ActivityCollectionController {
  constructor(private activityCollectionService: ActivityCollectionService) {}

  @Get()
  @UseInterceptors(MapInterceptor(ActivityCollectionJsonEntity, ActivityCollectionDto, { isArray: true }))
  findAll() {
    return this.activityCollectionService.findAll();
  }
}
