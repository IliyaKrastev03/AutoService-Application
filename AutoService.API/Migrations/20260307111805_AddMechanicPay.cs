using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMechanicPay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CommissionPercentage",
                table: "Users",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CompensationType",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommissionPercentage",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CompensationType",
                table: "Users");
        }
    }
}
