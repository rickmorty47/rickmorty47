import {BaseEntity, Column, CreateDateColumn, Entity} from 'typeorm';
import {EMapPointType} from '../types/EMapPointType';

@Entity({ name: 'map_points', schema: 'public' })
export class MapPoint extends BaseEntity {
    @Column('uuid', {
        generated: 'uuid',
        unique: true,
        primary: true,
    })
    public id: string;

    @Column('enum', {
        nullable: false,
        enum: EMapPointType,
        name: 'type'
    })
    public type: EMapPointType;

    @Column('float8', {
        nullable: false,
        name: 'latitude',
    })
    public latitude: number;

    @Column('float8', {
        nullable: false,
        name: 'longitude',
    })
    public longitude: number;

    @Column('varchar', {
        nullable: true,
        name: 'note',
    })
    public note: string | null;

    @CreateDateColumn({
        nullable: true,
        name: 'created_at',
    })
    public createdAt: Date;
}
