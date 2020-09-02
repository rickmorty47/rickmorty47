import {MigrationInterface, QueryRunner} from "typeorm";

export class initUsers1597275775382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('create extension if not exists cube;');
        await queryRunner.query('create extension if not exists earthdistance;');
        await queryRunner.query(`CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telegram_user_id" character varying NOT NULL, "latitude" double precision, "longitude" double precision, "chat_id" double precision NOT NULL, "allow_max_distance" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_a6cc71bedf15a41a5f5ee8aea97" UNIQUE ("id"), CONSTRAINT "UQ_748cc2b70a264e162e344881f03" UNIQUE ("telegram_user_id"), CONSTRAINT "PK_a6cc71bedf15a41a5f5ee8aea97" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_748cc2b70a264e162e344881f0" ON "public"."users" ("telegram_user_id") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "public"."IDX_748cc2b70a264e162e344881f0"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."users"`, undefined);
    }

}
