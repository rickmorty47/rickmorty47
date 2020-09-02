import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserPointIdColumn1597615309808 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD COLUMN "point_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "point_id"`);
    }

}
