using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleTransmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Transmission",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Transmission",
                table: "Vehicles");
        }
    }
}
