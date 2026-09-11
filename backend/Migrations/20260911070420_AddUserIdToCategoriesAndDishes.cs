using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToCategoriesAndDishes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: add nullable column first (tables already contain data)
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "dishes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "categories",
                type: "integer",
                nullable: true);

            // Step 2: backfill existing rows - prefer the Admin user, fallback to the first user
            migrationBuilder.Sql(@"UPDATE categories SET ""UserId"" = COALESCE(
    (SELECT ""Id"" FROM ""Users"" WHERE ""Username"" = 'Admin' LIMIT 1),
    (SELECT ""Id"" FROM ""Users"" ORDER BY ""Id"" LIMIT 1));");

            migrationBuilder.Sql(@"UPDATE dishes SET ""UserId"" = COALESCE(
    (SELECT ""Id"" FROM ""Users"" WHERE ""Username"" = 'Admin' LIMIT 1),
    (SELECT ""Id"" FROM ""Users"" ORDER BY ""Id"" LIMIT 1));");

            // Step 3: make the column NOT NULL
            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "dishes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "categories",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_dishes_UserId",
                table: "dishes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_categories_UserId",
                table: "categories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_categories_Users_UserId",
                table: "categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_dishes_Users_UserId",
                table: "dishes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_categories_Users_UserId",
                table: "categories");

            migrationBuilder.DropForeignKey(
                name: "FK_dishes_Users_UserId",
                table: "dishes");

            migrationBuilder.DropIndex(
                name: "IX_dishes_UserId",
                table: "dishes");

            migrationBuilder.DropIndex(
                name: "IX_categories_UserId",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "dishes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "categories");
        }
    }
}
