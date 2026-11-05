import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1793879115606 implements MigrationInterface {
    name = 'CreateUser1793879115606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_stance_enum" AS ENUM('REGULAR', 'GOOFY')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "age" integer, "hometown" character varying, "stance" "public"."users_stance_enum" NOT NULL DEFAULT 'REGULAR', "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "username" character varying NOT NULL, "isBlocked" boolean NOT NULL DEFAULT false, "profileImageUrl" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_stance_enum"`);
    }

}
