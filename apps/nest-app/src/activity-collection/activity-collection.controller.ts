import { Controller, Get } from '@nestjs/common';
import { ActivityCollectionService } from './activity-collection-service';

@Controller('activity-collections')
export class ActivityCollectionController {
  constructor(private activityCollectionService: ActivityCollectionService) {}

  @Get()
  findAll() {
    return this.findAll();
  }
}
