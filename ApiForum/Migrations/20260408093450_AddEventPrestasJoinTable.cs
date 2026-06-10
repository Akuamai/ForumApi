using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiForum.Migrations
{
    /// <inheritdoc />
    public partial class AddEventPrestasJoinTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "EventPrestas",
                columns: table => new
                {
                    EventId = table.Column<int>(type: "INTEGER", nullable: false),
                    PrestasId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventPrestas", x => new { x.EventId, x.PrestasId });
                    table.ForeignKey(
                        name: "FK_EventPrestas_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventPrestas_Prestas_PrestasId",
                        column: x => x.PrestasId,
                        principalTable: "Prestas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventPrestas_PrestasId",
                table: "EventPrestas",
                column: "PrestasId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventPrestas");

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
    }
}
