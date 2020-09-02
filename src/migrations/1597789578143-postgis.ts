import {MigrationInterface, QueryRunner} from "typeorm";

export class postgis1597789578143 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('create extension if not exists postgis');
        await queryRunner.query('CREATE INDEX user_coordinates ON public.users USING GIST(GEOGRAPHY(ST_SetSRID(ST_MakePoint(longitude,latitude), 4326)))');
        await queryRunner.query('CREATE INDEX map_point_coordinates ON public.map_points USING GIST(GEOGRAPHY(ST_SetSRID(ST_MakePoint(longitude,latitude), 4326)))');
    }

    public async down(queryRunner: QueryRunner): Promise<any> { 
        await queryRunner.query('DROP INDEX public.user_coordinates');
        await queryRunner.query('DROP INDEX public.map_point_coordinates');
    }

}
