import { EntityManager, Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService, ClsStore } from 'nestjs-cls';
import { EventPayload } from './event-payload';
import { EventEntity } from './entity/event.entity';
import { EventProcessor } from './event-processor';
import { ReqLogger } from '../logger/req-logger';

@Injectable()
export class EventService {
  private registry = new Map<string, EventProcessor>();

  constructor(
    @InjectRepository(EventEntity) private eventRepository: Repository<EventEntity>,
    private eventEmitter: EventEmitter2,
    private logger: ReqLogger,
    private cls: ClsService<ClsStore>
  ) {
    logger.setContext(EventService.name);
  }

  // Ensure transaction is managed properly using entityManager
  async emit(entityManager: EntityManager, payload: EventPayload) {
    const event = new EventEntity();
    event.type = payload.type;
    event.payload = payload;
    event.requestId = this.cls.getId();
    const eventEn = await entityManager.save(event);
    this.eventEmitter.emit('async-event-created', eventEn);
    return eventEn;
  }

  register(processor: EventProcessor, eventType: string) {
    this.registry.set(eventType, processor);
  }

  unregister(eventType: string) {
    this.registry.delete(eventType);
  }

  // TODO:: If there are items in the event tables, retry them periodically.
  @OnEvent('async-event-created')
  private async handleOrderCreatedEvent(entity: EventEntity): Promise<void> {
    const processor = this.registry.get(entity.type);
    this.cls.set('CLS_ID', entity.requestId);
    this.logger.log(`Processing ${entity.id} of type ${entity.type}`);
    this.eventRepository.manager.transaction(async (entityManager: EntityManager): Promise<void> => {
      const { type } = entityManager.connection.driver.options;
      let eventQueryBuilder = entityManager.createQueryBuilder(EventEntity, 'event');
      if (type === 'postgres') {
        eventQueryBuilder = eventQueryBuilder.setLock('pessimistic_write');
      }
      const entityLocked = await eventQueryBuilder.where({ id: entity.id }).getOne();
      if (processor) {
        await processor.process(entity.payload);
        await entityManager.delete(EventEntity, entityLocked);
        this.logger.log(`Processing done ${entity.id} of type ${entity.type}`);
      }
    });
  }
}
