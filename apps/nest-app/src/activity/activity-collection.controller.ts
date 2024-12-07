import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ActivityCollectionDto,
  ActivityDto,
  CreateActivityCollectionRequestDto,
  CreateActivityRequestDto,
} from '@luetek/common-models';
import { ActivityCollectionService } from './services/activity-collection-service';
import { ActivityService } from './services/activity.service';

@Controller('activity-collections')
export class ActivityCollectionController {
  constructor(
    private activityCollectionService: ActivityCollectionService,
    private activityService: ActivityService
  ) {}

  // TODO:: Pagination when we have enough data.
  @Get()
  async findAll() {
    return this.activityCollectionService.findAll();
  }

  @Post()
  create(@Body() createReq: CreateActivityCollectionRequestDto) {
    return this.activityCollectionService.create(createReq);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityCollectionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReq: ActivityCollectionDto) {
    if (updateReq.id !== parseInt(id, 10))
      throw new BadRequestException(`param id = ${id} not mataching with data id = ${updateReq.id}`);
    return this.activityCollectionService.update(updateReq);
  }

  /**
   * Activity Section of controller
   */

  @Post(':collectionId/activities')
  async createActivity(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Body(new ValidationPipe()) createReq: CreateActivityRequestDto
  ) {
    return this.activityService.create(collectionId, createReq);
  }

  @Put(':collectionId/activities/:id')
  async updateActivity(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateReq: ActivityDto
  ) {
    return this.activityService.update(collectionId, id, updateReq);
  }

  @Get(':collectionId/activities')
  async findAllActivities(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.activityService.findAll(collectionId);
  }
}
