using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleArchiving : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Vehicles",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Vehicles");
        }
    }
}
