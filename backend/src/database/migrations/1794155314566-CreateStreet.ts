import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStreet1794155314566 implements MigrationInterface {
    name = 'CreateStreet1794155314566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "street_images" ("id" SERIAL NOT NULL, "url" text NOT NULL, "streetId" integer, CONSTRAINT "PK_7d46ade1d62bd18423cfe223a0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."streets_spottype_enum" AS ENUM('Stairset', 'Ledge', 'Rail', 'Bowl', 'Flatground', 'Manual Pad', 'Other')`);
        await queryRunner.query(`CREATE TYPE "public"."streets_besttimetype_enum" AS ENUM('Morning', 'Afternoon', 'Evening', 'Late Night', 'All Day')`);
        await queryRunner.query(`CREATE TYPE "public"."streets_parkingtype_enum" AS ENUM('Street Parking', 'Free Lot', 'Paid Lot', 'No Parking Nearby')`);
        await queryRunner.query(`CREATE TYPE "public"."streets_surfacetype_enum" AS ENUM('Perfect', 'Smooth', 'Rough', 'Cracked / Uneven', 'Sketchy')`);
        await queryRunner.query(`CREATE TYPE "public"."streets_pedestrianstype_enum" AS ENUM('None', 'Few', 'Moderate', 'Many', 'Crowded')`);
        await queryRunner.query(`CREATE TYPE "public"."streets_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "streets" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "spotType" "public"."streets_spottype_enum" NOT NULL, "bestTimeType" "public"."streets_besttimetype_enum" NOT NULL, "parkingType" "public"."streets_parkingtype_enum" NOT NULL, "surfaceType" "public"."streets_surfacetype_enum" NOT NULL, "pedestriansType" "public"."streets_pedestrianstype_enum" NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "description" text NOT NULL DEFAULT '', "status" "public"."streets_status_enum" NOT NULL DEFAULT 'PENDING', "createdById" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e375a3a3ebbc18cf91e72374d94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "street_check_ins" ("id" SERIAL NOT NULL, "streetId" integer NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_39de9ea237a56023eeff00ef5ca" UNIQUE ("streetId", "userId"), CONSTRAINT "PK_37bd07d4984535e37fd3369e985" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
        await queryRunner.query(`ALTER TABLE "street_images" ADD CONSTRAINT "FK_4c59818304ac18188aefe7b329a" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "streets" ADD CONSTRAINT "FK_208de83ee479453c22bea589d17" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "street_check_ins" ADD CONSTRAINT "FK_bf237499c5a98402642cf2675c9" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "street_check_ins" ADD CONSTRAINT "FK_3d330018eef0413a6a3480e518c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "street_check_ins" DROP CONSTRAINT "FK_3d330018eef0413a6a3480e518c"`);
        await queryRunner.query(`ALTER TABLE "street_check_ins" DROP CONSTRAINT "FK_bf237499c5a98402642cf2675c9"`);
        await queryRunner.query(`ALTER TABLE "streets" DROP CONSTRAINT "FK_208de83ee479453c22bea589d17"`);
        await queryRunner.query(`ALTER TABLE "street_images" DROP CONSTRAINT "FK_4c59818304ac18188aefe7b329a"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP TABLE "street_check_ins"`);
        await queryRunner.query(`DROP TABLE "streets"`);
        await queryRunner.query(`DROP TYPE "public"."streets_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."streets_pedestrianstype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."streets_surfacetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."streets_parkingtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."streets_besttimetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."streets_spottype_enum"`);
        await queryRunner.query(`DROP TABLE "street_images"`);
    }

}
