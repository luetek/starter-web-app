import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { EventPayload } from '../event-payload';

export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  payload: EventPayload;

  @Column()
  type: string;
}
