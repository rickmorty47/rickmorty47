import {BaseEntity, Column, Entity, Index} from 'typeorm';
import {EState} from '../types/EState';

@Entity({ name: 'states', schema: 'public' })
export class State extends BaseEntity {
  @Column('uuid', {
    generated: 'uuid',
    unique: true,
    primary: true,
  })
  public id: string;

  @Index()
  @Column('varchar', {
    nullable: false,
    unique: true,
    name: 'telegram_user_id',
  })
  public telegramUserId: string;

  @Column('enum', {
    nullable: false,
    name: 'state',
    enum: EState,
    default: EState.Empty,
  })
  public state: EState;

  @Column('varchar', {
    nullable: true,
    name: 'note',
  })
  public note?: string;

  @Column('varchar', {
    nullable: true,
    name: 'request_id',
  })
  public requestId?: string;
}