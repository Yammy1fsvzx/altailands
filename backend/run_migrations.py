from migrations.update_land_plots import run_migration

if __name__ == "__main__":
    print("Starting database migration...")
    try:
        run_migration()
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Error during migration: {e}") 