import {MigrationInterface, QueryRunner} from "typeorm";

export class createStateEntity1597609507704 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "public"."states_state_enum" AS ENUM('Empty', 'HelpRequest')`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telegram_user_id" character varying NOT NULL, "state" "public"."states_state_enum" NOT NULL DEFAULT 'Empty', "note" character varying, "request_id" character varying, CONSTRAINT "UQ_04135b122e3d5947fa527b56b82" UNIQUE ("id"), CONSTRAINT "UQ_50583fddff05dba96fbc8e9fa17" UNIQUE ("telegram_user_id"), CONSTRAINT "PK_04135b122e3d5947fa527b56b82" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_50583fddff05dba96fbc8e9fa1" ON "public"."states" ("telegram_user_id") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "public"."IDX_50583fddff05dba96fbc8e9fa1"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."states"`, undefined);
        await queryRunner.query(`DROP TYPE "public"."states_state_enum"`, undefined);
    }

}
