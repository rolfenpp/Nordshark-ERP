using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpApi.Migrations
{
    public partial class FixGuestCompanyTenant : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                DECLARE
                    target_company_id integer;
                BEGIN
                    SELECT COALESCE(
                        (
                            SELECT "CompanyId"
                            FROM "InventoryItems"
                            WHERE "CompanyId" > 0
                            GROUP BY "CompanyId"
                            ORDER BY COUNT(*) DESC
                            LIMIT 1
                        ),
                        (
                            SELECT "CompanyId"
                            FROM "Invoices"
                            WHERE "CompanyId" > 0
                            GROUP BY "CompanyId"
                            ORDER BY COUNT(*) DESC
                            LIMIT 1
                        ),
                        (SELECT "Id" FROM "Companies" ORDER BY "Id" LIMIT 1)
                    ) INTO target_company_id;

                    IF target_company_id IS NULL THEN
                        INSERT INTO "Companies" ("Name", "CreatedUtc")
                        VALUES ('Nordshark', NOW() AT TIME ZONE 'utc')
                        RETURNING "Id" INTO target_company_id;
                    END IF;

                    UPDATE "AspNetUsers"
                    SET "CompanyId" = target_company_id,
                        "EmailConfirmed" = true
                    WHERE "NormalizedEmail" = 'GUEST@NORDSHARK.COM'
                      AND "CompanyId" = 0;

                    UPDATE "InventoryItems"
                    SET "CompanyId" = target_company_id
                    WHERE "CompanyId" = 0;

                    UPDATE "Projects"
                    SET "CompanyId" = target_company_id
                    WHERE "CompanyId" = 0;

                    UPDATE "Invoices"
                    SET "CompanyId" = target_company_id
                    WHERE "CompanyId" = 0;

                    UPDATE "InvoiceLines"
                    SET "CompanyId" = target_company_id
                    WHERE "CompanyId" = 0;

                    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
                    SELECT u."Id", r."Id"
                    FROM "AspNetUsers" u
                    CROSS JOIN "AspNetRoles" r
                    WHERE u."NormalizedEmail" = 'GUEST@NORDSHARK.COM'
                      AND r."NormalizedName" = 'ADMIN'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM "AspNetUserRoles" ur
                          WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
                      );
                END $$;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
