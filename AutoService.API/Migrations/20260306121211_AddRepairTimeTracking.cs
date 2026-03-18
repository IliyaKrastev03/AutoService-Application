using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRepairTimeTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkedHours",
                table: "Repairs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WorkedMinutes",
                table: "Repairs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkedHours",
                table: "Repairs");

            migrationBuilder.DropColumn(
                name: "WorkedMinutes",
                table: "Repairs");
        }
    }
}
