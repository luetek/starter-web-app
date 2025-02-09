import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventPayload } from '../event-payload';

@Entity()
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requestId: string;

  @Column({ type: 'simple-json' })
  payload: EventPayload;

  @Column()
  type: string;
}
