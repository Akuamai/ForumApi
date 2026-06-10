using ApiForum.Data;
using ApiForum.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Contrôleurs ────────────────────────────────────────────────────────────
// Ignore les références circulaires EF Core lors de la sérialisation JSON
// (évite les erreurs 500 sur les relations Event → Registrations → Event...)
builder.Services.AddControllers()
    .AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// ── Swagger ────────────────────────────────────────────────────────────────
// Interface de documentation et test des endpoints (disponible en dev uniquement)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── Base de données ────────────────────────────────────────────────────────
// Connexion SQL Server via la chaîne définie dans appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Identity ───────────────────────────────────────────────────────────────
// Gestion des utilisateurs et rôles avec ASP.NET Core Identity
// Règles : mot de passe min 8 chars + chiffre, 5 tentatives max, email unique
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ── Authentification JWT ───────────────────────────────────────────────────
// Définit JWT Bearer comme schéma d'authentification par défaut
// Le token est validé sur : issuer, audience, durée de vie et signature
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

// ── CORS ───────────────────────────────────────────────────────────────────
// Autorise les requêtes cross-origin depuis le front React en développement
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontPolicy", policy =>
        policy.WithOrigins("http://localhost:5173", "https://localhost:7060", "http://localhost:5171")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ── Middleware de développement ────────────────────────────────────────────
// Swagger uniquement en environnement de développement
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ── Pipeline HTTP ──────────────────────────────────────────────────────────
// Ordre important : Auth → CORS → HTTPS → fichiers statiques → routes
app.UseAuthentication();
app.UseAuthorization();

app.UseCors("FrontPolicy");

app.UseHttpsRedirection();

// Sert les fichiers statiques du front React buildé dans wwwroot/
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Redirige toutes les routes inconnues vers index.html (routing React côté client)
app.MapFallbackToFile("/index.html");

// ── Ouverture automatique du navigateur ────────────────────────────────────
// Déclenché une seule fois quand l'API est prête, depuis le .bat uniquement
app.Lifetime.ApplicationStarted.Register(() =>
{
    Task.Run(async () =>
    {
        await Task.Delay(500);
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("http://localhost:5000") { UseShellExecute = true });
    });
});

// ── Initialisation au démarrage ────────────────────────────────────────────
// Crée les rôles Admin et User s'ils n'existent pas encore en base
// Puis promote admin@test.com en Admin s'il existe sans ce rôle
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "Admin", "User" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = "admin@test.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser != null && !await userManager.IsInRoleAsync(adminUser, "Admin"))
    {
        await userManager.AddToRoleAsync(adminUser, "Admin");
    }
}

app.Run();
