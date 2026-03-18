using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRepairTypeAndComplaint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Complaint",
                table: "Repairs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairType",
                table: "Repairs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Complaint",
                table: "Repairs");

            migrationBuilder.DropColumn(
                name: "RepairType",
                table: "Repairs");
        }
    }
}
