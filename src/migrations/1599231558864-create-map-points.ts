import {MigrationInterface, QueryRunner} from "typeorm";

export class createMapPoints1599231558864 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
          `DO $$ BEGIN ` +
          `CREATE TYPE "public"."map_points_type_enum" AS ENUM('AID', 'POLICE', 'ENTRANCE', 'TRANSPORT'); ` +
          `EXCEPTION ` +
          `WHEN duplicate_object THEN null; ` +
          `END $$;`,
          undefined
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "public"."map_points" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."map_points_type_enum" NOT NULL, "latitude" double precision, "longitude" double precision, "note" character varying, "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_0fc049d6dfa16dad950e4a7ccdc" UNIQUE ("id"), CONSTRAINT "PK_0fc049d6dfa16dad950e4a7ccdc" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(
          `DO $$ BEGIN ` +
          `CREATE TYPE "public"."moderators_access_enum" AS ENUM('LOW', 'HIGH', 'ADMIN'); ` +
          `EXCEPTION ` +
          `WHEN duplicate_object THEN null; ` +
          `END $$;`,
          undefined
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "public"."moderators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "password" character varying NOT NULL, "access" "public"."moderators_access_enum" NOT NULL DEFAULT 'LOW', CONSTRAINT "UQ_419d7cad19401565065f84c4a2a" UNIQUE ("id"), CONSTRAINT "UQ_aafb27dc95662c07ffc45bc7757" UNIQUE ("login"), CONSTRAINT "PK_419d7cad19401565065f84c4a2a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_aafb27dc95662c07ffc45bc775" ON "public"."moderators" ("login") `, undefined);

        const exists = await queryRunner.query('SELECT login FROM "moderators" WHERE login = \'root\'');

        if (!exists.length) {
            await queryRunner.query(`INSERT INTO "moderators" (login, password, access) VALUES ( 'root', 'fbff202d660c085306c1db3857c47a3913c3bad390d5eb18c34968547e20fd16', 'ADMIN')`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {

    }

}
