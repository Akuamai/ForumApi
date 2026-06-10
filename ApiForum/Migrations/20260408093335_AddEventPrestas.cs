using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiForum.Migrations
{
    /// <inheritdoc />
    public partial class AddEventPrestas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "Prestas",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prestas_EventId",
                table: "Prestas",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Prestas_Events_EventId",
                table: "Prestas",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Prestas_Events_EventId",
                table: "Prestas");

            migrationBuilder.DropIndex(
                name: "IX_Prestas_EventId",
                table: "Prestas");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Prestas");
        }
    }
}
