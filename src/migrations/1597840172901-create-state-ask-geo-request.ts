import {MigrationInterface, QueryRunner} from "typeorm";

export class createStateAskGeoRequest1597840172901 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        // Сорян
        await queryRunner.query(`DROP TABLE IF EXISTS "public"."states" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."states_state_enum"`);

        await queryRunner.query(`CREATE TYPE "public"."states_state_enum" AS ENUM('Empty', 'AskGetPointMenuRequest', 'AskSetPointMenuRequest', 'SetPointMessageRequest', 'SetHelpMessageRequest', 'AskGeoRequest')`);
        await queryRunner.query(`CREATE TABLE "public"."states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telegram_user_id" character varying NOT NULL, "state" "public"."states_state_enum" NOT NULL DEFAULT 'Empty', "note" character varying, "request_id" character varying, CONSTRAINT "UQ_04135b122e3d5947fa527b56b82" UNIQUE ("id"), CONSTRAINT "UQ_50583fddff05dba96fbc8e9fa17" UNIQUE ("telegram_user_id"), CONSTRAINT "PK_04135b122e3d5947fa527b56b82" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_50583fddff05dba96fbc8e9fa1" ON "public"."states" ("telegram_user_id") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        // TODO: поправить эту миграцию
    }

}
