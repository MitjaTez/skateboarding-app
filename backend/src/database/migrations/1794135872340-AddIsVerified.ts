import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsVerified1794135872340 implements MigrationInterface {
    name = 'AddIsVerified1794135872340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
    }

}
