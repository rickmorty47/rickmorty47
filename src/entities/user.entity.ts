import {BaseEntity, Column, Entity, Index, UpdateDateColumn} from 'typeorm';

@Entity({ name: 'users', schema: 'public' })
export class User extends BaseEntity {
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

  @Column('float8', {
    nullable: true,
    name: 'latitude',
  })
  public latitude?: number;

  @Column('float8', {
    nullable: true,
    name: 'longitude',
  })
  public longitude?: number;

  @Column('float8', {
    nullable: false,
    name: 'chat_id',
  })
  public chatId: number;

  @Column('boolean', {
    nullable: false,
    name: 'allow_max_distance',
    default: true
  })
  public allowMaxDistance?: boolean;

  @Column('uuid', {
    nullable: true,
    name: 'point_id',
  })
  public pointId?: string;

  @UpdateDateColumn({
    nullable: true,
    unique: true,
    name: 'updated_at',
  })
  public updatedAt?: Date;
}
